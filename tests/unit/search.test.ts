import { describe, expect, it } from "vitest";
import { searchProducts } from "@/lib/search";

const items = [
  { slug: "a", name: "Sonora USB Cast", maker: "Sonora", categories: ["Micros"] },
  { slug: "b", name: "Pied de micro perche Sonora", maker: "Sonora", categories: ["Micros"] },
  { slug: "c", name: "Vektor Book 14", maker: "Vektor", categories: ["Informatique"] },
  { slug: "d", name: "Lumex COB 300", maker: "Lumex", categories: ["Éclairage"] },
  { slug: "e", name: "Aerix Go Étanche", maker: "Aerix", categories: ["Caméras"] },
];
const slugs = (q: string, limit?: number) => searchProducts(items, q, limit).map((i) => i.slug);

describe("searchProducts", () => {
  it("returns nothing for an empty or blank query", () => {
    expect(slugs("")).toEqual([]);
    expect(slugs("   ")).toEqual([]);
  });

  it("matches the name, the maker and the category, ignoring case and accents", () => {
    expect(slugs("vektor")).toEqual(["c"]);
    expect(slugs("ETANCHE")).toEqual(["e"]);
    expect(slugs("eclairage")).toEqual(["d"]);
  });

  it("needs every word of the query to match", () => {
    expect(slugs("sonora usb")).toEqual(["a"]);
    expect(slugs("sonora vektor")).toEqual([]);
  });

  it("lists names that start with the query before the others", () => {
    expect(slugs("micro")).toEqual(["b", "a"]); // a word of b's name starts with it; a only matches by category
    expect(slugs("pied")).toEqual(["b"]);
    expect(slugs("so")).toEqual(["a", "b"]);
    expect(slugs("sonora")[0]).toBe("a");
  });

  it("stops at the limit", () => {
    expect(slugs("o", 2)).toHaveLength(2);
  });
});
