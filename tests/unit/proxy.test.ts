import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "@/proxy";

const req = (path: string, cookie?: string) =>
  new NextRequest(`http://localhost${path}`, cookie ? { headers: { cookie } } : undefined);
const SESSION = "noir_admin_session=abc";

describe("proxy: previews", () => {
  it("rewrites a known preview to the plain route and forwards x-brand", () => {
    const res = proxy(req("/p/advancedmedia/products?cat=Micros"));
    expect(res.headers.get("x-middleware-rewrite")).toBe("http://localhost/products?cat=Micros");
    expect(res.headers.get("x-middleware-request-x-brand")).toBe("advancedmedia");
    expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("rewrites the preview root to /", () => {
    const res = proxy(req("/p/advancedmedia"));
    expect(res.headers.get("x-middleware-rewrite")).toBe("http://localhost/");
  });

  it("redirects a mixed-case slug to lowercase", () => {
    const res = proxy(req("/p/AdvancedMedia/products"));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("http://localhost/p/advancedmedia/products");
  });

  it("does not rewrite or brand an unknown slug (Next renders the 404)", () => {
    const res = proxy(req("/p/unknown/products"));
    expect(res.headers.get("x-middleware-rewrite")).toBeNull();
    expect(res.headers.get("x-middleware-request-x-brand")).toBeNull();
  });
});

describe("proxy: admin session check", () => {
  it("bounces a preview admin page to the preview login", () => {
    const res = proxy(req("/p/advancedmedia/admin/orders"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/p/advancedmedia/admin/login");
  });

  it("lets the preview login page through, branded", () => {
    const res = proxy(req("/p/advancedmedia/admin/login"));
    expect(res.headers.get("x-middleware-rewrite")).toBe("http://localhost/admin/login");
  });

  it("rewrites a preview admin page when a session cookie exists", () => {
    const res = proxy(req("/p/advancedmedia/admin/orders", SESSION));
    expect(res.headers.get("x-middleware-rewrite")).toBe("http://localhost/admin/orders");
  });

  it("keeps NOIR's behaviour for the default brand", () => {
    expect(proxy(req("/admin/orders")).headers.get("location")).toBe("http://localhost/admin/login");
    expect(proxy(req("/admin/login")).status).toBe(200);
  });
});

describe("proxy: brand header spoofing", () => {
  it("strips a client-sent x-brand header on non-preview pages", () => {
    const res = proxy(new NextRequest("http://localhost/checkout", { headers: { "x-brand": "advancedmedia" } }));
    const kept = (res.headers.get("x-middleware-override-headers") ?? "").split(",");
    expect(res.headers.get("x-middleware-override-headers")).not.toBeNull();
    expect(kept).not.toContain("x-brand");
  });

  it("overwrites a client-sent x-brand on preview pages with the URL's brand", () => {
    const res = proxy(new NextRequest("http://localhost/p/advancedmedia/checkout", { headers: { "x-brand": "volta" } }));
    expect(res.headers.get("x-middleware-request-x-brand")).toBe("advancedmedia");
  });
});

describe("proxy: matcher", () => {
  it("runs on product pages (photos live in /catalog, not /products)", async () => {
    const { config } = await import("@/proxy");
    const re = new RegExp(`^${config.matcher[0]}$`);
    expect(re.test("/products/micro-sonora-x2")).toBe(true);
    expect(re.test("/checkout")).toBe(true);
    expect(re.test("/catalog/cam-01.jpg")).toBe(false);
    expect(re.test("/_next/static/chunk.js")).toBe(false);
  });
});
