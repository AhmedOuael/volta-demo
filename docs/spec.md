# Branded demo store template — Volta Studio + private store previews

**Date:** 2026-10-17 · **Status:** draft, awaiting review · **Owner:** Willou (Ahmed Ouael)

This spec lives in the portfolio repo until the `volta-demo` repo exists; it moves there as `docs/spec.md` in the first commit.

## 1. Purpose

Algerian audiovisual and tech shops sell through Instagram with no website. Customers scroll the feed or DM for every price and stock question (24 such stores are in the Pipeline tracker, Lane C).

Willou contacts them by Instagram DM. When a store replies, he wants to show **their own store**: their name, logo and colours on a working shop, on their phone, within a day. Building that from scratch per store is too slow, so we build **one store template where a brand is a single file**.

**Success criteria**

- A new store's private preview takes **one brand file + one logo** and about 20–30 minutes.
- Opening their private link on a phone, the owner finds a given product in under 10 seconds (search or filters).
- They can place a test order (cash on delivery, wilaya + commune, delivery fee shown) and send it to WhatsApp.
- With the demo login, they see that order appear in the admin dashboard, under their own brand.
- Nobody can mistake a preview for the store's official shop; previews never appear in search engines.
- No one can damage the demo or leave personal data in it for more than a day.
- **First brand ready: Advanced Media DZ**, so the preview exists before he replies.

## 2. Decisions made during brainstorming

| Decision | Choice | Reason |
|---|---|---|
| Form | Live, working demo site | One link per DM; also the source for screen recordings |
| Build approach | Fork NOIR (`C:\Dev\noir-luxe`) | Reuses checkout with wilayas/communes, stock reservation, order limits and the admin dashboard |
| Branding | One template, one brand file per store | New store in ~20–30 min |
| Public default brand | **Volta Studio** (fictional) | No Algerian business uses the name (web search, 2026-10-17); safe to share anywhere |
| Store previews | Private, unlisted link **+** a 30-second screen video | Owner can try it; the video works even if they never open links |
| Store identity in previews | Their name, colours from their Instagram, logo from their profile picture; shared sample catalogue | Recognisably theirs without copying their product photos; ask for a high-quality logo once they say yes |
| WhatsApp in previews | Always Willou's number, message prefixed `[Démo <store>]` | Their customers never receive fake orders; when the owner tests it, the conversation comes to Willou |
| Language | French only | Most target bios are French; Arabic is a later option |
| Product photos | Free-licence photos (Unsplash / Pexels) | Realistic, no copyright risk; product names are realistic but fictional |
| Hosting | Netlify (free plan) | Vercel Hobby is limited to non-commercial personal use; a sales demo can count as commercial |
| Database | New Neon project `volta-demo`, Frankfurt region | Separate from NOIR's data; closest region to Algeria |
| Address | `demo.ahmedouael.com` | Willou owns `ahmedouael.com` |

## 3. Scope

**In scope (v1)**

1. **Brand system:** every brand-specific value comes from a brand file (§5). No brand name, colour or logo is hard-coded elsewhere.
2. **Brand routing:** `/` serves Volta Studio; `/p/<slug>/…` serves the same store under brand `<slug>` (§4).
3. **Private-preview safeguards:** `noindex`, excluded from sitemap, unlinked, permanent "maquette" banner (§8).
4. Brand files for **Volta Studio** (public) and **Advanced Media DZ** (private).
5. All storefront and admin text in French; a tech-store look instead of NOIR's luxury fashion.
6. Catalogue: 5 categories (Caméras, Micros, Éclairage, Informatique, Accessoires), ~40 sample products, prices in DA, shared by all brands.
7. Product data: `maker` (manufacturer) and `specs` on products; variant option shown as "Version" (kit, colour) (§6).
8. Search + filters on `/products`: text (name, maker), category, maker, price range, "en stock uniquement", all in the URL query string.
9. Product page: gallery, price, specs table, variant picker, stock badge ("En stock", "Plus que N", "Rupture").
10. Checkout (NOIR's): cash on delivery, wilaya → commune, delivery fee, stock reserved on order.
11. Order confirmation: "Envoyer la commande sur WhatsApp" button (§7).
12. Demo mode: test-data checkout helper, read-only demo admin login, nightly data reset (§8).
13. Deployment on Netlify at `demo.ahmedouael.com`.
14. A written recipe for adding a store and recording its 30-second video (§10).

**Out of scope (v1):** Arabic/RTL, per-store product catalogues, PC configurator (Informatics), rental calendar (Chakib Camera Store), online payment, real photo uploads (R2), email notifications. Each can be a later, separate spec.

## 4. Architecture

```
Browser ──► Netlify (Next.js 16 app, SSR + server actions)
              │
              ├── proxy.ts: /p/<slug>/… → rewrite to /… + header x-brand=<slug>
              ├── lib/brand: resolve brand (header → brand file, default "volta")
              ├── Prisma 7 ──► Neon Postgres "volta-demo" (Frankfurt)
              └── /public/products/*, /public/brands/<slug>/*  (static assets)

GitHub Actions (nightly cron) ──► reset script ──► Neon
```

- **Repo:** new folder `C:\Dev\volta-demo`, copied from `noir-luxe` without `node_modules`, `.env*`, `.next`, `test-results`, or git history; new private GitHub repo.
- **Stack unchanged:** Next.js 16.4, React 19, Prisma 7 + `@prisma/adapter-pg`, Tailwind 4, Vitest, Playwright.
- **Brand routing:**
  - `proxy.ts` (NOIR's existing Next.js proxy file) matches `/p/<slug>` and `/p/<slug>/<rest>`. If `<slug>` is a known brand, it rewrites to `/<rest>` and sets request header `x-brand: <slug>`. Unknown slug → 404.
  - Server components read the active brand through `getBrand()` (reads `x-brand`, falls back to the default brand).
  - All internal links go through `brandHref(path)`, which keeps the `/p/<slug>` prefix when a preview is active. Admin pages are branded the same way (`/p/<slug>/admin`).
  - Theme colours are applied as CSS custom properties on `<html>` from the brand file; Tailwind utilities read those variables.
- **Removed from the fork:** R2 storage (`lib/storage.ts` and the upload path in admin product forms). Product images and brand logos are static files.
- **Configuration (env vars):** `DATABASE_URL`, `DATABASE_URL_POOLED`, `DEMO_MODE=true`, `STORE_WHATSAPP` (Willou's business number, digits, international format), `ADMIN_PASSWORD` and `DEMO_PASSWORD` (used by the seed).

## 5. Brand files

One file per brand in `brands/<slug>.ts`, registered in `brands/index.ts`. Typed by a `Brand` interface and checked by tests:

| Field | Example (Advanced Media) | Used for |
|---|---|---|
| `slug` | `advancedmedia` | URL `/p/advancedmedia` |
| `name` | `Advanced Media DZ` | Header, titles, banner, WhatsApp prefix |
| `visibility` | `"private"` (Volta: `"public"`) | Private safeguards (§8) |
| `logo` | `/brands/advancedmedia/logo.png` + `logoAlt` | Header, admin, favicon |
| `colors` | `primary`, `onPrimary`, `accent`, `background`, `surface`, `text`, `muted` | CSS custom properties |
| `fonts` | `display`, `body` (from fonts installed via `@fontsource`) | Typography |
| `tagline` | "Accessoires audiovisuels et informatique" | Home hero |
| `deliveryPromise` | "Livraison 69 wilayas · Paiement à la livraison" | Header strip, checkout |
| `heroImage` | `/products/hero-studio.jpg` | Home hero |
| `instagram` | `advancedmedia.dz` | Footer link (private brands only) |

- Advanced Media's colours come from their Instagram profile picture (orange and navy); exact values are picked at build time and must pass the contrast test.
- Their logo is their Instagram profile picture, saved at the best available size. A high-quality logo is requested only after they agree to talk.
- **Contrast rule (tested):** `text` on `background`, `text` on `surface`, and `onPrimary` on `primary` must each reach WCAG AA (4.5:1). A brand file that fails cannot ship.

## 6. Data model changes

- `Product.maker String` (required, indexed): the manufacturer shown to shoppers, e.g. "Lumex", "Sonora". Named `maker` so it is never confused with a store brand (§5).
- `Product.specs Json @default("[]")`: array of `{ label: string, value: string }` rendered as the specs table; parsed in code, invalid entries dropped.
- `ProductVariant.size` is **reused** as the "Version" option (e.g. "Kit 2 émetteurs"); only the UI label changes, so NOIR's checkout code stays untouched.
- `Order.storeSlug String @default("volta")` (indexed): the brand the order was placed under; the dashboard filters by the active brand.
- Seed (`prisma/seed-demo.ts`): 5 categories, ~40 products (8 per category) with fictional makers, 1–3 variants each, stock spread so some show "Plus que 2" and a few "Rupture"; wilayas + communes from `prisma/data/communes.json`; one ADMIN user (Willou, `ADMIN_PASSWORD`) and one DEMO user (`DEMO_PASSWORD`, shown on the login page).

## 7. Storefront behaviour

**Search & filters (`/products`)**

- Query params: `q`, `cat`, `maker` (repeatable), `min`, `max`, `stock=1`, `sort` (`new` | `price-asc` | `price-desc`).
- Text search: case-insensitive match on product name and maker (Prisma `contains` + `mode: "insensitive"`).
- "In stock" = sum over active variants of `physicalStock - reservedStock` > 0.
- Empty result: "Aucun produit ne correspond" + a "Réinitialiser les filtres" link.
- Filters work without JavaScript (plain GET form); JavaScript only adds auto-submit.

**WhatsApp order message**

- Pure function `buildWhatsAppOrderLink(order, phone, brand)` → `https://wa.me/<digits>?text=<encoded>`.
- Text: for private brands, first line `[Démo <brand.name>]`; then order number, items (name, version, quantity, price), wilaya/commune, delivery fee, total in DA, customer name. Item list truncated after 10 lines with "+N articles".
- Always uses `STORE_WHATSAPP`, never a store's real number. If it's missing, the button is hidden.

## 8. Demo mode and preview safeguards

**Demo mode (`DEMO_MODE=true`, all brands)**

- **Checkout:** notice "N'entrez pas vos vraies coordonnées" + button "Remplir avec des données de test" (fictional name, fake phone such as `0555 00 00 00` that passes the existing phone-format rule).
- **Admin:** login page shows the demo credentials. Role `DEMO` can read every admin page; every mutating server action calls `assertCanWrite(session)` and returns "Action désactivée en mode démo" for DEMO. Willou's ADMIN account is unaffected. Users page hidden for DEMO.
- **Nightly reset:** GitHub Actions workflow (cron `0 3 * * *` UTC) runs `npm run db:reset-demo` with repository secret `DATABASE_URL`. It deletes orders, order items, status history and customers, restores stock to seed values, and keeps catalogue, wilayas and users. There is no public reset route.
- **Abuse limits:** NOIR's `lib/order-limits.ts` stays active.
- **Privacy:** visitor input lives at most until the next reset. No analytics beyond page views (Umami optional, cookieless).

**Banners**

- Public brand (Volta): "Boutique de démonstration — aucune commande n'est réelle. Conçue par Willou · ahmedouael.com".
- Private brand: "Maquette proposée à <brand.name> par Willou — pas une boutique officielle", always visible, not dismissible.

**Private brands only**

- `<meta name="robots" content="noindex, nofollow">` on every page under `/p/<slug>`, plus an `X-Robots-Tag: noindex` response header set in `proxy.ts`.
- `/p/` excluded from `sitemap.ts` and disallowed in `robots.ts`.
- No link to any `/p/` URL anywhere on the public site or the portfolio.
- Orders placed in a preview are tagged with the brand slug (`Order.storeSlug`, §6) so the dashboard shows only that brand's test orders.

## 9. Look & feel

- Volta Studio: wordmark "VOLTA STUDIO", dark UI with one electric accent.
- Every brand uses the same layout; only brand-file values change.
- Mobile first: product grid 2 columns on phones, sticky filter button opening a bottom sheet.
- Photo credits page (`/credits`) listing each Unsplash/Pexels photo and author.

## 10. Adding a store (recipe, written as `docs/add-a-store.md`)

1. Save their Instagram profile picture as `public/brands/<slug>/logo.png`.
2. Copy `brands/volta.ts` to `brands/<slug>.ts`; set name, slug, `visibility: "private"`, colours (picked from the logo), tagline and delivery promise from their bio.
3. Register it in `brands/index.ts`; run `npm test` (contrast and schema checks).
4. Commit and push; Netlify deploys.
5. Record the 30-second video in a phone-sized browser: search a product → product page → order with wilaya → order appears in the dashboard.
6. Send the private link and the video in the DM thread.

## 11. Testing

- Keep and update NOIR's tests: `tests/unit/admin-rules.test.ts`, `tests/unit/checkout-rules.test.ts`, `tests/integration/orders.test.ts`, `tests/e2e/shop.spec.ts` (French copy, new branding).
- New unit tests:
  - every registered brand file matches the `Brand` type and passes the contrast rule;
  - `getBrand` (header present / missing / unknown) and `brandHref` (with and without a preview prefix);
  - proxy rewrite: known slug rewrites + sets header + noindex header; unknown slug → 404;
  - specs parser; filter → Prisma `where` builder;
  - `buildWhatsAppOrderLink` (encoding, `[Démo …]` prefix for private brands, truncation, missing phone);
  - `assertCanWrite` for ADMIN / STAFF / DEMO.
- New integration test: reset script empties orders and restores stock, keeps products and users.
- New e2e (Playwright, phone viewport), run for `/` and `/p/advancedmedia`: search finds a product; filters narrow results; test order with the test-data button; confirmation shows the WhatsApp link; demo login sees the order and cannot change its status; preview pages carry `noindex` and the "maquette" banner; links stay under `/p/advancedmedia`.

## 12. Delivery

- Willou adds one DNS record at Namecheap for `demo` (exact record from Netlify's custom-domain screen; instructions with sources at that step).
- Before deploying: confirm on Netlify's own pricing page that the free plan allows this use.
- Done = all tests pass; `demo.ahmedouael.com` (Volta) and `demo.ahmedouael.com/p/advancedmedia` live; nightly reset ran once successfully; demo login works on a phone; the Advanced Media video is recorded.

## 13. Open items

1. ~~Netlify free-plan terms~~ Resolved 2026-10-17: Netlify Terms of Use set no personal-use limit (https://netlify.com/legal/terms-of-use) and Netlify staff confirm commercial use on the free plan (https://answers.netlify.com/t/can-we-use-netlify-free-plan-for-commercial-purposes/41545/2).
2. Volta Studio's accent colour and fonts, and Advanced Media's exact colours (shown as a quick visual choice at the start of the build).
