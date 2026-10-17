import { advancedmedia } from "./advancedmedia";
import type { Brand } from "./types";
import { volta } from "./volta";

export type { Brand, BrandColors } from "./types";

const BRANDS: Brand[] = [volta, advancedmedia];

/** The store a site opens with: NEXT_PUBLIC_DEFAULT_BRAND, or Volta. An unknown slug fails the build. */
export function pickDefaultBrandSlug(value: string | undefined): string {
  const slug = value?.trim().toLowerCase();
  if (!slug) return "volta";
  if (!BRANDS.some((b) => b.slug === slug)) throw new Error(`NEXT_PUBLIC_DEFAULT_BRAND="${value}" is not a brand listed in brands/index.ts`);
  return slug;
}

// A site made for one store (e.g. advancedmediademo.netlify.app) sets NEXT_PUBLIC_DEFAULT_BRAND:
// that store opens at the bare address and no other brand is reachable. NEXT_PUBLIC_ so the
// browser code builds the same links as the server; changing it needs a redeploy.
export const DEFAULT_BRAND_SLUG = pickDefaultBrandSlug(process.env.NEXT_PUBLIC_DEFAULT_BRAND);
export const SINGLE_BRAND_SITE = Boolean(process.env.NEXT_PUBLIC_DEFAULT_BRAND?.trim());

export function listBrands(): Brand[] {
  return BRANDS;
}

export function getBrandBySlug(slug: string): Brand | null {
  return BRANDS.find((b) => b.slug === slug) ?? null;
}

export function getDefaultBrand(): Brand {
  return getBrandBySlug(DEFAULT_BRAND_SLUG)!;
}
