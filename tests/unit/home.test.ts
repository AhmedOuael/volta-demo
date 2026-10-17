import { describe, expect, it } from "vitest";
import { CATEGORY_TILES, HERO_SLIDES, SPOTLIGHTS } from "@/lib/home";
import { CATEGORIES } from "@/lib/categories";
import { DEMO_PRODUCTS } from "@/prisma/data/demo-products";

const bySlug = new Map(DEMO_PRODUCTS.map((p) => [p.slug, p]));
const inStock = (slug: string) => bySlug.get(slug)!.variants.some((v) => v.stock > 0);

describe("home page picks", () => {
  it("only feature products of the demo catalogue that can be ordered", () => {
    for (const slug of [...HERO_SLIDES.map((s) => s.slug), ...SPOTLIGHTS.map((s) => s.slug)]) {
      expect(bySlug.has(slug), slug).toBe(true);
      expect(inStock(slug), slug).toBe(true);
    }
  });

  it("give every category a tile photo from that category", () => {
    for (const c of CATEGORIES) {
      const product = bySlug.get(CATEGORY_TILES[c]);
      expect(product?.category, c).toBe(c);
    }
  });
});
