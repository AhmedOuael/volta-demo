"use client";

import Image from "next/image";
import Link from "@/components/brand/BrandLink";
import { useState } from "react";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/useCart";
import { useBrand, useBrandHref } from "@/components/brand/BrandProvider";
import DemoBanner from "@/components/brand/DemoBanner";
import { CATEGORIES } from "@/lib/categories";

const links = [
  { href: "/products", label: "Tous les produits" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

function CartLink({ count, onClick }: { count: number; onClick?: () => void }) {
  const href = useBrandHref();
  return (
    <Link href={href("/cart")} aria-label="Panier" onClick={onClick} className="relative text-on-surface hover:scale-95 active:scale-90 transition-transform">
      <ShoppingBag size={20} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count: cartCount } = useCart();
  const brand = useBrand();
  const href = useBrandHref();

  const categoryLinks = CATEGORIES.map((c) => ({ href: `/products?cat=${encodeURIComponent(c)}`, label: c }));

  return (
    <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-outline-variant/60">
      <DemoBanner brand={brand} />
      <nav className="flex items-center justify-between gap-6 px-5 md:px-16 py-3">
        <button className="lg:hidden text-on-surface" aria-label="Ouvrir le menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href={href("/")} className="flex-none flex items-center" aria-label={`${brand.name} — accueil`}>
          <Image src={brand.logo} alt={brand.logoAlt} width={180} height={40} priority className="h-9 md:h-10 w-auto object-contain" />
        </Link>

        {/* Desktop: the categories in the middle, like a manufacturer's site */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-8">
          {categoryLinks.map((l) => (
            <Link key={l.href} href={href(l.href)} className="text-sm font-medium text-on-surface hover:text-accent transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end gap-5">
          <Link href={href("/products")} aria-label="Rechercher un produit" className="hidden lg:block text-on-surface hover:scale-95 active:scale-90 transition-transform">
            <Search size={20} />
          </Link>
          <CartLink count={cartCount} />
          <Link href={href("/products")} className="hidden lg:inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity">
            Boutique
          </Link>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden flex flex-col gap-5 px-5 py-8 border-t border-outline-variant/60 bg-background max-h-[80vh] overflow-y-auto">
          {[...categoryLinks, ...links].map((l) => (
            <Link key={l.href} href={href(l.href)} onClick={() => setOpen(false)} className="text-base font-medium text-on-surface">
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-6 pt-4 border-t border-outline-variant/60">
            <Link href={href("/products")} aria-label="Rechercher un produit" onClick={() => setOpen(false)}>
              <Search size={20} />
            </Link>
            <CartLink count={cartCount} onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
