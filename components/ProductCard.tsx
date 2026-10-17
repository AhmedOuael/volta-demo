import Link from "@/components/brand/BrandLink";
import Image from "next/image";
import type { CatalogProduct } from "@/lib/catalog";
import { cardBadge, priceLabel, type CardBadge } from "@/lib/merchandising";

const BADGE: Record<CardBadge["tone"], string> = {
  out: "bg-zinc-800 text-white",
  low: "bg-amber-100 text-amber-900",
  new: "bg-primary text-on-primary",
};

/** Photo on a rounded panel, one corner badge, maker, name and price. */
export default function ProductCard({ product, isNew = false }: { product: CatalogProduct; isNew?: boolean }) {
  const badge = cardBadge(product, isNew);
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-md bg-surface-container mb-4">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 340px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary text-xs tracking-label uppercase">{product.name}</div>
        )}
        {badge && <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${BADGE[badge.tone]}`}>{badge.label}</span>}
      </div>
      <p className="text-[11px] font-semibold tracking-label uppercase text-secondary">{product.maker}</p>
      <h3 className="mt-1 font-semibold leading-snug line-clamp-2 group-hover:underline underline-offset-4">{product.name}</h3>
      <p className="mt-1.5 text-sm font-bold">{priceLabel(product)}</p>
    </Link>
  );
}
