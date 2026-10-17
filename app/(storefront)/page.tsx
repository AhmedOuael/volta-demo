import Hero from "@/components/Hero";
import CategoryTiles from "@/components/home/CategoryTiles";
import ProductTabs from "@/components/home/ProductTabs";
import SpotlightTiles from "@/components/home/SpotlightTiles";
import ServiceCards from "@/components/home/ServiceCards";
import { getProducts } from "@/lib/catalog";
import { getBrand } from "@/lib/brand/server";
import { brandHref } from "@/lib/brand/routing";
import { CATEGORIES } from "@/lib/categories";
import { CATEGORY_TILES, HERO_SLIDES, SPOTLIGHTS } from "@/lib/home";
import { priceLabel } from "@/lib/merchandising";
import { SITE, jsonLd } from "@/lib/site";

export default async function HomePage() {
  const brand = await getBrand();
  const href = (path: string) => brandHref(path, brand.slug);
  const products = await getProducts();
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

      <section aria-labelledby="categories" className="px-5 md:px-16 pt-16 md:pt-20">
        <h2 id="categories" className="font-display text-2xl md:text-3xl font-bold mb-8">
          Explorer par catégorie
        </h2>
        <CategoryTiles tiles={tiles} />
      </section>

      <section className="px-5 md:px-16 pt-16 md:pt-24">
        <ProductTabs products={products} />
      </section>

      {spotlights.length > 0 && (
        <section aria-label="À découvrir" className="px-5 md:px-16 pt-16 md:pt-24">
          <SpotlightTiles items={spotlights} />
        </section>
      )}

      <section className="px-5 md:px-16 py-16 md:py-24">
        <ServiceCards deliveryPromise={brand.deliveryPromise} />
      </section>
    </div>
  );
}
