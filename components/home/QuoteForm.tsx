"use client";

import { useState } from "react";
import { Building2, MessageCircle } from "lucide-react";
import { useBrand } from "@/components/brand/BrandProvider";
import RevealWords from "@/components/motion/RevealWords";
import { buildQuoteLink, type QuoteRequest } from "@/lib/quote";

/**
 * "Devis pour les entreprises": agencies, schools and companies buy in quantity
 * and need a quote. The request opens in the store's WhatsApp, already written.
 */
export default function QuoteForm({ phone }: { phone: string }) {
  const brand = useBrand();
  const [form, setForm] = useState<QuoteRequest>({ company: "", items: "", quantity: "" });
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const set = (key: keyof QuoteRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (error?.field === key) setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = buildQuoteLink(form, phone, brand);
    if (!result.ok) return setError({ field: result.field, message: result.error });
    setError(null);
    window.open(result.url, "_blank", "noopener");
  };

  const field =
    "w-full rounded-sm border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary transition-colors aria-invalid:border-error";

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 rounded-lg bg-surface-container-low p-6 md:p-12">
      <div>
        <Building2 size={28} className="text-accent" aria-hidden="true" />
        <RevealWords id="devis-title" text="Devis pour les entreprises" className="mt-4 font-display text-3xl md:text-4xl font-bold" />
        <p className="mt-4 text-on-surface-variant max-w-md">
          Agence, école, studio ou administration : dites-nous ce qu&apos;il vous faut, nous vous répondons sur WhatsApp avec un devis et une facture
          proforma.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-on-surface-variant">
          <li>• Prix pour les quantités</li>
          <li>• Facture au nom de votre entreprise</li>
          <li>• Livraison dans toute l&apos;Algérie</li>
        </ul>
      </div>

      <form onSubmit={submit} noValidate aria-labelledby="devis-title" className="flex flex-col gap-4">
        <label className="text-sm font-medium">
          Entreprise
          <input value={form.company} onChange={set("company")} aria-invalid={error?.field === "company"} autoComplete="organization" className={`${field} mt-1.5`} />
        </label>
        <label className="text-sm font-medium">
          Produits souhaités
          <textarea value={form.items} onChange={set("items")} aria-invalid={error?.field === "items"} rows={3} placeholder="Ex. 2 kits d'éclairage Lumex Panel x3 et 2 micros sans fil" className={`${field} mt-1.5 resize-none`} />
        </label>
        <label className="text-sm font-medium">
          Quantité <span className="font-normal text-secondary">(facultatif)</span>
          <input value={form.quantity} onChange={set("quantity")} inputMode="numeric" className={`${field} mt-1.5`} />
        </label>
        <p role="alert" className="min-h-5 text-sm text-error">
          {error?.message}
        </p>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity">
          <MessageCircle size={17} aria-hidden="true" />
          Envoyer la demande sur WhatsApp
        </button>
      </form>
    </div>
  );
}
