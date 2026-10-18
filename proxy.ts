import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_BRAND_SLUG, PREVIEWS_ONLY_SITE, SINGLE_BRAND_SITE, SITE_IS_PRIVATE, getBrandBySlug } from "@/brands";
import { BRAND_HEADER, brandHref, parsePreviewPath } from "@/lib/brand/routing";

// Optimistic admin check only (no DB): bounce visitors without a session cookie to
// the login page. The real check is requireUser() in every admin page/action.
const SESSION_COOKIE = "noir_admin_session";
const NOINDEX = "noindex, nofollow";

// Plain 404 for a previews-only site: names no store, so no store sees another (or Volta).
const notFound = () =>
  new NextResponse('<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Page introuvable</title><p style="font:16px system-ui,sans-serif;text-align:center;margin-top:20vh">Page introuvable</p></html>', {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8", "X-Robots-Tag": NOINDEX },
  });

const needsLogin = (request: NextRequest, path: string) =>
  (path === "/admin" || path.startsWith("/admin/")) && path !== "/admin/login" && !request.cookies.has(SESSION_COOKIE);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const preview = parsePreviewPath(pathname);

  if (!preview) {
    // robots.txt stays readable so crawlers learn to keep out.
    if (PREVIEWS_ONLY_SITE && pathname !== "/robots.txt") return notFound();
    if (needsLogin(request, pathname)) return NextResponse.redirect(new URL("/admin/login", request.url));
    // Only proxy.ts may set the brand: drop any x-brand a client sent.
    const headers = new Headers(request.headers);
    headers.delete(BRAND_HEADER);
    const response = NextResponse.next({ request: { headers } });
    // A site whose default store is a private preview is never indexed.
    if (SITE_IS_PRIVATE) response.headers.set("X-Robots-Tag", NOINDEX);
    return response;
  }

  const slug = preview.slug.toLowerCase();
  // On a one-store site only that store exists; other slugs fall through to the 404 below.
  const reachable = (s: string) =>
    Boolean(getBrandBySlug(s)) &&
    (!SINGLE_BRAND_SITE || s === DEFAULT_BRAND_SLUG) &&
    (!PREVIEWS_ONLY_SITE || getBrandBySlug(s)?.visibility === "private");
  if (slug !== preview.slug && reachable(slug)) {
    return NextResponse.redirect(new URL(`/p/${slug}${preview.rest === "/" ? "" : preview.rest}${search}`, request.url), 308);
  }
  // Unknown brand: no rewrite, so no route matches and Next renders the 404 page.
  if (!reachable(slug)) return PREVIEWS_ONLY_SITE ? notFound() : NextResponse.next();

  if (needsLogin(request, preview.rest)) {
    return NextResponse.redirect(new URL(brandHref("/admin/login", slug), request.url));
  }

  const headers = new Headers(request.headers);
  headers.set(BRAND_HEADER, slug);
  const target = new URL(preview.rest + search, request.url);
  const response = NextResponse.rewrite(target, { request: { headers } });
  response.headers.set("X-Robots-Tag", NOINDEX);
  return response;
}

export const config = {
  // Every page (so x-brand can always be controlled here), but not static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brands/|catalog/|images/).*)"],
};
