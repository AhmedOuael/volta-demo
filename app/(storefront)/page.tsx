import Hero from "@/components/Hero";
import CategoryTiles from "@/components/home/CategoryTiles";
import ProductTabs from "@/components/home/ProductTabs";
import SpotlightTiles from "@/components/home/SpotlightTiles";
import ServiceCards from "@/components/home/ServiceCards";
import StatsStrip from "@/components/home/StatsStrip";
import MakerMarquee from "@/components/home/MakerMarquee";
import PromoBand from "@/components/home/PromoBand";
import QuoteForm from "@/components/home/QuoteForm";
import ProductRail from "@/components/ProductRail";
import Link from "@/components/brand/BrandLink";
import RevealWords from "@/components/motion/RevealWords";
import { getWilayas } from "@/lib/delivery";
import { getProducts } from "@/lib/catalog";
import { getBrand } from "@/lib/brand/server";
import { brandHref } from "@/lib/brand/routing";
import { CATEGORIES } from "@/lib/categories";
import { CATEGORY_RAILS, CATEGORY_TILES, HERO_SLIDES, PROMO, SPOTLIGHTS, homeStats } from "@/lib/home";
import { priceLabel } from "@/lib/merchandising";
import { SITE, jsonLd } from "@/lib/site";

export default async function HomePage() {
  const brand = await getBrand();
  const href = (path: string) => brandHref(path, brand.slug);
  const [products, wilayas] = await Promise.all([getProducts(), getWilayas()]);
  const whatsapp = (process.env.STORE_WHATSAPP ?? "").replace(/\D/g, "");
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  // Picks whose product was hidden or deleted in the admin are simply skipped.
  const slides = HERO_SLIDES.flatMap((s) => {
    const p = bySlug.get(s.slug);
    return p ? [{ ...s, image: p.image, price: priceLabel(p) }] : [];
  });
  const tiles = CATEGORIES.map((c) => ({
    name: c,
    href: href(`/products?cat=${encodeURIComponent(c)}`),
    image: bySlug.get(CATEGORY_TILES[c])?.image ?? products.find((p) => p.categories.includes(c))?.image ?? null,
  }));
  const spotlights = SPOTLIGHTS.flatMap((s) => {
    const p = bySlug.get(s.slug);
    return p ? [{ title: s.title, tagline: s.tagline, href: href(`/products/${s.slug}`), image: p.image }] : [];
  });

  const promoProduct = bySlug.get(PROMO.slug);
  const promo = promoProduct && { ...PROMO, price: priceLabel(promoProduct), href: href(`/products/${PROMO.slug}`), image: promoProduct.image };
  const makers = [...new Set(products.map((p) => p.maker))].sort((a, b) => a.localeCompare(b));
  const rails = CATEGORY_RAILS.map((c) => ({ name: c, products: products.filter((p) => p.categories.includes(c)).slice(0, 8) })).filter((r) => r.products.length > 0);

  return (
    <div>
      {brand.visibility === "public" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd({
            "@context": "https://schema.org",
            "@type": "Store",
            name: brand.name,
            url: SITE.url,
            description: brand.tagline,
            address: { "@type": "PostalAddress", addressCountry: "DZ" },
            currenciesAccepted: "DZD",
            paymentAccepted: "Paiement à la livraison",
          })}
        />
      )}

      {slides.length > 0 ? (
        <Hero slides={slides} />
      ) : (
        <h1 className="px-5 md:px-16 pt-16 font-display text-4xl font-extrabold">{brand.tagline}</h1>
      )}

      <section aria-label="La boutique en chiffres" className="px-5 md:px-16 pt-10 md:pt-14">
        <StatsStrip stats={homeStats(products, wilayas.length)} />
      </section>

      <section aria-label="Nos marques" className="pt-10 md:pt-14">
        <MakerMarquee makers={makers} />
      </section>

      <section aria-labelledby="categories" className="px-5 md:px-16 pt-16 md:pt-20">
        <RevealWords id="categories" text="Explorer par catégorie" className="font-display text-2xl md:text-3xl font-bold mb-8" />
        <CategoryTiles tiles={tiles} />
      </section>

      <section className="px-5 md:px-16 pt-16 md:pt-24">
        <ProductTabs products={products} />
      </section>

      {promo && (
        <section aria-label={PROMO.kicker} className="px-5 md:px-16 pt-16 md:pt-24">
          <PromoBand promo={promo} />
        </section>
      )}

      {rails.map((r) => (
        <section key={r.name} aria-label={r.name} className="px-5 md:px-16 pt-16 md:pt-24 overflow-hidden">
          <ProductRail
            products={r.products}
            label={r.name}
            header={
              <div className="flex items-end justify-between gap-4">
                <RevealWords text={r.name} className="font-display text-2xl md:text-3xl font-bold" />
                <Link href={href(`/products?cat=${encodeURIComponent(r.name)}`)} className="shrink-0 text-sm font-semibold underline underline-offset-4 hover:text-accent transition-colors">
                  Voir tout
                </Link>
              </div>
            }
          />
        </section>
      ))}

      {spotlights.length > 0 && (
        <section aria-label="À découvrir" className="px-5 md:px-16 pt-16 md:pt-24">
          <SpotlightTiles items={spotlights} />
        </section>
      )}

      {whatsapp && (
        <section id="devis" aria-labelledby="devis-title" className="px-5 md:px-16 pt-16 md:pt-24 scroll-mt-28">
          <QuoteForm phone={whatsapp} />
        </section>
      )}

      <section className="px-5 md:px-16 py-16 md:py-24">
        <ServiceCards deliveryPromise={brand.deliveryPromise} />
      </section>
    </div>
  );
}
