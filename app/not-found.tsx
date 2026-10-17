import type { Metadata } from "next";
import Link from "@/components/brand/BrandLink";
import { getBrand } from "@/lib/brand/server";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

// Any URL that matches no route at all.
export default async function NotFound() {
  const brand = await getBrand();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <p className="font-display text-3xl font-extrabold mb-16">{brand.name}</p>
      <p className="text-sm text-secondary mb-4">Erreur 404</p>
      <h1 className="font-display text-3xl md:text-5xl mb-6">Cette page n&apos;existe pas</h1>
      <p className="text-on-surface-variant mb-12 max-w-md">Vérifiez l&apos;adresse ou continuez vers la boutique.</p>
      <Link href="/products" className="inline-block bg-primary text-on-primary px-10 py-4 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity">
        Voir la boutique
      </Link>
    </div>
  );
}
