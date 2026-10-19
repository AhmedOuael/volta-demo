"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useLenis } from "lenis/react";
import Link from "@/components/brand/BrandLink";
import { useCart } from "@/components/cart/useCart";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog";
import { formatDZD } from "@/lib/format";
import { stockBadge, type StockBadge } from "@/lib/stock";

const DOT: Record<StockBadge["tone"], string> = { ok: "bg-emerald-500", low: "bg-amber-500", out: "bg-red-500" };
const CLOSE_MS = 300; // matches .quick-view's transition in globals.css

/** The product in a pop-up: photo, versions, stock, add to cart, without leaving the page. */
export default function QuickView({ product, onClose }: { product: CatalogProduct; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();
  const { addItem } = useCart();
  const [selectedId, setSelectedId] = useState<string | null>(product.variants.find((v) => v.available > 0)?.id ?? null);
  const [added, setAdded] = useState(false);
  const selected = product.variants.find((v) => v.id === selectedId) ?? null;
  const multiPrice = new Set(product.variants.map((v) => v.price)).size > 1;
  const label = (v: CatalogVariant) => [v.size, v.color].filter(Boolean).join(" · ") || "Version unique";
  const badge = stockBadge(selected?.available ?? 0);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    el.showModal();
    lenis?.stop(); // the page behind stays put
    let timer = 0;
    const onCloseEvent = () => {
      timer = window.setTimeout(onClose, CLOSE_MS); // let the fade-out play
    };
    el.addEventListener("close", onCloseEvent);
    return () => {
      el.removeEventListener("close", onCloseEvent);
      clearTimeout(timer);
      lenis?.start();
    };
  }, [lenis, onClose]);

  const add = () => {
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
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`qv-${product.id}`}
      data-lenis-prevent
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      className="quick-view m-auto w-[min(56rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg bg-background text-on-surface p-0 shadow-2xl"
    >
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-square bg-surface-container">
          {product.image && <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 28rem" className="object-cover" />}
        </div>
        <div className="p-6 md:p-8 flex flex-col">
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Fermer" className="self-end -mt-2 -mr-2 p-2 rounded-full hover:bg-surface-container transition-colors">
            <X size={20} />
          </button>
          <p className="text-xs font-semibold tracking-label uppercase text-secondary">{product.maker}</p>
          <h2 id={`qv-${product.id}`} className="mt-1 font-display text-2xl md:text-3xl leading-tight">
            {product.name}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="text-lg font-semibold">{formatDZD(selected?.price ?? product.price)}</p>
            <span className="inline-flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${DOT[badge.tone]}`} aria-hidden="true" />
              {badge.label}
            </span>
          </div>
          {product.description && <p className="mt-4 text-sm text-on-surface-variant line-clamp-3">{product.description}</p>}

          {product.variants.length > 1 && (
            <>
              <p id={`qv-versions-${product.id}`} className="mt-6 mb-2 text-xs font-medium tracking-label uppercase">
                Version
              </p>
              <div role="radiogroup" aria-labelledby={`qv-versions-${product.id}`} className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedId === v.id}
                    disabled={v.available === 0}
                    onClick={() => {
                      setSelectedId(v.id);
                      setAdded(false);
                    }}
                    className={`px-3 py-2 rounded-sm border text-sm text-left transition-colors ${
                      v.available === 0
                        ? "border-outline-variant text-outline-variant line-through cursor-not-allowed"
                        : selectedId === v.id
                          ? "bg-primary text-on-primary border-primary"
                          : "border-outline-variant hover:border-primary"
                    }`}
                  >
                    {label(v)}
                    {multiPrice && <span className="block text-xs opacity-80">{formatDZD(v.price)}</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="mt-auto pt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={add}
              disabled={!selected}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {!selected ? "Rupture de stock" : added ? "Ajouté au panier ✓" : "Ajouter au panier"}
            </button>
            <p aria-live="polite" className="sr-only">
              {added ? `${product.name} ajouté au panier` : ""}
            </p>
            <Link href={added ? "/cart" : `/products/${product.slug}`} className="w-full rounded-full border border-primary py-3.5 text-center text-sm font-semibold hover:bg-surface-container transition-colors">
              {added ? "Voir le panier" : "Voir la fiche complète"}
            </Link>
          </div>
        </div>
      </div>
    </dialog>
  );
}
