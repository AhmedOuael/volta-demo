import { describe, expect, it } from "vitest";
import { brandHref, parsePreviewPath, resolveBrand } from "@/lib/brand/routing";

describe("parsePreviewPath", () => {
  it("splits slug and rest", () => {
    expect(parsePreviewPath("/p/advancedmedia/products")).toEqual({ slug: "advancedmedia", rest: "/products" });
    expect(parsePreviewPath("/p/advancedmedia/admin/orders")).toEqual({ slug: "advancedmedia", rest: "/admin/orders" });
  });

  it("maps the bare preview root to /", () => {
    expect(parsePreviewPath("/p/advancedmedia")).toEqual({ slug: "advancedmedia", rest: "/" });
    expect(parsePreviewPath("/p/advancedmedia/")).toEqual({ slug: "advancedmedia", rest: "/" });
  });

  it("keeps the slug's original case so the proxy can redirect it", () => {
    expect(parsePreviewPath("/p/AdvancedMedia/products")).toEqual({ slug: "AdvancedMedia", rest: "/products" });
  });

  it("rejects non-preview and malformed paths", () => {
    expect(parsePreviewPath("/products")).toBeNull();
    expect(parsePreviewPath("/p/")).toBeNull();
    expect(parsePreviewPath("/p")).toBeNull();
    expect(parsePreviewPath("/p/../admin")).toBeNull();
    expect(parsePreviewPath("/p/a%2Fb/x")).toBeNull();
  });
});

describe("brandHref", () => {
  it("prefixes private brands and keeps the query", () => {
    expect(brandHref("/products?cat=Micros", "advancedmedia")).toBe("/p/advancedmedia/products?cat=Micros");
    expect(brandHref("/", "advancedmedia")).toBe("/p/advancedmedia");
  });

  it("leaves the default brand untouched", () => {
    expect(brandHref("/products", "volta")).toBe("/products");
  });

  it("leaves absolute and non-root links untouched", () => {
    expect(brandHref("https://wa.me/1", "advancedmedia")).toBe("https://wa.me/1");
    expect(brandHref("#top", "advancedmedia")).toBe("#top");
  });

  it("does not double-prefix", () => {
    expect(brandHref("/p/advancedmedia/products", "advancedmedia")).toBe("/p/advancedmedia/products");
  });
});

describe("resolveBrand", () => {
  it("uses the header slug when known", () => {
    expect(resolveBrand("advancedmedia").slug).toBe("advancedmedia");
  });

  it("falls back to the default brand", () => {
    expect(resolveBrand(null).slug).toBe("volta");
    expect(resolveBrand("unknown").slug).toBe("volta");
  });
});

describe("stripPreviewPrefix", () => {
  it("removes /p/<slug> so pages can compare paths", async () => {
    const { stripPreviewPrefix } = await import("@/lib/brand/routing");
    expect(stripPreviewPrefix("/p/advancedmedia/admin/orders")).toBe("/admin/orders");
    expect(stripPreviewPrefix("/p/advancedmedia")).toBe("/");
    expect(stripPreviewPrefix("/admin")).toBe("/admin");
  });
});
