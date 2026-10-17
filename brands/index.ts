import { advancedmedia } from "./advancedmedia";
import type { Brand } from "./types";
import { volta } from "./volta";

export type { Brand, BrandColors } from "./types";

export const DEFAULT_BRAND_SLUG = "volta";

const BRANDS: Brand[] = [volta, advancedmedia];

export function listBrands(): Brand[] {
  return BRANDS;
}

export function getBrandBySlug(slug: string): Brand | null {
  return BRANDS.find((b) => b.slug === slug) ?? null;
}

export function getDefaultBrand(): Brand {
  return getBrandBySlug(DEFAULT_BRAND_SLUG)!;
}
