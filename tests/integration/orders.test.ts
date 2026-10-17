import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/lib/orders";
import { changeOrderStatus } from "@/lib/admin/orders";

// Runs only with TEST_DATABASE_URL set (a Neon branch). tests/setup.ts points
// DATABASE_URL at it before these imports connect; importing alone opens no connection.
const enabled = Boolean(process.env.TEST_DATABASE_URL);

describe.skipIf(!enabled)("orders (integration, test database)", () => {
  const SLUG = "it-orders-test";
  const PHONES = Array.from({ length: 8 }, (_, i) => `0559000${String(i).padStart(3, "0")}`);
  let variantId = "";
  let wilayaId = "";
  let staffId = BigInt(0);

  const order = (phone: string, quantity = 1, extra: object = {}) =>
    createOrder({ fullName: "Integration Test", phone, wilayaId, deliveryType: "STOP_DESK", items: [{ variantId, quantity }], ...extra });
  const stock = () => prisma.productVariant.findUniqueOrThrow({ where: { id: BigInt(variantId) } });

  beforeAll(async () => {
    const product = await prisma.product.create({
      data: { slug: SLUG, name: "IT Product", variants: { create: [{ sku: "IT-ORD-M", size: "M", price: 4000, physicalStock: 8 }] } },
      include: { variants: true },
    });
    variantId = product.variants[0].id.toString();
    wilayaId = (await prisma.wilaya.findFirstOrThrow({ where: { code: "16" } })).id.toString();
    staffId = (await prisma.user.create({ data: { email: "it-staff@noir.test", name: "IT", role: "STAFF", passwordHash: "x" } })).id;
  });

  afterAll(async () => {
    const customers = await prisma.customer.findMany({ where: { phone: { in: PHONES } }, select: { id: true } });
    await prisma.order.deleteMany({ where: { customerId: { in: customers.map((c) => c.id) } } });
    await prisma.customer.deleteMany({ where: { id: { in: customers.map((c) => c.id) } } });
    await prisma.product.deleteMany({ where: { slug: SLUG } });
    await prisma.user.deleteMany({ where: { email: "it-staff@noir.test" } });
    await prisma.$disconnect();
  });

  it("charges the database price, not what the browser sends", async () => {
    const r = await order(PHONES[0], 1, { subtotal: 1, total: 1 });
    expect(r.ok).toBe(true);
    const saved = await prisma.order.findFirstOrThrow({ where: { customer: { phone: PHONES[0] } } });
    expect(saved.subtotal.toNumber()).toBe(4000);
    expect((await stock()).reservedStock).toBe(1);
  });

  it("never oversells when two customers race for the last units", async () => {
    // 7 left; two orders of 5 at once -> exactly one wins
    const [a, b] = await Promise.all([order(PHONES[1], 5), order(PHONES[2], 5)]);
    expect([a, b].filter((r) => r.ok)).toHaveLength(1);
    const s = await stock();
    expect(s.reservedStock).toBeLessThanOrEqual(s.physicalStock);
  });

  it("limits open orders per phone, even under a burst", async () => {
    await prisma.productVariant.update({ where: { id: BigInt(variantId) }, data: { physicalStock: 100 } });
    const burst = await Promise.all(Array.from({ length: 6 }, () => order(PHONES[3])));
    expect(burst.filter((r) => r.ok)).toHaveLength(3);
  });

  it("releases reserved stock when an order is canceled", async () => {
    const r = await order(PHONES[4]);
    if (!r.ok) throw new Error(r.error);
    const before = (await stock()).reservedStock;
    const res = await changeOrderStatus(r.orderId, "NEW", "CANCELED", { id: staffId, email: "it-staff@noir.test", name: "IT", role: "STAFF" });
    expect(res.ok).toBe(true);
    expect((await stock()).reservedStock).toBe(before - 1);
  });
});
