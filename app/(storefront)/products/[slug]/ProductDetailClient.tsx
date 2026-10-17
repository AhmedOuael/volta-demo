"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBrandHref } from "@/components/brand/BrandProvider";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog";
import { useCart } from "@/components/cart/useCart";
import { ChevronDown } from "lucide-react";
import { formatDZD } from "@/lib/format";
import { stockBadge, type StockBadge } from "@/lib/stock";
import SpecsTable from "@/components/product/SpecsTable";

const DOT: Record<StockBadge["tone"], string> = { ok: "bg-emerald-500", low: "bg-amber-500", out: "bg-red-500" };

function Badge({ available }: { available: number }) {
  const b = stockBadge(available);
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={`h-2 w-2 rounded-full ${DOT[b.tone]}`} aria-hidden="true" />
      {b.label}
    </span>
  );
}

export default function ProductDetailClient({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const router = useRouter();
  const brandHref = useBrandHref();
  // Start on the first version in stock, so a one-version product is ready to order.
  const [selectedId, setSelectedId] = useState<string | null>(product.variants.find((v) => v.available > 0)?.id ?? null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selected = product.variants.find((v) => v.id === selectedId) ?? null;
  const soldOut = product.variants.every((v) => v.available === 0);
  const multiColor = new Set(product.variants.map((v) => v.color)).size > 1;
  const multiPrice = new Set(product.variants.map((v) => v.price)).size > 1;
  const variantLabel = (v: CatalogVariant) =>
    multiColor ? [v.size, v.color].filter(Boolean).join(" · ") : v.size ?? v.color ?? "Version unique";

  const handleAddToBag = () => {
    if (!selected) return;
    addItem({
      variantId: selected.id,
      slug: product.slug,
      name: product.name,
      size: selected.size,
      color: selected.color,
      price: selected.price,
      image: product.image,
      available: selected.available,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="px-5 md:px-16 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Gallery */}
        <div className="aspect-square bg-surface-container overflow-hidden relative rounded-lg">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-secondary text-sm tracking-label uppercase">
              {product.name}
            </div>
          )}
        </div>

        {/* Info */}
        {/* The buy box stays in view while the photo column scrolls (desktop). */}
        <div className="md:sticky md:top-32 md:pt-2">
          <p className="text-xs tracking-label uppercase text-secondary mb-3">
            {[product.categories.join(", "), selected && `Réf. ${selected.sku}`].filter(Boolean).join(" · ")}
          </p>
          {product.maker && <p className="text-sm font-semibold tracking-label uppercase text-secondary mb-1">{product.maker}</p>}
          <h1 className="font-display text-3xl md:text-4xl mb-4">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8">
            <p className="text-xl font-semibold">{formatDZD(selected?.price ?? product.price)}</p>
            <Badge available={selected ? selected.available : 0} />
          </div>

          <p className="text-on-surface-variant mb-8 max-w-md">{product.description}</p>

          {/* Version picker */}
          <p id="version-label" className="mb-3 text-xs font-medium tracking-label uppercase">
            Version
          </p>
          <div role="radiogroup" aria-labelledby="version-label" className="flex flex-wrap gap-3 mb-8">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={selectedId === v.id}
                disabled={v.available === 0}
                title={v.available === 0 ? "Rupture" : undefined}
                onClick={() => setSelectedId(v.id)}
                className={`min-h-12 px-4 py-2 flex flex-col items-start justify-center rounded-sm border text-sm text-left transition-colors
                  ${v.available === 0 ? "border-outline-variant text-outline-variant line-through cursor-not-allowed" : "border-outline-variant hover:border-primary"}
                  ${selectedId === v.id ? "bg-primary text-on-primary border-primary" : ""}`}
              >
                <span>{variantLabel(v)}</span>
                {multiPrice && <span className="text-xs opacity-80">{formatDZD(v.price)}</span>}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 mb-10">
            {/* Buy now orders just this version; the bag is left as it is. */}
            <button
              onClick={() => selected && router.push(brandHref(`/checkout/buy/${selected.id}`))}
              disabled={!selected}
              className="w-full bg-primary text-on-primary py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {soldOut ? "Rupture de stock" : selected ? "Acheter maintenant" : "Choisissez une version"}
            </button>
            <button
              onClick={handleAddToBag}
              disabled={!selected}
              className="w-full border border-primary py-4 rounded-full text-sm font-medium tracking-label uppercase hover:bg-surface-container transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              {added ? "Ajouté au panier ✓" : "Ajouter au panier"}
            </button>
          </div>

          {product.specs.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-medium tracking-label uppercase mb-2">Caractéristiques</h2>
              <SpecsTable specs={product.specs} />
            </section>
          )}

          {/* Accordions */}
          <div className="border-t border-outline-variant">
            {[
              ...(product.details.length ? [{ id: "details", title: "Détails", body: product.details.join(" · ") }] : []),
              { id: "shipping", title: "Livraison", body: "Livraison partout en Algérie, à domicile ou au bureau de livraison. Paiement à la livraison." },
              { id: "returns", title: "Retours et garantie", body: "Conditions de retour et de garantie précisées lors de l'appel de confirmation." },
            ].map((section) => (
              <div key={section.id} className="border-b border-outline-variant">
                <button
                  onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                  aria-expanded={openSection === section.id}
                  className="w-full flex items-center justify-between py-5 text-sm font-medium"
                >
                  {section.title}
                  <ChevronDown size={16} className={`transition-transform ${openSection === section.id ? "rotate-180" : ""}`} />
                </button>
                {openSection === section.id && <p className="text-sm text-secondary pb-5 pr-8">{section.body}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
