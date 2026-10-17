"use client";

import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/motion/Reveal";
import { useBrandHref } from "@/components/brand/BrandProvider";
import type { CatalogProduct } from "@/lib/catalog";

// The first cards rise in with CSS from the first frame (they're on screen at
// load); the rest fade in as they're scrolled to.
const ENTRANCE_COUNT = 6;
const STAGGER_MS = 90;

export default function ProductGrid({ products, total }: { products: CatalogProduct[]; total: number }) {
  const href = useBrandHref();

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-secondary mb-4">Aucun produit ne correspond</p>
        <a href={href("/products")} className="text-sm underline underline-offset-4 hover:text-primary">
          Réinitialiser les filtres
        </a>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-secondary mb-8" aria-live="polite">
        {products.length} produit{products.length === 1 ? "" : "s"} sur {total}
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {products.map((p, i) =>
          i < ENTRANCE_COUNT ? (
            <div key={p.id} className="motion-safe:animate-rise" style={{ animationDelay: `${150 + i * STAGGER_MS}ms` }}>
              <ProductCard product={p} />
            </div>
          ) : (
            <Reveal key={p.id} delay={(i % 3) * 120}>
              <ProductCard product={p} />
            </Reveal>
          )
        )}
      </div>
    </>
  );
}
