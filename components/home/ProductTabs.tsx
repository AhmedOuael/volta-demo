"use client";

import { useState } from "react";
import Link from "@/components/brand/BrandLink";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/motion/Reveal";
import RevealWords from "@/components/motion/RevealWords";
import { useBrandHref } from "@/components/brand/BrandProvider";
import type { CatalogProduct } from "@/lib/catalog";
import { HOME_TABS, productsForTab, type HomeTab } from "@/lib/merchandising";

const COUNT = 8;

/** "Nos meilleurs choix": the same products re-sorted per tab (newest, cheapest, premium). */
export default function ProductTabs({ products }: { products: CatalogProduct[] }) {
  const href = useBrandHref();
  const [tab, setTab] = useState<HomeTab>("new");
  // After a tab switch the new cards rise in (the first set reveals on scroll).
  const [revealed, setRevealed] = useState(false);
  const shown = productsForTab(products, tab, COUNT);
  // Only the latest few get a "Nouveau" badge, or every card in the tab would.
  const newIds = new Set(products.slice(0, 4).map((p) => p.id));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <RevealWords text="Nos meilleurs choix" className="font-display text-2xl md:text-3xl font-bold" />
        <div role="tablist" aria-label="Sélection" className="flex w-full sm:w-auto gap-1 rounded-full bg-surface-container p-1">
          {HOME_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              aria-controls="home-picks"
              onClick={() => {
                setTab(t.key);
                setRevealed(true);
              }}
              className={`flex-1 sm:flex-none whitespace-nowrap rounded-full px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-primary text-on-primary" : "text-secondary hover:text-on-surface"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div id="home-picks" role="tabpanel" className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
        {shown.map((p, i) => (
          <Reveal key={`${tab}-${p.id}`} delay={(i % 4) * 70} className={revealed ? "motion-safe:animate-rise" : undefined}>
            <ProductCard product={p} isNew={tab === "new" && newIds.has(p.id)} />
          </Reveal>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href={href("/products")} className="inline-block rounded-full border border-primary px-7 py-3 text-sm font-semibold hover:bg-surface-container transition-colors">
          Voir tous les produits
        </Link>
      </div>
    </div>
  );
}
