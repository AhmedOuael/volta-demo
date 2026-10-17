import { DEFAULT_BRAND_SLUG, getBrandBySlug, getDefaultBrand, type Brand } from "@/brands";

export const BRAND_HEADER = "x-brand";
const PREVIEW = /^\/p\/([A-Za-z0-9-]+)(\/.*)?$/;

/** "/p/advancedmedia/products" → { slug: "advancedmedia", rest: "/products" }; null for anything else. */
export function parsePreviewPath(pathname: string): { slug: string; rest: string } | null {
  const m = PREVIEW.exec(pathname);
  if (!m) return null;
  const rest = !m[2] || m[2] === "/" ? "/" : m[2];
  if (rest.split("/").some((seg) => seg === ".." || seg === ".")) return null;
  return { slug: m[1], rest };
}

/** Internal link for the active brand: private brands live under /p/<slug>. */
export function brandHref(path: string, slug: string): string {
  if (!path.startsWith("/") || path.startsWith("//") || slug === DEFAULT_BRAND_SLUG) return path;
  const prefix = `/p/${slug}`;
  if (path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`)) return path;
  if (path === "/") return prefix;
  if (path.startsWith("/?")) return prefix + path.slice(1);
  return prefix + path;
}

/** Brand for a request's x-brand header value (unknown or missing → default). */
export function resolveBrand(headerValue: string | null): Brand {
  return (headerValue && getBrandBySlug(headerValue)) || getDefaultBrand();
}

/** Browser path without the /p/<slug> prefix, for active-link comparisons in client components. */
export function stripPreviewPrefix(pathname: string): string {
  return parsePreviewPath(pathname)?.rest ?? pathname;
}
