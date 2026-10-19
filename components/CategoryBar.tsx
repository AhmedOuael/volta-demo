"use client";

import Link from "@/components/brand/BrandLink";
import { useBrandHref } from "@/components/brand/BrandProvider";
import { CATEGORIES } from "@/lib/categories";

/**
 * The coloured category bar under the header. It scrolls away with the page
 * (the header stays), and slides sideways on phones.
 */
export default function CategoryBar() {
  const href = useBrandHref();
  const item = "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium hover:bg-on-primary/15 transition-colors";
  return (
    <nav aria-label="Catégories" className="bg-primary text-on-primary">
      <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto px-3 md:px-14 py-1.5">
        <Link href={href("/products")} className={`${item} font-semibold`}>
          Tous les produits
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c} href={href(`/products?cat=${encodeURIComponent(c)}`)} className={item}>
            {c}
          </Link>
        ))}
        <a href={`${href("/")}#devis`} className={`${item} ml-auto border border-on-primary/40`}>
          Devis entreprise
        </a>
      </div>
    </nav>
  );
}
