import "server-only";
import { prisma } from "./prisma";
import { Prisma } from "./generated/prisma/client";
import { getDeliveryFee, isDeliveryType } from "./delivery";
import { MAX_QTY_PER_ITEM } from "./order-limits";
import { TEST_CUSTOMER } from "./demo";
import type { OrderSummary } from "./whatsapp";

const MAX_LINES = 20;
// Fake-order guard: open orders (not yet confirmed) allowed per phone per hour.
const MAX_OPEN_ORDERS_PER_PHONE_PER_HOUR = 3;
// In the demo every visitor may use the same test number, so it gets a higher cap.
const MAX_OPEN_ORDERS_TEST_PHONE_PER_HOUR = 50;

export type PlaceOrderResult =
  | { ok: true; orderId: string; slugs: string[]; summary: OrderSummary }
  | { ok: false; error: string; field?: "fullName" | "phone" | "wilaya" | "deliveryType" | "items" };

class OrderError extends Error {
  constructor(
    message: string,
    readonly field: "items" | null = "items"
  ) {
    super(message);
  }
}

/** Algerian mobile number -> "0XXXXXXXXX", or null if invalid. Accepts +213 / 00213 prefixes. */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/[\s.\-()]/g, "");
  if (digits.startsWith("+213")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("00213")) digits = "0" + digits.slice(5);
  else if (digits.startsWith("213") && digits.length === 12) digits = "0" + digits.slice(3);
  return /^0[567]\d{8}$/.test(digits) ? digits : null;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

/**
 * Creates a NEW cash-on-delivery order. `input` comes straight from the browser,
 * so everything is validated here and prices/fees are recomputed server-side.
 * `ctx.storeSlug` is the brand the order was placed on; it comes from the server
 * (the request's brand), never from the browser.
 */
export async function createOrder(input: unknown, ctx: { storeSlug: string }): Promise<PlaceOrderResult> {
  if (!isRecord(input)) return { ok: false, error: "Requête invalide." };

  // Honeypot: a hidden field real customers never fill in.
  if (typeof input.website === "string" && input.website.trim() !== "") {
    return { ok: false, error: "Nous n'avons pas pu enregistrer votre commande. Réessayez." };
  }

  const fullName = typeof input.fullName === "string" ? input.fullName.trim().replace(/\s+/g, " ") : "";
  if (fullName.length < 3 || fullName.length > 80) {
    return { ok: false, field: "fullName", error: "Entrez votre nom complet." };
  }

  const phone = typeof input.phone === "string" ? normalizePhone(input.phone) : null;
  if (!phone) {
    return { ok: false, field: "phone", error: "Entrez un numéro de mobile valide (05, 06 ou 07…)." };
  }

  if (!isDeliveryType(input.deliveryType)) {
    return { ok: false, field: "deliveryType", error: "Choisissez la livraison à domicile ou au bureau de livraison." };
  }
  const deliveryType = input.deliveryType;

  const wilaya =
    typeof input.wilayaId === "string" && /^\d+$/.test(input.wilayaId)
      ? await prisma.wilaya.findFirst({ where: { id: BigInt(input.wilayaId), active: true } })
      : null;
  if (!wilaya) return { ok: false, field: "wilaya", error: "Choisissez votre wilaya." };

  // Items: merge duplicate lines, validate quantities.
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > MAX_LINES) {
    return { ok: false, field: "items", error: "Votre panier est vide." };
  }
  const quantities = new Map<string, number>();
  for (const item of input.items) {
    if (
      !isRecord(item) ||
      typeof item.variantId !== "string" ||
      !/^\d+$/.test(item.variantId) ||
      !Number.isInteger(item.quantity) ||
      (item.quantity as number) < 1
    ) {
      return { ok: false, field: "items", error: "Votre panier contient un article invalide." };
    }
    quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + (item.quantity as number));
  }
  for (const qty of quantities.values()) {
    if (qty > MAX_QTY_PER_ITEM) {
      return { ok: false, field: "items", error: `Vous pouvez commander au maximum ${MAX_QTY_PER_ITEM} exemplaires de chaque article.` };
    }
  }

  // Fee comes from the delivery provider, outside the DB transaction.
  const fee = await getDeliveryFee(wilaya.code, deliveryType);
  if (fee === null) {
    return { ok: false, field: "deliveryType", error: "Ce mode de livraison n'est pas disponible pour votre wilaya." };
  }

  // Lock rows in a consistent order so concurrent checkouts can't deadlock.
  const lines = [...quantities.entries()]
    .map(([variantId, quantity]) => ({ variantId: BigInt(variantId), quantity }))
    .sort((a, b) => (a.variantId < b.variantId ? -1 : 1));

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Serialize checkouts from the same phone (released at commit/rollback), so
      // parallel submissions can't all pass the open-order limit at once.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${phone}))`;
      const openOrders = await tx.order.count({
        where: {
          customer: { phone },
          status: { in: ["NEW", "CALLED", "CUSTOMER_UNREACHABLE"] },
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      });
      const isDemoTestPhone = process.env.DEMO_MODE === "true" && phone === normalizePhone(TEST_CUSTOMER.phone);
      if (openOrders >= (isDemoTestPhone ? MAX_OPEN_ORDERS_TEST_PHONE_PER_HOUR : MAX_OPEN_ORDERS_PER_PHONE_PER_HOUR)) {
        throw new OrderError("Vous avez déjà des commandes en attente de confirmation. Nous vous appellerons très bientôt.", null);
      }

      const variants = await tx.productVariant.findMany({
        where: { id: { in: lines.map((l) => l.variantId) }, active: true, product: { active: true } },
        include: { product: { select: { name: true, slug: true } } },
      });
      const byId = new Map(variants.map((v) => [v.id, v]));

      let subtotal = new Prisma.Decimal(0);
      for (const line of lines) {
        const variant = byId.get(line.variantId);
        if (!variant) throw new OrderError("Certains articles de votre panier ne sont plus disponibles. Vérifiez votre panier.");

        // Atomic check-and-reserve: only succeeds if enough unreserved stock remains.
        const reserved = await tx.$executeRaw`
          UPDATE "ProductVariant"
          SET "reservedStock" = "reservedStock" + ${line.quantity}, "updatedAt" = now()
          WHERE "id" = ${line.variantId} AND "physicalStock" - "reservedStock" >= ${line.quantity}`;
        if (reserved !== 1) {
          const label = [variant.product.name, variant.size].filter(Boolean).join(" – ");
          throw new OrderError(`Stock insuffisant pour ${label}. Mettez à jour votre panier.`);
        }
        subtotal = subtotal.add(variant.price.mul(line.quantity));
      }

      const deliveryFee = new Prisma.Decimal(fee);

      const existing = await tx.customer.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
      const customer = existing
        ? await tx.customer.update({ where: { id: existing.id }, data: { fullName, wilayaId: wilaya.id } })
        : await tx.customer.create({ data: { fullName, phone, wilayaId: wilaya.id } });

      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          wilayaId: wilaya.id,
          deliveryType,
          subtotal,
          deliveryFee,
          total: subtotal.add(deliveryFee),
          status: "NEW",
          storeSlug: ctx.storeSlug,
          items: {
            create: lines.map((line) => {
              const v = byId.get(line.variantId)!;
              return {
                variantId: v.id,
                quantity: line.quantity,
                priceAtPurchase: v.price,
                productNameAtPurchase: v.product.name,
                colorAtPurchase: v.color,
                sizeAtPurchase: v.size,
              };
            }),
          },
          statusHistory: { create: { status: "NEW" } },
        },
        select: { id: true },
      });

      const orderId = order.id.toString();
      const summary: OrderSummary = {
        orderId,
        customerName: fullName,
        items: lines.map((line) => {
          const v = byId.get(line.variantId)!;
          return { name: v.product.name, version: [v.size, v.color].filter(Boolean).join(" · ") || null, quantity: line.quantity, unitPrice: v.price.toNumber() };
        }),
        wilaya: wilaya.name,
        commune: null, // chosen with the customer on the confirmation call
        deliveryFee: deliveryFee.toNumber(),
        total: subtotal.add(deliveryFee).toNumber(),
      };
      return { orderId, slugs: [...new Set(variants.map((v) => v.product.slug))], summary };
    });

    return { ok: true, ...result };
  } catch (error) {
    if (error instanceof OrderError) return { ok: false, field: error.field ?? undefined, error: error.message };
    throw error;
  }
}
