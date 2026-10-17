import Link from "@/components/brand/BrandLink";
import { Banknote, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import Hero from "@/components/Hero";
import ProductRail from "@/components/ProductRail";
import Reveal from "@/components/motion/Reveal";
import { getProducts } from "@/lib/catalog";
import { getBrand } from "@/lib/brand/server";
import { brandHref } from "@/lib/brand/routing";
import { SITE, jsonLd } from "@/lib/site";

import { CATEGORIES } from "@/lib/categories";

export default async function HomePage() {
  const brand = await getBrand();
  const href = (path: string) => brandHref(path, brand.slug);
  const featured = (await getProducts()).slice(0, 12);

  const perks = [
    { icon: Banknote, title: "Paiement à la livraison", text: "Vous payez en espèces quand le colis arrive." },
    { icon: Truck, title: "Livraison partout", text: brand.deliveryPromise },
    { icon: ShieldCheck, title: "Produits garantis", text: "Matériel neuf, testé avant l'envoi." },
    { icon: MessageCircle, title: "Commande sur WhatsApp", text: "Votre récapitulatif part en un clic." },
  ];

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
      <Hero brand={brand} />

      <section className="px-5 md:px-16 py-12 md:py-16">
        <h2 className="font-display text-xl md:text-2xl font-bold mb-6">Catégories</h2>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={href(`/products?cat=${encodeURIComponent(c)}`)}
              className="rounded-full border border-outline-variant px-5 py-2.5 text-sm font-medium hover:border-primary hover:bg-surface-container transition-colors"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 md:px-16 pb-16 md:pb-24">
        <ProductRail
          products={featured}
          label="Nouveautés"
          header={
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-display text-xl md:text-2xl font-bold">Nouveautés</h2>
              <Link href={href("/products")} className="text-xs font-semibold tracking-label uppercase whitespace-nowrap hover:underline">
                Tout voir →
              </Link>
            </div>
          }
        />
      </section>

      <section className="px-5 md:px-16 py-16 bg-surface-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {perks.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 100} className="flex gap-4">
              <Icon size={28} className="text-accent shrink-0" aria-hidden="true" />
              <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-secondary">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
