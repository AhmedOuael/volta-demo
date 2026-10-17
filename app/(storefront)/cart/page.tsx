import type { Metadata } from "next";
import CartView from "./CartView";

export const metadata: Metadata = { title: "Votre panier", robots: { index: false, follow: false } };

export default function CartPage() {
  return (
    <div className="px-5 md:px-16 py-16">
      <div className="mb-12">
        <p className="text-xs tracking-label uppercase text-secondary mb-2">Boutique</p>
        <h1 className="font-display text-3xl md:text-5xl">Votre panier</h1>
      </div>
      <CartView />
    </div>
  );
}
