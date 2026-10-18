import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// A shared preview site (NEXT_PUBLIC_PREVIEWS_ONLY=true) serves only /p/<private store>;
// everything else is a plain 404 that names no store.
async function previewsOnlySite() {
  vi.stubEnv("NEXT_PUBLIC_PREVIEWS_ONLY", "true");
  vi.resetModules();
  return {
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

describe("a previews-only site", () => {
  it("answers the bare address and other plain pages with a neutral 404", async () => {
    const { proxy } = await previewsOnlySite();
    for (const path of ["/", "/products", "/products/aerix-one-4k", "/admin/login", "/credits"]) {
      const res = proxy(req(path));
      expect(res.status, path).toBe(404);
      expect(res.headers.get("x-robots-tag"), path).toBe("noindex, nofollow");
      const body = await res.text();
      expect(body, path).toContain("Page introuvable");
      expect(body, path).not.toMatch(/Volta|Advanced Media/);
    }
  });

  it("serves a private store's preview", async () => {
    const { proxy } = await previewsOnlySite();
    const res = proxy(req("/p/advancedmedia/products"));
    expect(res.headers.get("x-middleware-rewrite")).toBe("http://localhost/products");
    expect(res.headers.get("x-middleware-request-x-brand")).toBe("advancedmedia");
  });

  it("hides the public Volta store and unknown slugs behind the same 404", async () => {
    const { proxy } = await previewsOnlySite();
    for (const path of ["/p/volta", "/p/volta/products", "/p/nope"]) {
      const res = proxy(req(path));
      expect(res.status, path).toBe(404);
      expect(await res.text(), path).not.toMatch(/Volta/);
    }
  });

  it("still lets crawlers read robots.txt, which keeps them out", async () => {
    const { proxy, robots, sitemap } = await previewsOnlySite();
    expect(proxy(req("/robots.txt")).status).not.toBe(404);
    expect(robots().rules).toMatchObject({ userAgent: "*", disallow: "/" });
    expect(await sitemap()).toEqual([]);
  });
});
