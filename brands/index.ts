import { advancedmedia } from "./advancedmedia";
import { abstore } from "./abstore";
import { aektech } from "./aektech";
import { aissa } from "./aissa";
import { amirsys } from "./amirsys";
import { avpro } from "./avpro";
import { chakibcamera } from "./chakibcamera";
import { clickinformatique } from "./clickinformatique";
import { energy } from "./energy";
import { eternel } from "./eternel";
import { fotofon } from "./fotofon";
import { iktech } from "./iktech";
import { informatics } from "./informatics";
import { mahmoudcamera } from "./mahmoudcamera";
import { materielphoto } from "./materielphoto";
import { midocamera } from "./midocamera";
import { milotech } from "./milotech";
import { mobicase } from "./mobicase";
import { nxtstore } from "./nxtstore";
import { provision } from "./provision";
import { promotech } from "./promotech";
import { ramtech } from "./ramtech";
import { spidergaming } from "./spidergaming";
import { techmania } from "./techmania";
import type { Brand } from "./types";
import { volta } from "./volta";

export type { Brand, BrandColors } from "./types";

const BRANDS: Brand[] = [
  volta,
  advancedmedia,
  abstore,
  aektech,
  aissa,
  amirsys,
  avpro,
  chakibcamera,
  clickinformatique,
  energy,
  eternel,
  fotofon,
  iktech,
  informatics,
  mahmoudcamera,
  materielphoto,
  midocamera,
  milotech,
  mobicase,
  nxtstore,
  provision,
  promotech,
  ramtech,
  spidergaming,
  techmania,
];

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

// A shared preview site (NEXT_PUBLIC_PREVIEWS_ONLY=true) serves only /p/<private store>: the bare
// address, Volta and unknown slugs get a neutral 404. Ignored on a one-store site.
export const PREVIEWS_ONLY_SITE = !SINGLE_BRAND_SITE && process.env.NEXT_PUBLIC_PREVIEWS_ONLY === "true";

/** True when search engines must stay away from the whole site. */
export const SITE_IS_PRIVATE = PREVIEWS_ONLY_SITE || getBrandBySlug(DEFAULT_BRAND_SLUG)?.visibility === "private";

export function listBrands(): Brand[] {
  return BRANDS;
}

export function getBrandBySlug(slug: string): Brand | null {
  return BRANDS.find((b) => b.slug === slug) ?? null;
}

export function getDefaultBrand(): Brand {
  return getBrandBySlug(DEFAULT_BRAND_SLUG)!;
}
