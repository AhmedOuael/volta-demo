// Rebuilds the demo store from scratch: wilayas + communes, the 40-product
// catalogue, and the two accounts (Willou's ADMIN and the read-only DEMO login).
// Deletes every order, customer and product first. Run with: npm run db:seed-demo
import "dotenv/config";
import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../lib/auth/password";
import { CATEGORIES } from "../lib/categories";
import { DEMO_PRODUCTS, demoImage, demoSku } from "./data/demo-products";

const ADMIN_EMAIL = "willou@ahmedouael.com";
const DEMO_EMAIL = "demo@ahmedouael.com";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function requiredPassword(name: "ADMIN_PASSWORD" | "DEMO_PASSWORD") {
  const value = process.env[name];
  if (!value || value.length < MIN_PASSWORD_LENGTH) throw new Error(`${name} must be set (min ${MIN_PASSWORD_LENGTH} characters).`);
  return value;
}

async function main() {
  const adminPassword = requiredPassword("ADMIN_PASSWORD");
  const demoPassword = requiredPassword("DEMO_PASSWORD");

  // Wilayas and communes: the existing seeds are idempotent (upsert / skipDuplicates).
  for (const script of ["prisma/seed.ts", "prisma/seed-communes.ts"]) {
    execFileSync("npx", ["tsx", script], { stdio: "inherit", shell: process.platform === "win32" });
  }

  await prisma.$transaction([
    prisma.orderStatusHistory.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.product.deleteMany(), // cascades to images, variants and category links
    prisma.category.deleteMany(),
  ]);

  const categoryId = new Map<string, bigint>();
  for (const name of CATEGORIES) {
    const c = await prisma.category.create({ data: { name } });
    categoryId.set(name, c.id);
  }

  // Oldest first, so the first products in the list show as the newest.
  for (const p of [...DEMO_PRODUCTS].reverse()) {
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        maker: p.maker,
        description: p.description,
        specs: p.specs,
        categories: { create: { categoryId: categoryId.get(p.category)! } },
        images: { create: { imageUrl: demoImage(p.slug), isPrimary: true, displayOrder: 0 } },
        variants: {
          create: p.variants.map((v, i) => ({
            sku: demoSku(p.slug, i),
            size: v.version,
            color: v.color ?? null,
            price: v.price,
            physicalStock: v.stock,
          })),
        },
      },
    });
  }

  for (const [email, name, role, password] of [
    [ADMIN_EMAIL, "Willou", "ADMIN", adminPassword],
    [DEMO_EMAIL, "Démo", "DEMO", demoPassword],
  ] as const) {
    const passwordHash = await hashPassword(password);
    await prisma.user.upsert({
      where: { email },
      update: { name, role, passwordHash, active: true, failedLoginCount: 0, lockedUntil: null },
      create: { email, name, role, passwordHash },
    });
  }

  const products = await prisma.product.count();
  const variants = await prisma.productVariant.count();
  console.log(`Seeded ${products} products (${variants} variants) in ${CATEGORIES.length} categories; users ${ADMIN_EMAIL}, ${DEMO_EMAIL}.`);
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error("Demo seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
})();
