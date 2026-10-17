import type { Metadata } from "next";
import { getWilayas } from "@/lib/delivery";
import CheckoutForm from "./CheckoutForm";

export const metadata: Metadata = { title: "Commande", robots: { index: false, follow: false } };

// The wilaya list rarely changes.
export const revalidate = 3600;

export default async function CheckoutPage() {
  const wilayas = await getWilayas();

  return (
    <div className="px-5 md:px-16 py-16">
      <div className="mb-12">
        <p className="text-xs tracking-label uppercase text-secondary mb-2">Paiement à la livraison</p>
        <h1 className="font-display text-3xl md:text-5xl">Commande</h1>
      </div>
      <CheckoutForm wilayas={wilayas} />
    </div>
  );
}
