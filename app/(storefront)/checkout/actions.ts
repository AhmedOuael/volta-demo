"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog";
import { getCartVariants, type CartVariantInfo } from "@/lib/catalog";
import { getDeliveryFee, type DeliveryType } from "@/lib/delivery";
import { createOrder } from "@/lib/orders";
import { getBrand } from "@/lib/brand/server";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";

// Server Functions are reachable by direct POST, so every argument is
// treated as untrusted input.

const isIdString = (v: unknown): v is string => typeof v === "string" && /^\d{1,18}$/.test(v);

export async function refreshCart(variantIds: unknown): Promise<Record<string, CartVariantInfo>> {
  if (!Array.isArray(variantIds)) return {};
  const ids = variantIds.filter(isIdString).slice(0, 50).map(BigInt);
  return ids.length ? getCartVariants(ids) : {};
}

/** Fee per delivery type for a wilaya; null means that type can't be delivered there. */
export async function quoteDelivery(wilayaId: unknown): Promise<Record<DeliveryType, number | null>> {
  const wilaya = isIdString(wilayaId)
    ? await prisma.wilaya.findFirst({ where: { id: BigInt(wilayaId), active: true } })
    : null;
  if (!wilaya) return { HOME: null, STOP_DESK: null };
  const [home, desk] = await Promise.all([
    getDeliveryFee(wilaya.code, "HOME"),
    getDeliveryFee(wilaya.code, "STOP_DESK"),
  ]);
  return { HOME: home, STOP_DESK: desk };
}

export type PlaceOrderResponse =
  | { ok: true; orderId: string; whatsappUrl: string | null }
  | { ok: false; error: string; field?: "fullName" | "phone" | "wilaya" | "deliveryType" | "items" };

export async function placeOrder(input: unknown): Promise<PlaceOrderResponse> {
  // The brand comes from the request (set by proxy.ts), never from the form.
  const brand = await getBrand();
  const result = await createOrder(input, { storeSlug: brand.slug });
  if (!result.ok) return result;

  // Ordered items now show less available stock.
  updateTag(CATALOG_TAG);
  revalidatePath("/");
  revalidatePath("/products");
  for (const slug of result.slugs) revalidatePath(`/products/${slug}`);
  return { ok: true, orderId: result.orderId, whatsappUrl: buildWhatsAppOrderLink(result.summary, process.env.STORE_WHATSAPP, brand) };
}
