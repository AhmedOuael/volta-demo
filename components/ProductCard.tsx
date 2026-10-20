"use client";

import { useCallback, useState, ViewTransition } from "react";
import Link from "@/components/brand/BrandLink";
import Image from "next/image";
import { Check, Eye, ShoppingBag } from "lucide-react";
import QuickView from "@/components/QuickView";
import { useCart } from "@/components/cart/useCart";
import { cardAction, cardBadge, priceLabel, type CardBadge, type CardProduct } from "@/lib/merchandising";

const BADGE: Record<CardBadge["tone"], string> = {
  out: "bg-zinc-800 text-white",
  low: "bg-amber-100 text-amber-900",
  new: "bg-primary text-on-primary",
};

/** The photo's shared name for the card → product page morph (see ProductDetailClient). */
export const productPhotoTransition = (slug: string) => `product-photo-${slug}`;

/**
 * Photo on a rounded panel, one corner badge, maker, name and price.
 * Quick actions over the photo: add to cart (or choose a version) and quick view.
 * They slide up on hover with a mouse and are always shown as icons on touch screens.
 */
export default function ProductCard({ product, isNew = false }: { product: CardProduct; isNew?: boolean }) {
  const badge = cardBadge(product, isNew);
  const action = cardAction(product);
  const { addItem } = useCart();
  const [quickView, setQuickView] = useState(false);
  const [added, setAdded] = useState(false);
  // The same product can be on the page several times (tabs, rails), and a shared
  // transition name must be unique, so only the card that was clicked gets it.
  const [morph, setMorph] = useState(false);
  const closeQuickView = useCallback(() => setQuickView(false), []);
  const href = `/products/${product.slug}`;

  const onCart = () => {
    if (action.kind === "choose") return setQuickView(true);
    if (action.kind !== "add") return;
    const v = action.variant;
    addItem({ variantId: v.id, slug: product.slug, name: product.name, size: v.size, color: v.color, price: v.price, image: product.image, available: v.available });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const iconButton =
    "w-10 h-10 rounded-full bg-background/95 text-on-surface shadow-md flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors";

  return (
    <div className="group">
      <div data-spotlight className="relative aspect-square overflow-hidden rounded-md bg-surface-container mb-4">
        <Link href={href} tabIndex={-1} aria-hidden="true" onClick={() => setMorph(true)} className="absolute inset-0">
          <ViewTransition name={morph ? productPhotoTransition(product.slug) : undefined} share="morph" default="none">
            {product.image ? (
              <Image
                src={product.image}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 340px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-secondary text-xs tracking-label uppercase">{product.name}</div>
            )}
          </ViewTransition>
        </Link>
        {badge && <span className={`absolute z-2 top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${BADGE[badge.tone]}`}>{badge.label}</span>}

        <div className="absolute z-2 bottom-3 right-3 left-3 flex justify-end gap-2 transition-[opacity,translate] duration-300 pointer-fine:translate-y-2 pointer-fine:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
          {action.kind !== "out" && (
            <button
              type="button"
              onClick={onCart}
              aria-label={action.kind === "choose" ? `Choisir une version de ${product.name}` : `Ajouter ${product.name} au panier`}
              className={`${iconButton} pointer-fine:w-auto pointer-fine:flex-1 pointer-fine:gap-2 pointer-fine:px-4 text-sm font-semibold`}
            >
              {added ? <Check size={17} /> : <ShoppingBag size={17} />}
              <span className="hidden pointer-fine:inline">{added ? "Ajouté" : action.kind === "choose" ? "Choisir" : "Ajouter au panier"}</span>
            </button>
          )}
          <button type="button" onClick={() => setQuickView(true)} aria-label={`Aperçu rapide de ${product.name}`} className={iconButton}>
            <Eye size={17} />
          </button>
        </div>
        <p aria-live="polite" className="sr-only">
          {added ? `${product.name} ajouté au panier` : ""}
        </p>
      </div>
      <Link href={href} onClick={() => setMorph(true)} className="block">
        <p className="text-[11px] font-semibold tracking-label uppercase text-secondary">{product.maker}</p>
        <h3 className="mt-1 font-semibold leading-snug line-clamp-2 group-hover:underline underline-offset-4">{product.name}</h3>
        <p className="mt-1.5 text-sm font-bold">{priceLabel(product)}</p>
      </Link>
      {quickView && <QuickView product={product} onClose={closeQuickView} />}
    </div>
  );
}
