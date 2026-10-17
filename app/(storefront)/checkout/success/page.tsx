import type { Metadata } from "next";
import Link from "@/components/brand/BrandLink";

export const metadata: Metadata = { title: "Commande reçue", robots: { index: false, follow: false } };

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const orderNumber = order && /^\d+$/.test(order) ? order : null;

  return (
    <div className="px-5 md:px-16 py-24 md:py-32 text-center max-w-xl mx-auto">
      <p className="text-xs tracking-label uppercase text-secondary mb-4">Merci</p>
      <h1 className="font-display text-3xl md:text-5xl mb-6">Commande reçue</h1>
      {orderNumber && <p className="text-sm mb-6">Commande n° <span className="font-semibold">#{orderNumber}</span></p>}
      <p className="text-on-surface-variant mb-12">
        Nous allons vous appeler très bientôt pour confirmer la commande et l&apos;adresse de livraison. Gardez votre téléphone à portée de main.
        Vous paierez en espèces à la réception.
      </p>
      <Link
        href="/products"
        className="inline-block bg-primary text-on-primary px-10 py-4 rounded-full text-sm font-medium tracking-label uppercase hover:opacity-90 transition-opacity"
      >
        Continuer mes achats
      </Link>
    </div>
  );
}
