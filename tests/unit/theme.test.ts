import { describe, expect, it, vi } from "vitest";
import { getBrandBySlug } from "@/brands";
import { bannerText, brandCssVars } from "@/lib/brand/theme";

vi.mock("@/lib/prisma", () => ({
  prisma: { product: { findMany: async () => [{ slug: "micro-sonora-x2", updatedAt: new Date("2026-10-01") }] } },
}));

const volta = getBrandBySlug("volta")!;
const am = getBrandBySlug("advancedmedia")!;

describe("brandCssVars", () => {
  it("maps brand colours onto the Tailwind tokens the components use", () => {
    const vars = brandCssVars(volta);
    expect(vars["--color-primary"]).toBe(volta.colors.primary);
    expect(vars["--color-on-primary"]).toBe(volta.colors.onPrimary);
    expect(vars["--color-accent"]).toBe(volta.colors.accent);
    expect(vars["--color-background"]).toBe(volta.colors.background);
    expect(vars["--color-surface"]).toBe(volta.colors.background);
    expect(vars["--color-surface-container"]).toBe(volta.colors.surface);
    expect(vars["--color-on-surface"]).toBe(volta.colors.text);
    expect(vars["--color-on-surface-variant"]).toBe(volta.colors.muted);
    expect(vars["--color-secondary"]).toBe(volta.colors.muted);
  });
});

describe("bannerText", () => {
  it("labels private previews as an unofficial mock-up", () => {
    expect(bannerText(am)).toBe("Maquette proposée à Advanced Media DZ par Willou — pas une boutique officielle");
  });

  it("labels the public demo", () => {
    expect(bannerText(volta)).toBe(
      "Boutique de démonstration — aucune commande n'est réelle. Conçue par Willou · ahmedouael.com",
    );
  });
});

describe("robots and sitemap", () => {
  it("disallows private previews", async () => {
    const { default: robots } = await import("@/app/robots");
    const rules = robots().rules;
    const disallow = (Array.isArray(rules) ? rules[0] : rules).disallow;
    expect(disallow).toContain("/p/");
  });

  it("never lists a preview URL", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.some((u) => u.includes("/p/"))).toBe(false);
  });
});
