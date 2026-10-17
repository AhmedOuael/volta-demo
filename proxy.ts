import { NextResponse, type NextRequest } from "next/server";
import { getBrandBySlug } from "@/brands";
import { BRAND_HEADER, brandHref, parsePreviewPath } from "@/lib/brand/routing";

// Optimistic admin check only (no DB): bounce visitors without a session cookie to
// the login page. The real check is requireUser() in every admin page/action.
const SESSION_COOKIE = "noir_admin_session";
const NOINDEX = "noindex, nofollow";

const needsLogin = (request: NextRequest, path: string) =>
  (path === "/admin" || path.startsWith("/admin/")) && path !== "/admin/login" && !request.cookies.has(SESSION_COOKIE);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const preview = parsePreviewPath(pathname);

  if (!preview) {
    if (needsLogin(request, pathname)) return NextResponse.redirect(new URL("/admin/login", request.url));
    // Only proxy.ts may set the brand: drop any x-brand a client sent.
    const headers = new Headers(request.headers);
    headers.delete(BRAND_HEADER);
    return NextResponse.next({ request: { headers } });
  }

  const slug = preview.slug.toLowerCase();
  if (slug !== preview.slug && getBrandBySlug(slug)) {
    return NextResponse.redirect(new URL(`/p/${slug}${preview.rest === "/" ? "" : preview.rest}${search}`, request.url), 308);
  }
  // Unknown brand: no rewrite, so no route matches and Next renders the 404 page.
  if (!getBrandBySlug(slug)) return NextResponse.next();

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
