"use client";

import Image from "next/image";
import Link from "@/components/brand/BrandLink";
import { useState } from "react";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/useCart";
import { useBrand, useBrandHref } from "@/components/brand/BrandProvider";
import DemoBanner from "@/components/brand/DemoBanner";

const links = [
  { href: "/products", label: "Boutique" },
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

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/40">
      <DemoBanner brand={brand} />
      <nav className="flex items-center justify-between px-5 md:px-16 py-3">
        <div className="hidden md:flex items-center gap-8 flex-1">
          {links.map((l) => (
            <Link key={l.href} href={href(l.href)} className="text-xs font-medium tracking-label uppercase text-secondary hover:text-on-surface transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <button className="md:hidden text-on-surface" aria-label="Ouvrir le menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href={href("/")} className="flex-none flex items-center" aria-label={`${brand.name} — accueil`}>
          <Image src={brand.logo} alt={brand.logoAlt} width={180} height={40} priority className="h-9 md:h-11 w-auto object-contain" />
        </Link>

        <div className="md:hidden">
          <CartLink count={cartCount} />
        </div>

        <div className="hidden md:flex items-center justify-end gap-6 flex-1">
          <Link href={href("/products")} aria-label="Rechercher un produit" className="text-on-surface hover:scale-95 active:scale-90 transition-transform">
            <Search size={20} />
          </Link>
          <CartLink count={cartCount} />
        </div>
      </nav>

      {open && (
        <div className="md:hidden flex flex-col gap-6 px-5 py-8 border-t border-outline-variant/40 bg-surface">
          {links.map((l) => (
            <Link key={l.href} href={href(l.href)} onClick={() => setOpen(false)} className="text-sm font-medium tracking-label uppercase text-on-surface">
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-6 pt-4 border-t border-outline-variant/40">
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
