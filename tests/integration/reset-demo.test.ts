import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/lib/orders";
import { resetDemo } from "@/scripts/reset-demo";
import { DEMO_PRODUCTS, demoSku } from "@/prisma/data/demo-products";

// Runs only with TEST_DATABASE_URL set (a Neon branch); it deletes every order there.
const enabled = Boolean(process.env.TEST_DATABASE_URL);

describe.skipIf(!enabled)("resetDemo (integration, test database)", () => {
  const sample = DEMO_PRODUCTS.slice(0, 2); // two demo products are enough to prove the restore
  const skus = sample.flatMap((p) => p.variants.map((_, i) => demoSku(p.slug, i)));
  const seedStock = new Map(sample.flatMap((p) => p.variants.map((v, i) => [demoSku(p.slug, i), v.stock] as const)));
  let wilayaId = "";
  const created: string[] = []; // only these are removed afterwards; a seeded branch keeps its catalogue

  beforeAll(async () => {
    for (const p of sample) {
      if (await prisma.product.findUnique({ where: { slug: p.slug } })) {
        // Already seeded: push the stock off its seed value, as after a day of demo use.
        for (const [i, v] of p.variants.entries()) {
          await prisma.productVariant.update({ where: { sku: demoSku(p.slug, i) }, data: { physicalStock: v.stock + 7 } });
        }
        continue;
      }
      created.push(p.slug);
      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          maker: p.maker,
          // Stock deliberately off from the seed values, as after a day of demo use.
          variants: { create: p.variants.map((v, i) => ({ sku: demoSku(p.slug, i), size: v.version, price: v.price, physicalStock: v.stock + 7 })) },
        },
      });
    }
    wilayaId = (await prisma.wilaya.findFirstOrThrow({ where: { code: "16" } })).id.toString();
  });

  afterAll(async () => {
    await prisma.product.deleteMany({ where: { slug: { in: created } } });
    await prisma.$disconnect();
  });

  it("deletes orders and customers and restores the seed stock", async () => {
    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { sku: skus[0] } });
    for (const phone of ["0559100001", "0559100002"]) {
      const r = await createOrder(
        { fullName: "Reset Test", phone, wilayaId, deliveryType: "STOP_DESK", items: [{ variantId: variant.id.toString(), quantity: 1 }] },
        { storeSlug: "volta" }
      );
      if (!r.ok) throw new Error(r.error);
    }
    const [products, users] = await Promise.all([prisma.product.count(), prisma.user.count()]);

    const result = await resetDemo(prisma);

    expect(result.ordersDeleted).toBeGreaterThanOrEqual(2);
    expect(result.customersDeleted).toBeGreaterThanOrEqual(2);
    expect(await prisma.order.count()).toBe(0);
    expect(await prisma.orderItem.count()).toBe(0);
    expect(await prisma.orderStatusHistory.count()).toBe(0);
    expect(await prisma.customer.count()).toBe(0);
    for (const v of await prisma.productVariant.findMany({ where: { sku: { in: skus } } })) {
      expect(v.physicalStock, v.sku).toBe(seedStock.get(v.sku));
      expect(v.reservedStock, v.sku).toBe(0);
    }
    expect(await prisma.product.count()).toBe(products);
    expect(await prisma.user.count()).toBe(users);
  });
});
