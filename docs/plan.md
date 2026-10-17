# Branded Demo Store Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fork NOIR into `volta-demo`, a French demo store for tech/audiovisual shops where a brand is one file, served publicly as Volta Studio and privately as `/p/<slug>` previews (first: Advanced Media DZ).

**Architecture:** Next.js 16 app forked from `C:\Dev\noir-luxe`. `proxy.ts` rewrites `/p/<slug>/…` to `/…` and passes `x-brand`; server code resolves the brand file; theme colours become CSS custom properties that NOIR's Tailwind tokens already read. Neon Postgres for data, Netlify for hosting, GitHub Actions for the nightly reset.

**Tech Stack:** Next.js 16.4 (App Router, `proxy.ts`), React 19.2, Prisma 7 + `@prisma/adapter-pg`, Neon Postgres, Tailwind 4 (`@theme` tokens), Vitest, Playwright (installed Chrome), Netlify, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-17-volta-demo-design.md` (portfolio repo; copied to `volta-demo/docs/spec.md` in Task 1). Read it before any task.

## Global Constraints

- All visible copy (storefront, admin, errors, banners) in **French**. No Arabic in v1.
- Brand-specific values (name, logo, colours, fonts, tagline, delivery promise, Instagram) come **only** from `brands/<slug>.ts`. No hard-coded "NOIR", "Volta" or store names elsewhere.
- Public default brand slug: `volta`. Private preview URL: `/p/<slug>`; slugs are lowercase `[a-z0-9-]+`.
- Private banner text, verbatim: `Maquette proposée à {name} par Willou — pas une boutique officielle` (always visible, not dismissible).
- Public banner text, verbatim: `Boutique de démonstration — aucune commande n'est réelle. Conçue par Willou · ahmedouael.com`.
- Private pages: `<meta name="robots" content="noindex, nofollow">` **and** response header `X-Robots-Tag: noindex, nofollow`; `/p/` disallowed in `robots.ts`, absent from `sitemap.ts`.
- WhatsApp: always `STORE_WHATSAPP` (Willou's number), never a store's number; private brands prefix the message with `[Démo {name}]`; button hidden if `STORE_WHATSAPP` is unset.
- Contrast: `text`/`background`, `text`/`surface`, `onPrimary`/`primary` each ≥ 4.5:1.
- Product photos: Unsplash/Pexels only, each credited on `/credits`. Product makers are fictional.
- Demo test phone: `0555 00 00 00` (must pass NOIR's `normalizePhone` rule `^0[567]\d{8}$`).
- Never touch `C:\Dev\noir-luxe`. Integration and e2e tests that write data run only against `TEST_DATABASE_URL` (a Neon branch), never the live demo database.
- Next.js 16 differs from older versions: read `node_modules/next/dist/docs/` for `proxy`, `headers()`, metadata and server actions before using them (NOIR's `AGENTS.md` rule).

## Review Focus

1. **Odd preview URLs** (`/p/AdvancedMedia`, `/p/advancedmedia/`, `/p/unknown`, `/p/../admin`): mixed case redirects to lowercase, trailing slash works, unknown slug is a 404, nothing escapes the brand. Test owner: Task 4.
2. **Losing the preview prefix** after a redirect (admin login bounce, server-action redirect, checkout success, pagination links): the visitor must stay under `/p/<slug>`. Test owners: Task 4 (unit), Task 13 (e2e).
3. **Garbage filter params** (`min=abc`, `min=9000&max=100`, `cat` repeated, 500-char `q`, unknown `sort`): invalid values are ignored, the page renders, never a 500. Test owner: Task 8.
4. **Reading someone else's order** by changing `?order=` on the success page: it must show only the number, never items or customer data. Test owner: Task 10.
5. **Brand spoofing:** a client sending `storeSlug: "volta"` from a preview, or orders from one brand showing in another brand's dashboard. `storeSlug` is derived server-side only. Test owners: Task 10 (order), Task 11 (dashboard).

---

### Task 1: Fork NOIR into `volta-demo`, strip R2, green baseline

**Files:**
- Create: `C:\Dev\volta-demo\` (copy of `C:\Dev\noir-luxe` excluding `node_modules`, `.next`, `.git`, `.env`, `.env.local`, `test-results`, `NOIR-AUDIT-REPORT.md`)
- Create: `.env.example`, `docs/spec.md` (copy of the spec), `docs/plan.md` (this plan)
- Delete: `lib/storage.ts`; Modify: `app/admin/(dashboard)/products/actions.ts` (remove `createUploadAction`), admin product form component(s) that call it (replace the upload widget with an "Image path" text input, e.g. `/products/cam-01.jpg`)
- Modify: `package.json` (`name: "volta-demo"`, remove `@aws-sdk/*`), `lib/site.ts` (temporary neutral values; replaced by brands in Task 3)

**Interfaces:**
- Produces: a building, testing Next.js app at `C:\Dev\volta-demo` with its own Neon database.

- [ ] **Step 1:** Copy the folder (robocopy or equivalent with the exclusions above), `git init`, first commit "chore: fork NOIR as volta-demo".
- [ ] **Step 2:** Create Neon project `volta-demo` in region `aws-eu-central-1` (Frankfurt) and a branch `test`. Put the pooled/direct URLs in `.env.local` (`DATABASE_URL`, `DATABASE_URL_POOLED`) and the branch URL in `TEST_DATABASE_URL`. `.env.example` lists every variable from spec §4 with empty values.
- [ ] **Step 3:** Remove R2: delete `lib/storage.ts`, `createUploadAction`, the upload UI, `@aws-sdk/*` deps, R2 env vars; keep `lib/images.ts` (it already resolves `/public` paths).
- [ ] **Step 4:** `npm install`, `npx prisma migrate deploy`, `npx tsx prisma/seed.ts` (NOIR seed, temporary).
- [ ] **Step 5:** Run `npm test` and `npm run build`. Expected: all existing unit tests pass, build succeeds (integration tests run when `TEST_DATABASE_URL` is set and pass).
- [ ] **Step 6:** Create the private GitHub repo `volta-demo`, push. Commit "chore: drop R2 uploads, own Neon database".

### Task 2: Netlify smoke deploy (risk check before building features)

**Files:**
- Create: `netlify.toml` (`[build] command = "npm run build"`, Node 24, Next.js runtime auto-detected)

- [ ] **Step 1:** Confirm on Netlify's own pricing/terms page that the free plan permits a commercial demo; note the URL in `docs/spec.md` §12. If it does not, stop and report.
- [ ] **Step 2:** Link the GitHub repo to a new Netlify site, set env vars from `.env.example` (live Neon URLs), deploy.
- [ ] **Step 3:** Verify on the `*.netlify.app` URL: home renders, a product page renders, `/admin/login` renders. Expected: HTTP 200 on all three; no runtime errors in Netlify function logs.
- [ ] **Step 4:** Commit `netlify.toml` "chore: Netlify config".

### Task 3: Brand files + contrast check

**Files:**
- Create: `brands/types.ts`, `brands/volta.ts`, `brands/advancedmedia.ts`, `brands/index.ts`, `lib/brand/contrast.ts`
- Create: `public/brands/volta/logo.svg` (text wordmark "VOLTA STUDIO"), `public/brands/advancedmedia/logo.png` (Willou saves their Instagram profile picture)
- Test: `tests/unit/brands.test.ts`

**Interfaces:**
- Produces:
  - `type BrandColors = { primary; onPrimary; accent; background; surface; text; muted }` (all `#rrggbb` strings)
  - `interface Brand { slug: string; name: string; visibility: "public" | "private"; logo: string; logoAlt: string; colors: BrandColors; fonts: { display: string; body: string }; tagline: string; deliveryPromise: string; heroImage: string; instagram?: string }`
  - `DEFAULT_BRAND_SLUG = "volta"`; `getBrandBySlug(slug: string): Brand | null`; `getDefaultBrand(): Brand`; `listBrands(): Brand[]`
  - `contrastRatio(hexA: string, hexB: string): number` (WCAG relative luminance)

- [ ] **Step 1: Write the failing tests** in `tests/unit/brands.test.ts`:
  - `contrastRatio("#000000", "#ffffff")` ≈ 21 (to 1 decimal); `contrastRatio("#777777", "#777777")` = 1.
  - for every `listBrands()` brand: slug matches `/^[a-z0-9-]+$/`; slugs are unique; `contrastRatio(text, background) >= 4.5`, `(text, surface) >= 4.5`, `(onPrimary, primary) >= 4.5`; logo file exists under `public/`.
  - `getBrandBySlug("volta")!.visibility === "public"`; `getBrandBySlug("advancedmedia")!.visibility === "private"`; `getBrandBySlug("nope") === null`; `getDefaultBrand().slug === "volta"`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/brands.test.ts`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Implement the files. Values: Volta = dark UI with one electric accent (exact hexes chosen at the start of this task with Willou, per spec §13); Advanced Media = navy + orange sampled from their logo, name "Advanced Media DZ", tagline "Accessoires audiovisuels et informatique", deliveryPromise "Livraison 69 wilayas · Paiement à la livraison", instagram "advancedmedia.dz". Fonts: reuse `@fontsource` packages already installed or add one per brand the same way.
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5:** Commit "feat: brand files with contrast check".

### Task 4: Brand routing (proxy, getBrand, brandHref)

**Files:**
- Modify: `proxy.ts`
- Create: `lib/brand/routing.ts` (pure helpers), `lib/brand/server.ts` (`getBrand`), `components/brand/BrandProvider.tsx` (client context: `useBrand()`, `useBrandHref()`)
- Modify: `lib/auth/session.ts` (`requireUser` redirects keep the prefix)
- Test: `tests/unit/brand-routing.test.ts`, `tests/unit/proxy.test.ts`

**Interfaces:**
- Consumes: `getBrandBySlug`, `getDefaultBrand` (Task 3).
- Produces:
  - `parsePreviewPath(pathname: string): { slug: string; rest: string } | null` — `/p/advancedmedia/products` → `{ slug: "advancedmedia", rest: "/products" }`; `/p/advancedmedia` and `/p/advancedmedia/` → `rest: "/"`.
  - `brandHref(path: string, slug: string): string` — prefixes `/p/<slug>` unless `slug === DEFAULT_BRAND_SLUG`; keeps query strings; leaves absolute URLs untouched.
  - `getBrand(): Promise<Brand>` — reads request header `x-brand`, falls back to default.
  - `BRAND_HEADER = "x-brand"`.
  - `useBrand(): Brand`, `useBrandHref(): (path: string) => string` for client components.

- [ ] **Step 1: Write the failing tests:**
  - `parsePreviewPath` cases above; `parsePreviewPath("/products") === null`; `parsePreviewPath("/p/") === null`; `parsePreviewPath("/p/../admin") === null`.
  - `brandHref("/products?cat=Micros", "advancedmedia") === "/p/advancedmedia/products?cat=Micros"`; `brandHref("/products", "volta") === "/products"`; `brandHref("https://wa.me/1", "advancedmedia") === "https://wa.me/1"`.
  - proxy (construct `new NextRequest("http://localhost/p/advancedmedia/products")`): response is a rewrite to `/products`, forwarded request header `x-brand: advancedmedia`, response header `x-robots-tag: noindex, nofollow`.
  - proxy: `/p/AdvancedMedia/products` → 308 redirect to `/p/advancedmedia/products`; `/p/unknown/products` → `NextResponse.next()` with no rewrite and no `x-brand` header (no `app/p` route exists, so Next renders the 404 page; e2e in Task 13 asserts status 404).
  - proxy: `/p/advancedmedia/admin/orders` without session cookie → redirect to `/p/advancedmedia/admin/login`; `/admin/orders` without cookie → `/admin/login` (NOIR behaviour kept).
- [ ] **Step 2:** Run both test files. Expected: FAIL.
- [ ] **Step 3:** Implement. Proxy uses `NextResponse.rewrite(url, { request: { headers } })` per `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`; matcher covers `/p/:path*`, `/admin`, `/admin/:path*`. `requireUser` builds its redirect target with `brandHref(…, (await getBrand()).slug)`.
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5:** Commit "feat: /p/<slug> brand routing".

### Task 5: Theming, header/footer, banners, SEO safeguards

**Files:**
- Modify: `app/layout.tsx` (brand CSS variables on `<html style>`, `lang="fr"`, metadata from brand, `robots` noindex for private), `app/globals.css` (Volta defaults in `@theme`; tokens `--color-primary`, `--color-on-primary`, `--color-accent`, `--color-background`, `--color-surface`, `--color-on-surface`, `--color-on-surface-variant` mapped from `BrandColors`), `components/Header.tsx`, `components/Footer.tsx`, `app/robots.ts`, `app/sitemap.ts`, every internal `href`/`router.push`/`redirect` in storefront and admin (route through `brandHref`/`useBrandHref`)
- Create: `components/brand/DemoBanner.tsx`, `lib/brand/theme.ts`
- Test: `tests/unit/theme.test.ts`

**Interfaces:**
- Consumes: Task 3, Task 4.
- Produces: `brandCssVars(brand: Brand): Record<string, string>`; `bannerText(brand: Brand): string`.

- [ ] **Step 1: Write the failing tests:** `brandCssVars(volta)["--color-primary"] === volta.colors.primary` (and each mapped token); `bannerText(advancedmedia)` equals the private banner verbatim with "Advanced Media DZ"; `bannerText(volta)` equals the public banner verbatim; `robots()` output disallows `/p/`; `sitemap()` contains no URL with `/p/`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement; replace every hard-coded "NOIR"/luxury copy in Header/Footer/home hero with brand fields (`name`, `logo`, `tagline`, `deliveryPromise`, `heroImage`, `instagram` for private brands). `SmoothScroll`/Lenis stays.
- [ ] **Step 4:** Run tests + `npm run build`. Expected: PASS, build OK. Grep check: `grep -ri "noir" app components lib` returns nothing user-visible.
- [ ] **Step 5:** Commit "feat: brand theming, banners, preview noindex".

### Task 6: French copy everywhere

**Files:**
- Modify: all storefront pages under `app/(storefront)/**`, admin pages under `app/admin/**`, `components/**`, error strings in `lib/orders.ts`, `lib/admin/*.ts`, `lib/auth/login.ts`
- Test: update `tests/unit/checkout-rules.test.ts`, `tests/unit/admin-rules.test.ts` expectations to the French strings

- [ ] **Step 1:** Update the two unit test files to expect French messages (e.g. phone error `"Entrez un numéro de mobile valide (05, 06 ou 07…)."`, name error `"Entrez votre nom complet."`).
- [ ] **Step 2:** Run them. Expected: FAIL on the changed messages.
- [ ] **Step 3:** Translate all copy (product/order statuses keep their stored codes; only labels change). Status labels for the codes in `lib/order-status.ts`: NEW "Nouvelle", CALLED "Appelée", CUSTOMER_UNREACHABLE "Client injoignable", CONFIRMED "Confirmée", PREPARING "En préparation", AT_DELIVERY_DESK "Au bureau de livraison", OUT_FOR_DELIVERY "En cours de livraison", DELIVERED "Livrée", REFUSED "Refusée", RETURNED "Retournée", CANCELED "Annulée"; filter tab "to-call" label "À appeler".
- [ ] **Step 4:** Run `npm test`. Expected: PASS. Grep for leftover English UI strings in `app/` and `components/` returns none.
- [ ] **Step 5:** Commit "feat: French copy".

### Task 7: Data model, seed, photos, credits

**Files:**
- Modify: `prisma/schema.prisma` (+ migration `add_maker_specs_store_slug`)
- Create: `lib/specs.ts`, `prisma/seed-demo.ts`, `prisma/data/demo-products.ts`, `lib/credits.ts`, `app/(storefront)/credits/page.tsx`, `public/products/*.jpg`
- Modify: `package.json` scripts (`"db:seed-demo": "tsx prisma/seed-demo.ts"`)
- Test: `tests/unit/specs.test.ts`

**Interfaces:**
- Produces:
  - Prisma: `Product.maker String @default("")` + `@@index([maker])`, `Product.specs Json @default("[]")`, `Order.storeSlug String @default("volta")` + `@@index([storeSlug, createdAt])`.
  - `type Spec = { label: string; value: string }`; `parseSpecs(value: unknown): Spec[]` (drops entries without non-empty string `label`/`value`, max 20, trims).
  - `CREDITS: { file: string; author: string; source: "Unsplash" | "Pexels"; url: string }[]`.
  - Seed creates ADMIN user from `ADMIN_PASSWORD` (email `willou@ahmedouael.com`) and DEMO user from `DEMO_PASSWORD` (email `demo@ahmedouael.com`, role `"DEMO"` — role added in Task 11; seed writes the string).

- [ ] **Step 1: Write the failing test:** `parseSpecs([{label:"Connecteur",value:"USB-C"}])` returns it; `parseSpecs("x")` → `[]`; `parseSpecs([{label:"",value:"a"},{label:"A"}])` → `[]`; 25 valid entries → length 20; whitespace trimmed.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement `parseSpecs`, schema + migration, and the seed: categories Caméras, Micros, Éclairage, Informatique, Accessoires; 8 products each (40); fictional makers (e.g. Lumex, Sonora, Vektor, Optiq, Nordlicht); 1–3 variants each using `size` as Version; prices in DA; stock so ≥4 variants have available 1–2 and ≥3 products are fully out of stock; wilayas/communes via the existing seed path. Download ~40 Unsplash/Pexels photos to `public/products/` and record each in `CREDITS`. `/credits` lists them.
- [ ] **Step 4:** Run `npm test`, `npx prisma migrate dev`, `npm run db:seed-demo` against the live demo DB. Expected: PASS; seed prints 40 products.
- [ ] **Step 5:** Commit "feat: demo catalogue with makers, specs and credits".

### Task 8: Catalogue search and filters

**Files:**
- Create: `lib/catalog-filters.ts`, `components/catalog/FilterSheet.tsx`
- Modify: `lib/catalog.ts` (`CatalogProduct` gains `maker: string`, `specs: Spec[]`; `getProducts(filters?: CatalogFilters)`), `app/(storefront)/products/page.tsx`
- Test: `tests/unit/catalog-filters.test.ts`

**Interfaces:**
- Consumes: `parseSpecs` (Task 7), `useBrandHref` (Task 4).
- Produces:
  - `type CatalogFilters = { q?: string; cat?: string; makers: string[]; min?: number; max?: number; inStock: boolean; sort: "new" | "price-asc" | "price-desc" }`
  - `parseFilters(sp: Record<string, string | string[] | undefined>): CatalogFilters`
  - `buildProductWhere(f: CatalogFilters): Prisma.ProductWhereInput` (text, category, makers; price and stock are applied after loading because they depend on variant aggregates)
  - `applyAggregateFilters(products: CatalogProduct[], f: CatalogFilters): CatalogProduct[]` (price range on `price`, `inStock` = any variant `available > 0`, then sort)

- [ ] **Step 1: Write the failing tests:**
  - `parseFilters({ q: " micro ", cat: "Micros", maker: ["Sonora","Lumex"], min: "5000", max: "20000", stock: "1", sort: "price-asc" })` → trimmed `q`, both makers, numbers, `inStock: true`, `sort: "price-asc"`.
  - garbage: `min: "abc"` → `min` undefined; `min: "9000", max: "100"` → both dropped; `cat: ["A","B"]` → `"A"`; `q` of 500 chars → truncated to 80; `sort: "x"` → `"new"`.
  - `buildProductWhere({ q: "micro", … })` contains `OR` on `name`/`maker` with `contains: "micro", mode: "insensitive"`.
  - `applyAggregateFilters`: `inStock` removes products whose variants all have `available: 0`; price range inclusive; `price-desc` order.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement; page uses a GET `<form>` (works without JS), `FilterSheet` is a bottom sheet on phones with auto-submit when JS runs; empty state "Aucun produit ne correspond" + link "Réinitialiser les filtres" (`useBrandHref()("/products")`).
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5:** Commit "feat: catalogue search and filters".

### Task 9: Product page: specs, Version, stock badge

**Files:**
- Create: `lib/stock.ts`, `components/product/SpecsTable.tsx`
- Modify: `app/(storefront)/products/[slug]/ProductDetailClient.tsx`, `lib/catalog.ts` (variant sort: replace clothing `SIZE_ORDER` with the seed order / price ascending)
- Test: `tests/unit/stock.test.ts`

**Interfaces:**
- Produces: `stockBadge(available: number): { label: string; tone: "ok" | "low" | "out" }` — `0` → `{ "Rupture", "out" }`; `1`–`2` → `{ "Plus que N", "low" }` with N the number; `≥3` → `{ "En stock", "ok" }`.

- [ ] **Step 1: Write the failing test** for the three ranges (0, 1, 2, 3, 50).
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement; variant picker label "Version"; maker shown above the name; specs table hidden when `specs` is empty; out-of-stock variants disabled.
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5:** Commit "feat: product specs, versions and stock badge".

### Task 10: Checkout test data, storeSlug, WhatsApp link

**Files:**
- Create: `lib/whatsapp.ts`
- Modify: `app/(storefront)/checkout/actions.ts`, `app/(storefront)/checkout/CheckoutForm.tsx`, `lib/orders.ts` (`createOrder(input, ctx: { storeSlug: string })`; result on success adds `summary: OrderSummary`), `app/(storefront)/checkout/success/page.tsx` + a small client component reading `sessionStorage`
- Test: `tests/unit/whatsapp.test.ts`, extend `tests/integration/orders.test.ts`

**Interfaces:**
- Consumes: `getBrand` (Task 4), `Brand` (Task 3).
- Produces:
  - `type OrderSummary = { orderId: string; customerName: string; items: { name: string; version: string | null; quantity: number; unitPrice: number }[]; wilaya: string; commune: string | null; deliveryFee: number; total: number }`
  - `buildWhatsAppOrderLink(summary: OrderSummary, phone: string | undefined, brand: Brand): string | null`
  - `TEST_CUSTOMER = { fullName: "Client Démo", phone: "0555 00 00 00" }`
  - sessionStorage key `"volta:lastOrderWhatsApp"` holding the URL.

- [ ] **Step 1: Write the failing tests:**
  - `buildWhatsAppOrderLink(summary, "213555000000", volta)` starts with `https://wa.me/213555000000?text=`; decoded text contains `#<orderId>`, each item line, the wilaya, the fee and total formatted with `formatDZD`, and no `[Démo` prefix.
  - same with `advancedmedia` → decoded text starts with `[Démo Advanced Media DZ]`.
  - 12 items → 10 item lines + `+2 articles`.
  - phone `undefined` or `""` → `null`; phone `"+213 555 00 00 00"` → digits only in the URL.
  - accents survive: name `"Énergie Câble"` round-trips through `decodeURIComponent`.
  - `normalizePhone(TEST_CUSTOMER.phone) === "0555000000"`.
  - integration: `createOrder(validInput, { storeSlug: "advancedmedia" })` stores `storeSlug = "advancedmedia"` even when `validInput.storeSlug = "volta"` is supplied by the client.
  - success page (server component test or e2e in Task 13): `?order=<other id>` renders only the number, never items or names.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. The action calls `createOrder(input, { storeSlug: (await getBrand()).slug })`, builds the link server-side, returns it; the form saves it to sessionStorage, then navigates with `useBrandHref()("/checkout/success?order=ID")`. When `DEMO_MODE === "true"` the form shows "N'entrez pas vos vraies coordonnées" and the button "Remplir avec des données de test" (fills `TEST_CUSTOMER`).
- [ ] **Step 4:** Run unit + integration (`TEST_DATABASE_URL` set). Expected: PASS.
- [ ] **Step 5:** Commit "feat: demo checkout helpers and WhatsApp order link".

### Task 11: Read-only DEMO role and per-brand dashboard

**Files:**
- Create: `lib/auth/permissions.ts`
- Modify: `lib/auth/session.ts` (`type Role = "ADMIN" | "STAFF" | "DEMO"`), every mutating action: `app/admin/(dashboard)/orders/actions.ts` (`saveOrderDetails`, `setOrderStatus`), `products/actions.ts` (`saveProductAction`, `deleteProductAction`, `createCategoryAction`), `users/actions.ts` (all three), `lib/admin/orders.ts` + `lib/admin/stats.ts` + `lib/admin/customers.ts` (filter by `storeSlug`), admin nav (hide Users for DEMO), `app/admin/login/page.tsx` (show demo credentials when `DEMO_MODE`)
- Test: `tests/unit/permissions.test.ts`, update `tests/unit/admin-rules.test.ts`

**Interfaces:**
- Produces: `DEMO_READ_ONLY_ERROR = "Action désactivée en mode démo"`; `canWrite(user: SessionUser): boolean` (false only for DEMO); `assertCanWrite(user: SessionUser): { ok: false; error: string } | null`.

- [ ] **Step 1: Write the failing tests:** `canWrite` true for ADMIN and STAFF, false for DEMO; `assertCanWrite(demoUser)` returns `{ ok: false, error: DEMO_READ_ONLY_ERROR }`; returns `null` for ADMIN. Admin list helpers called with `storeSlug: "advancedmedia"` return only that brand's orders (integration, test DB).
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement; each mutating action: `const user = await requireUser(); const denied = assertCanWrite(user); if (denied) return denied;` before any write. `requireUser("ADMIN")` checks treat DEMO like ADMIN for **reading** pages (DEMO sees products/orders pages) but writes still blocked.
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5:** Commit "feat: read-only demo role and per-brand dashboard".

### Task 12: Nightly reset

**Files:**
- Create: `scripts/reset-demo.ts`, `.github/workflows/reset-demo.yml`
- Modify: `package.json` (`"db:reset-demo": "tsx scripts/reset-demo.ts"`)
- Test: `tests/integration/reset-demo.test.ts`

**Interfaces:**
- Consumes: `prisma/data/demo-products.ts` (Task 7) for seed stock values.
- Produces: `resetDemo(prisma: PrismaClient): Promise<{ ordersDeleted: number; customersDeleted: number }>`.

- [ ] **Step 1: Write the failing integration test:** after creating 2 orders on the test branch, `resetDemo` returns `ordersDeleted >= 2`; afterwards `order`, `orderItem`, `orderStatusHistory`, `customer` counts are 0; every variant's `physicalStock` equals its seed value and `reservedStock` is 0; product and user counts unchanged.
- [ ] **Step 2:** Run with `TEST_DATABASE_URL`. Expected: FAIL.
- [ ] **Step 3:** Implement in one transaction. Workflow: `on: schedule: - cron: "0 3 * * *"` plus `workflow_dispatch`; Node 24; `npm ci`; `npm run db:reset-demo` with `DATABASE_URL: ${{ secrets.DATABASE_URL }}`.
- [ ] **Step 4:** Run test. Expected: PASS.
- [ ] **Step 5:** Commit "feat: nightly demo reset".

### Task 13: End-to-end tests on both brands

**Files:**
- Create: `tests/e2e/demo.spec.ts`; Modify: `tests/e2e/shop.spec.ts` (French copy), `playwright.config.ts` (start server with `DATABASE_URL` = `TEST_DATABASE_URL`, `DEMO_MODE=true`, `STORE_WHATSAPP=213555000000`)

- [ ] **Step 1: Write the tests** (phone project), each run for `base = ""` and `base = "/p/advancedmedia"`:
  - search "micro" from the header finds a seeded microphone within the first results;
  - checking "En stock uniquement" hides a seeded out-of-stock product;
  - product page shows specs table and a stock badge;
  - add to cart → checkout → "Remplir avec des données de test" → choose a wilaya → place order → success shows the number and a WhatsApp link (`href` starts `https://wa.me/213555000000`); for the preview, decoded text starts `[Démo Advanced Media DZ]`; URL stays under `base`;
  - demo login (credentials shown on the login page) → the order appears; the status change returns "Action désactivée en mode démo"; under the preview, Volta orders are not listed;
  - preview pages have `meta[name=robots][content*=noindex]`, response header `x-robots-tag`, and the private banner text; `/p/AdvancedMedia` lands on `/p/advancedmedia`; `/p/unknown` shows the 404 page.
- [ ] **Step 2:** Run `npm run test:e2e`. Expected: all PASS. Then run `npm run db:reset-demo` against the test branch.
- [ ] **Step 3:** Commit "test: e2e for public and private brands".

### Task 14: Go live, recipe, first video

**Files:**
- Create: `docs/add-a-store.md` (spec §10 steps, verbatim order)

- [ ] **Step 1:** Write `docs/add-a-store.md`.
- [ ] **Step 2:** Netlify: set `DEMO_MODE=true`, `STORE_WHATSAPP` (Willou's number), `ADMIN_PASSWORD`, `DEMO_PASSWORD`; deploy; run `npm run db:seed-demo` against the live DB.
- [ ] **Step 3 (Willou, manual):** add the `demo` DNS record at Namecheap exactly as Netlify's custom-domain screen shows; instructions with source links given at that moment.
- [ ] **Step 4:** GitHub repo secret `DATABASE_URL` (live); trigger the reset workflow once by hand. Expected: green run, orders count 0 afterwards.
- [ ] **Step 5:** Verify on a phone: `https://demo.ahmedouael.com` and `https://demo.ahmedouael.com/p/advancedmedia` load, demo login works, `curl -I` on the preview shows `x-robots-tag: noindex, nofollow`.
- [ ] **Step 6 (Willou):** record the 30-second Advanced Media video (search → product → order with wilaya → dashboard).
- [ ] **Step 7:** Commit "docs: add-a-store recipe"; push.
