import { describe, expect, it } from "vitest";
import { CATEGORY_RAILS, CATEGORY_TILES, HERO_SLIDES, PROMO, SPOTLIGHTS, homeStats } from "@/lib/home";
import { CATEGORIES } from "@/lib/categories";
import { DEMO_PRODUCTS } from "@/prisma/data/demo-products";

const bySlug = new Map(DEMO_PRODUCTS.map((p) => [p.slug, p]));
const inStock = (slug: string) => bySlug.get(slug)!.variants.some((v) => v.stock > 0);

describe("home page picks", () => {
  it("only feature products of the demo catalogue that can be ordered", () => {
    for (const slug of [...HERO_SLIDES.map((s) => s.slug), ...SPOTLIGHTS.map((s) => s.slug), PROMO.slug]) {
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

describe("category rails", () => {
  it("are real categories, each with products in the demo catalogue", () => {
    expect(CATEGORY_RAILS.length).toBeGreaterThan(0);
    for (const c of CATEGORY_RAILS) {
      expect(CATEGORIES).toContain(c);
      expect(DEMO_PRODUCTS.filter((p) => p.category === c).length, c).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("homeStats", () => {
  const products = [
    { maker: "Sonora", categories: ["Micros"] },
    { maker: "Sonora", categories: ["Micros", "Accessoires"] },
    { maker: "Vektor", categories: ["Informatique"] },
  ];

  it("counts products, makers, categories and delivered wilayas from real data", () => {
    expect(homeStats(products, 69)).toEqual([
      { value: 3, label: "produits" },
      { value: 2, label: "marques" },
      { value: 3, label: "catégories" },
      { value: 69, label: "wilayas livrées" },
    ]);
  });

  it("leaves out the wilayas when none are set up", () => {
    expect(homeStats(products, 0).map((s) => s.label)).not.toContain("wilayas livrées");
  });

  it("uses the singular for one", () => {
    expect(homeStats([products[2]], 1).map((s) => s.label)).toEqual(["produit", "marque", "catégorie", "wilaya livrée"]);
  });
});
