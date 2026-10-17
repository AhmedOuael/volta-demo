import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// A site made for one store sets NEXT_PUBLIC_DEFAULT_BRAND; brand modules read it
// once at import, so each test re-imports them with the variable set.
async function withSiteBrand(value: string) {
  vi.stubEnv("NEXT_PUBLIC_DEFAULT_BRAND", value);
  vi.resetModules();
  return {
    brands: await import("@/brands"),
    routing: await import("@/lib/brand/routing"),
    proxy: (await import("@/proxy")).proxy,
    robots: (await import("@/app/robots")).default,
    sitemap: (await import("@/app/sitemap")).default,
  };
}

const req = (path: string) => new NextRequest(`http://localhost${path}`);

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("pickDefaultBrandSlug", () => {
  it("defaults to Volta when the site has no store set", async () => {
    const { pickDefaultBrandSlug } = await import("@/brands");
    expect(pickDefaultBrandSlug(undefined)).toBe("volta");
    expect(pickDefaultBrandSlug("  ")).toBe("volta");
  });

  it("accepts a known store, ignoring case and spaces", async () => {
    const { pickDefaultBrandSlug } = await import("@/brands");
    expect(pickDefaultBrandSlug(" AdvancedMedia ")).toBe("advancedmedia");
  });

  it("refuses an unknown store instead of silently showing Volta", async () => {
    const { pickDefaultBrandSlug } = await import("@/brands");
    expect(() => pickDefaultBrandSlug("nope")).toThrow(/NEXT_PUBLIC_DEFAULT_BRAND/);
  });
});

describe("a site made for Advanced Media", () => {
  it("opens the store at the bare address, marked noindex", async () => {
    const { brands, proxy } = await withSiteBrand("advancedmedia");
    expect(brands.getDefaultBrand().slug).toBe("advancedmedia");
    expect(proxy(req("/")).headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(proxy(req("/products/aerix-one-4k")).headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("keeps internal links at the bare address", async () => {
    const { routing } = await withSiteBrand("advancedmedia");
    expect(routing.brandHref("/products", "advancedmedia")).toBe("/products");
  });

  it("still serves /p/advancedmedia links already sent", async () => {
    const { proxy } = await withSiteBrand("advancedmedia");
    const res = proxy(req("/p/advancedmedia/products"));
    expect(res.headers.get("x-middleware-rewrite")).toBe("http://localhost/products");
    expect(res.headers.get("x-middleware-request-x-brand")).toBe("advancedmedia");
  });

  it("hides Volta and every other brand (404)", async () => {
    const { proxy } = await withSiteBrand("advancedmedia");
    for (const path of ["/p/volta", "/p/volta/products", "/p/Volta"]) {
      const res = proxy(req(path));
      expect(res.headers.get("x-middleware-rewrite"), path).toBeNull();
      expect(res.headers.get("location"), path).toBeNull();
    }
  });

  it("asks search engines to stay away and lists nothing in the sitemap", async () => {
    const { robots, sitemap } = await withSiteBrand("advancedmedia");
    expect(robots().rules).toMatchObject({ userAgent: "*", disallow: "/" });
    expect(await sitemap()).toEqual([]);
  });
});

describe("the public Volta site (no store set)", () => {
  it("keeps the bare address indexable", async () => {
    vi.resetModules();
    const { proxy } = await import("@/proxy");
    expect(proxy(req("/")).headers.get("x-robots-tag")).toBeNull();
  });
});
