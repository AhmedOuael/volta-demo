"use client";

import Image from "next/image";
import Link from "@/components/brand/BrandLink";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/useCart";
import { useBrand, useBrandHref } from "@/components/brand/BrandProvider";
import DemoBanner from "@/components/brand/DemoBanner";
import HeaderSearch, { type SearchItem } from "@/components/HeaderSearch";
import { CATEGORIES } from "@/lib/categories";

const links = [
  { href: "/products", label: "Tous les produits" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

function CartLink({ count, hydrated, onClick }: { count: number; hydrated: boolean; onClick?: () => void }) {
  const href = useBrandHref();
  // The count pops when something is added (not when the saved cart loads).
  const [pop, setPop] = useState(0);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (last.current !== null && count > last.current) setPop((n) => n + 1);
    last.current = count;
  }, [count, hydrated]);

  return (
    <Link href={href("/cart")} aria-label="Panier" onClick={onClick} className="relative text-on-surface hover:scale-95 active:scale-90 transition-transform">
      <ShoppingBag size={21} />
      {count > 0 && (
        <span key={pop} className={`absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[9px] w-4 h-4 flex items-center justify-center rounded-full ${pop ? "animate-pop" : ""}`}>
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Header({ searchItems }: { searchItems: SearchItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count: cartCount, hydrated } = useCart();
  const brand = useBrand();
  const href = useBrandHref();

  const categoryLinks = CATEGORIES.map((c) => ({ href: `/products?cat=${encodeURIComponent(c)}`, label: c }));

  return (
    <header className="site-header sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-outline-variant/60">
      <DemoBanner brand={brand} />
      <nav className="flex items-center justify-between gap-4 lg:gap-10 px-5 md:px-16 py-3">
        <button
          className="lg:hidden text-on-surface"
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
          onClick={() => {
            setMenuOpen((v) => !v);
            setSearchOpen(false);
          }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href={href("/")} className="flex-none flex items-center" aria-label={`${brand.name} — accueil`}>
          <Image src={brand.logo} alt={brand.logoAlt} width={180} height={40} priority className="site-logo h-9 md:h-10 w-auto object-contain" />
        </Link>

        {/* Desktop: a real search field in the middle, like the big camera shops */}
        <div className="hidden lg:block flex-1 max-w-xl">
          <HeaderSearch items={searchItems} />
        </div>

        <div className="flex items-center justify-end gap-5">
          <button
            type="button"
            className="lg:hidden text-on-surface"
            aria-label="Rechercher"
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
          >
            {searchOpen ? <X size={21} /> : <Search size={21} />}
          </button>
          <CartLink count={cartCount} hydrated={hydrated} />
          <Link href={href("/products")} className="hidden lg:inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity">
            Boutique
          </Link>
        </div>
      </nav>

      {searchOpen && (
        <div className="drop-in lg:hidden px-5 pb-3">
          <HeaderSearch items={searchItems} autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}

      {menuOpen && (
        <div className="drop-in lg:hidden flex flex-col gap-5 px-5 py-8 border-t border-outline-variant/60 bg-background max-h-[80vh] overflow-y-auto">
          {[...categoryLinks, ...links].map((l) => (
            <Link key={l.href} href={href(l.href)} onClick={() => setMenuOpen(false)} className="text-base font-medium text-on-surface">
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-6 pt-4 border-t border-outline-variant/60">
            <Link href={href("/products")} aria-label="Rechercher un produit" onClick={() => setMenuOpen(false)}>
              <Search size={20} />
            </Link>
            <CartLink count={cartCount} hydrated={hydrated} onClick={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
