import type { Metadata } from "next";
import Link from "@/components/brand/BrandLink";
import { getBrand } from "@/lib/brand/server";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return { title: "À propos", description: `${brand.name} : ${brand.tagline}.` };
}

export default async function AboutPage() {
  const brand = await getBrand();
  return (
    <div className="px-5 md:px-16 py-16 md:py-24 max-w-3xl">
      <h1 className="font-display text-3xl md:text-5xl font-extrabold mb-6">{brand.name}</h1>
      <p className="text-lg text-on-surface-variant mb-10">{brand.tagline}.</p>
      <ul className="space-y-4 text-on-surface-variant mb-12">
        <li>• {brand.deliveryPromise}.</li>
        <li>• Un catalogue clair : prix, caractéristiques et stock affichés pour chaque produit.</li>
        <li>• Commande en ligne en deux minutes, confirmation par téléphone, paiement à la réception.</li>
      </ul>
      <Link href="/products" className="inline-block rounded-md bg-primary px-7 py-3.5 font-semibold text-on-primary hover:opacity-90">
        Voir la boutique
      </Link>
    </div>
  );
}
