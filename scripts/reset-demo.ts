// Nightly demo reset (GitHub Actions, .github/workflows/reset-demo.yml): deletes every
// order and customer and puts each demo product's stock back to its seed value.
// Keeps the catalogue, wilayas and users. Run with: npm run db:reset-demo
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { Prisma, PrismaClient } from "../lib/generated/prisma/client";
import { DEMO_PRODUCTS, demoSku } from "../prisma/data/demo-products";

export async function resetDemo(prisma: PrismaClient): Promise<{ ordersDeleted: number; customersDeleted: number }> {
  const seedStock = DEMO_PRODUCTS.flatMap((p) => p.variants.map((v, i) => Prisma.sql`(${demoSku(p.slug, i)}, ${v.stock}::int)`));

  return prisma.$transaction(async (tx) => {
    await tx.orderStatusHistory.deleteMany();
    await tx.orderItem.deleteMany();
    const orders = await tx.order.deleteMany();
    const customers = await tx.customer.deleteMany();

    // No orders left, so nothing is reserved; demo variants get their seed stock back.
    await tx.productVariant.updateMany({ where: { reservedStock: { not: 0 } }, data: { reservedStock: 0 } });
    await tx.$executeRaw`
      UPDATE "ProductVariant" AS v
      SET "physicalStock" = s.stock, "updatedAt" = now()
      FROM (VALUES ${Prisma.join(seedStock)}) AS s(sku, stock)
      WHERE v."sku" = s.sku`;

    return { ordersDeleted: orders.count, customersDeleted: customers.count };
  });
}

// Run only when executed directly (tests import resetDemo).
if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/reset-demo.ts")) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  resetDemo(prisma)
    .then((r) => console.log(`Demo reset: ${r.ordersDeleted} orders and ${r.customersDeleted} customers deleted, stock restored.`))
    .catch((error) => {
      console.error("Demo reset failed:", error instanceof Error ? error.message : error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
