import type { Brand } from "@/brands/types";

/** "Devis pour les entreprises": what the form asks. */
export type QuoteRequest = { company: string; items: string; quantity: string };

export type QuoteResult =
  | { ok: true; url: string }
  | { ok: false; field?: "company" | "items"; error: string };

const MAX = { company: 80, items: 400, quantity: 20 };

/**
 * A wa.me link to the store, pre-filled with a company's quote request.
 * Private previews are marked as a demo, like orders (lib/whatsapp.ts).
 */
export function buildQuoteLink(input: QuoteRequest, phone: string | undefined, brand: Brand): QuoteResult {
  const company = input.company.trim().slice(0, MAX.company);
  const items = input.items.trim().slice(0, MAX.items);
  const quantity = input.quantity.trim().slice(0, MAX.quantity);
  if (!company) return { ok: false, field: "company", error: "Indiquez le nom de votre entreprise" };
  if (!items) return { ok: false, field: "items", error: "Indiquez les produits souhaités" };

  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return { ok: false, error: "Numéro WhatsApp de la boutique manquant" };

  const lines: string[] = [];
  if (brand.visibility === "private") lines.push(`[Démo ${brand.name}]`);
  lines.push("Bonjour, je souhaite un devis pour une entreprise.", "", `Entreprise : ${company}`, `Demande : ${items}`);
  if (quantity) lines.push(`Quantité : ${quantity}`);
  return { ok: true, url: `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}` };
}
