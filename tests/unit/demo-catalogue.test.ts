import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEMO_PRODUCTS, demoImage, demoSku } from "@/prisma/data/demo-products";
import { CATEGORIES } from "@/lib/categories";
import { CREDITS } from "@/lib/credits";
import { parseSpecs } from "@/lib/specs";

describe("demo catalogue", () => {
  it("has 40 products, 8 per category", () => {
    expect(DEMO_PRODUCTS).toHaveLength(40);
    for (const c of CATEGORIES) expect(DEMO_PRODUCTS.filter((p) => p.category === c)).toHaveLength(8);
  });

  it("uses unique slugs and SKUs", () => {
    expect(new Set(DEMO_PRODUCTS.map((p) => p.slug)).size).toBe(40);
    const skus = DEMO_PRODUCTS.flatMap((p) => p.variants.map((_, i) => demoSku(p.slug, i)));
    expect(new Set(skus).size).toBe(skus.length);
    for (const sku of skus) expect(sku).toMatch(/^[A-Z0-9.-]{1,40}$/);
  });

  it("gives every product 1–3 variants with a price in DA and valid specs", () => {
    for (const p of DEMO_PRODUCTS) {
      expect(p.variants.length).toBeGreaterThanOrEqual(1);
      expect(p.variants.length).toBeLessThanOrEqual(3);
      for (const v of p.variants) expect(Number.isInteger(v.price) && v.price > 0).toBe(true);
      expect(parseSpecs(p.specs)).toEqual(p.specs);
      expect(p.maker).not.toBe("");
    }
  });

  it("shows low stock and sold-out states", () => {
    const low = DEMO_PRODUCTS.flatMap((p) => p.variants).filter((v) => v.stock >= 1 && v.stock <= 2);
    expect(low.length).toBeGreaterThanOrEqual(4);
    const soldOut = DEMO_PRODUCTS.filter((p) => p.variants.every((v) => v.stock === 0));
    expect(soldOut.length).toBeGreaterThanOrEqual(3);
  });

  it("has a credited photo file for every product and the hero", () => {
    const credited = new Set(CREDITS.map((c) => c.file));
    for (const file of [...DEMO_PRODUCTS.map((p) => demoImage(p.slug)), "/catalog/hero-studio.jpg"]) {
      expect(credited.has(file), file).toBe(true);
    }
    for (const c of CREDITS) expect(existsSync(join(process.cwd(), "public", c.file)), c.file).toBe(true);
  });
});
