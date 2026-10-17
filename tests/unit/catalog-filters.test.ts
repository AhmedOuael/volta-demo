import { describe, expect, it } from "vitest";
import { applyAggregateFilters, buildProductWhere, parseFilters, type CatalogFilters } from "@/lib/catalog-filters";
import type { CatalogProduct } from "@/lib/catalog";

const base: CatalogFilters = { makers: [], inStock: false, sort: "new" };

function product(id: string, price: number, available: number[]): CatalogProduct {
  return {
    id,
    slug: id,
    name: id,
    maker: "Sonora",
    specs: [],
    description: null,
    details: [],
    categories: [],
    colorName: null,
    price,
    image: null,
    gallery: [],
    limited: false,
    variants: available.map((a, i) => ({ id: `${id}-${i}`, sku: `${id}-${i}`, size: null, color: null, price, available: a })),
  };
}

describe("parseFilters", () => {
  it("reads every filter from the query string", () => {
    expect(
      parseFilters({ q: " micro ", cat: "Micros", maker: ["Sonora", "Lumex"], min: "5000", max: "20000", stock: "1", sort: "price-asc" })
    ).toEqual({ q: "micro", cat: "Micros", makers: ["Sonora", "Lumex"], min: 5000, max: 20000, inStock: true, sort: "price-asc" });
  });

  it("defaults to no filters, newest first", () => {
    expect(parseFilters({})).toEqual(base);
  });

  it("drops a price that is not a number", () => {
    expect(parseFilters({ min: "abc" }).min).toBeUndefined();
  });

  it("drops both prices when min is above max", () => {
    const f = parseFilters({ min: "9000", max: "100" });
    expect(f.min).toBeUndefined();
    expect(f.max).toBeUndefined();
  });

  it("takes the first value of a repeated single-value param", () => {
    expect(parseFilters({ cat: ["A", "B"] }).cat).toBe("A");
  });

  it("truncates a long search to 80 characters", () => {
    expect(parseFilters({ q: "a".repeat(500) }).q).toHaveLength(80);
  });

  it("falls back to newest first for an unknown sort", () => {
    expect(parseFilters({ sort: "x" }).sort).toBe("new");
  });

  it("ignores empty values sent by a plain form", () => {
    expect(parseFilters({ q: "", cat: "", min: "", max: "", maker: [""] })).toEqual(base);
  });

  it("accepts a single maker as a string", () => {
    expect(parseFilters({ maker: "Vektor" }).makers).toEqual(["Vektor"]);
  });
});

describe("buildProductWhere", () => {
  it("matches the search on name or maker, ignoring case", () => {
    const where = buildProductWhere({ ...base, q: "micro" });
    expect(where.OR).toEqual([
      { name: { contains: "micro", mode: "insensitive" } },
      { maker: { contains: "micro", mode: "insensitive" } },
    ]);
  });

  it("filters by category and makers", () => {
    const where = buildProductWhere({ ...base, cat: "Micros", makers: ["Sonora"] });
    expect(where.categories).toEqual({ some: { category: { name: "Micros", active: true } } });
    expect(where.maker).toEqual({ in: ["Sonora"] });
  });

  it("only lists active products that have a variant on sale", () => {
    const where = buildProductWhere(base);
    expect(where.active).toBe(true);
    expect(where.variants).toEqual({ some: { active: true } });
    expect(where.OR).toBeUndefined();
  });
});

describe("applyAggregateFilters", () => {
  const items = [product("a", 3000, [0, 0]), product("b", 12000, [0, 2]), product("c", 20000, [5]), product("d", 5000, [1])];

  it("keeps only products with a variant in stock", () => {
    expect(applyAggregateFilters(items, { ...base, inStock: true }).map((p) => p.id)).toEqual(["b", "c", "d"]);
  });

  it("applies an inclusive price range", () => {
    expect(applyAggregateFilters(items, { ...base, min: 5000, max: 12000 }).map((p) => p.id)).toEqual(["b", "d"]);
  });

  it("sorts by price", () => {
    expect(applyAggregateFilters(items, { ...base, sort: "price-desc" }).map((p) => p.id)).toEqual(["c", "b", "d", "a"]);
    expect(applyAggregateFilters(items, { ...base, sort: "price-asc" }).map((p) => p.id)).toEqual(["a", "d", "b", "c"]);
  });

  it("keeps the loaded order for newest first", () => {
    expect(applyAggregateFilters(items, base).map((p) => p.id)).toEqual(["a", "b", "c", "d"]);
  });
});
