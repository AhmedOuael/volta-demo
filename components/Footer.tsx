"use client";

import Link from "@/components/brand/BrandLink";
import { useBrand, useBrandHref } from "@/components/brand/BrandProvider";

export default function Footer() {
  const brand = useBrand();
  const href = useBrandHref();

  return (
    <footer className="w-full border-t border-outline-variant bg-surface">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-5 md:px-16 py-16">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-on-surface">{brand.name}</h2>
          <p className="text-sm text-secondary max-w-xs">{brand.tagline}</p>
          {brand.instagram && (
            <a href={`https://www.instagram.com/${brand.instagram}/`} target="_blank" rel="noopener" className="text-sm text-secondary hover:underline">
              @{brand.instagram}
            </a>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-label uppercase mb-6 text-on-surface">Service client</h3>
          <ul className="space-y-4 text-sm text-secondary">
            <li><Link href={href("/products")} className="hover:underline">Boutique</Link></li>
            <li><Link href={href("/contact")} className="hover:underline">Nous contacter</Link></li>
            <li><Link href={href("/about")} className="hover:underline">À propos</Link></li>
            <li><Link href={href("/credits")} className="hover:underline">Crédits photos</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-label uppercase mb-6 text-on-surface">Livraison et paiement</h3>
          <p className="text-sm text-secondary">{brand.deliveryPromise}</p>
          <p className="mt-4 text-sm text-secondary">Vous payez en espèces à la réception de votre commande.</p>
        </div>
      </div>

      <div className="px-5 md:px-16 py-6 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-2">
        <p className="text-[11px] text-secondary">© {new Date().getFullYear()} {brand.name}</p>
        <p className="text-[11px] text-secondary">
          Site de démonstration conçu par <a href="https://ahmedouael.com" target="_blank" rel="noopener" className="underline">Willou</a>
        </p>
      </div>
    </footer>
  );
}
