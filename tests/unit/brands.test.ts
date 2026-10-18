import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_BRAND_SLUG, getBrandBySlug, getDefaultBrand, listBrands } from "@/brands";
import { contrastRatio, inkOn } from "@/lib/brand/contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("is 1 for identical colours", () => {
    expect(contrastRatio("#777777", "#777777")).toBe(1);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#183048", "#ffffff")).toBeCloseTo(contrastRatio("#ffffff", "#183048"), 6);
  });
});

describe("inkOn", () => {
  it("picks black on a light colour and white on a dark one", () => {
    expect(inkOn("#f07818")).toBe("#000000");
    expect(inkOn("#111111")).toBe("#ffffff");
  });
});

describe("brand files", () => {
  const brands = listBrands();

  it("registers Volta (public) and Advanced Media (private)", () => {
    expect(getBrandBySlug("volta")?.visibility).toBe("public");
    expect(getBrandBySlug("advancedmedia")?.visibility).toBe("private");
    expect(getBrandBySlug("advancedmedia")?.name).toBe("Advanced Media DZ");
  });

  it("returns null for an unknown slug", () => {
    expect(getBrandBySlug("nope")).toBeNull();
  });

  it("defaults to volta", () => {
    expect(DEFAULT_BRAND_SLUG).toBe("volta");
    expect(getDefaultBrand().slug).toBe("volta");
  });

  it("uses unique lowercase slugs", () => {
    for (const b of brands) expect(b.slug).toMatch(/^[a-z0-9-]+$/);
    expect(new Set(brands.map((b) => b.slug)).size).toBe(brands.length);
  });

  it.each(brands.map((b) => [b.slug, b] as const))("%s passes WCAG AA contrast", (_slug, b) => {
    expect(contrastRatio(b.colors.text, b.colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(b.colors.text, b.colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(b.colors.onPrimary, b.colors.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(brands.map((b) => [b.slug, b] as const))("%s demo banner text is readable on its accent", (_slug, b) => {
    expect(contrastRatio(inkOn(b.colors.accent), b.colors.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(brands.map((b) => [b.slug, b] as const))("%s logo file exists", (_slug, b) => {
    expect(existsSync(join(process.cwd(), "public", b.logo))).toBe(true);
  });

  it.each(brands.map((b) => [b.slug, b] as const))("%s colours are #rrggbb", (_slug, b) => {
    for (const v of Object.values(b.colors)) expect(v).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
