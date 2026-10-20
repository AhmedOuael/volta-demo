import { describe, expect, it } from "vitest";
import { cardAction, cardBadge, priceLabel, productsForTab, toCardProduct } from "@/lib/merchandising";
import type { CatalogProduct } from "@/lib/catalog";

function product(id: string, prices: number[], available: number[] = prices.map(() => 5)): CatalogProduct {
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
    price: Math.min(...prices),
    image: null,
    gallery: [],
    limited: false,
    variants: prices.map((price, i) => ({ id: `${id}-${i}`, sku: `${id}-${i}`, size: null, color: null, price, available: available[i] })),
  };
}

describe("priceLabel", () => {
  it("shows the price when every version costs the same", () => {
    expect(priceLabel(product("a", [14500, 14500]))).toBe("14 500 DA");
  });

  it("starts with 'À partir de' when versions differ in price", () => {
    expect(priceLabel(product("a", [189000, 239000]))).toBe("À partir de 189 000 DA");
  });
});

describe("cardBadge", () => {
  it("marks sold-out products first", () => {
    expect(cardBadge(product("a", [1000], [0]), true)).toEqual({ label: "Rupture", tone: "out" });
  });

  it("warns when the best-stocked version has only 1 or 2 left", () => {
    expect(cardBadge(product("a", [1000, 2000], [0, 2]), true)).toEqual({ label: "Plus que 2", tone: "low" });
  });

  it("labels new products", () => {
    expect(cardBadge(product("a", [1000]), true)).toEqual({ label: "Nouveau", tone: "new" });
  });

  it("shows nothing for an ordinary product", () => {
    expect(cardBadge(product("a", [1000]), false)).toBeNull();
  });
});

describe("productsForTab", () => {
  const items = [product("a", [5000]), product("b", [1000]), product("c", [9000]), product("d", [3000], [0])];

  it("keeps the newest-first order for Nouveautés", () => {
    expect(productsForTab(items, "new", 3).map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("lists the cheapest products in stock for Petits prix", () => {
    expect(productsForTab(items, "budget", 3).map((p) => p.id)).toEqual(["b", "a", "c"]);
  });

  it("lists the most expensive products in stock for Haut de gamme", () => {
    expect(productsForTab(items, "premium", 2).map((p) => p.id)).toEqual(["c", "a"]);
  });

  it("does not reorder the list it was given", () => {
    productsForTab(items, "budget", 3);
    expect(items.map((p) => p.id)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("cardAction", () => {
  it("adds a one-version product straight to the cart", () => {
    const p = product("a", [1000]);
    expect(cardAction(p)).toEqual({ kind: "add", variant: p.variants[0] });
  });

  it("asks to choose when several versions can be ordered", () => {
    expect(cardAction(product("a", [1000, 2000]))).toEqual({ kind: "choose" });
  });

  it("adds the only version still in stock", () => {
    const p = product("a", [1000, 2000], [0, 3]);
    expect(cardAction(p)).toEqual({ kind: "add", variant: p.variants[1] });
  });

  it("offers nothing when every version is sold out", () => {
    expect(cardAction(product("a", [1000, 2000], [0, 0]))).toEqual({ kind: "out" });
  });
});

describe("toCardProduct", () => {
  it("keeps what a card and the quick view show, and nothing else", () => {
    const full = { ...product("a", [1000, 2000]), specs: [{ label: "Poids", value: "1 kg" }], details: ["x"], gallery: ["/b.jpg"], description: "Court" };
    expect(Object.keys(toCardProduct(full)).sort()).toEqual(["description", "id", "image", "maker", "name", "price", "slug", "variants"]);
    expect(toCardProduct(full).variants).toEqual(full.variants);
  });
});
