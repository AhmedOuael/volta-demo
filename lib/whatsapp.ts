import type { Brand } from "@/brands/types";
import { formatDZD } from "./format";

/** What the shopper just ordered; built server-side from the saved order. */
export type OrderSummary = {
  orderId: string;
  customerName: string;
  items: { name: string; version: string | null; quantity: number; unitPrice: number }[];
  wilaya: string;
  commune: string | null;
  deliveryFee: number;
  total: number;
};

const MAX_ITEM_LINES = 10;

/**
 * A wa.me link that opens a chat with the store, pre-filled with the order.
 * null when no store number is configured. Private previews are marked as a demo
 * so the message can never pass for a real order at that store.
 */
export function buildWhatsAppOrderLink(summary: OrderSummary, phone: string | undefined, brand: Brand): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;

  const lines: string[] = [];
  if (brand.visibility === "private") lines.push(`[Démo ${brand.name}]`);
  lines.push(`Bonjour, je viens de passer la commande #${summary.orderId} sur ${brand.name}.`, "");
  lines.push(`Nom : ${summary.customerName}`);
  for (const item of summary.items.slice(0, MAX_ITEM_LINES)) {
    const version = item.version ? ` (${item.version})` : "";
    lines.push(`• ${item.quantity} × ${item.name}${version} — ${formatDZD(item.unitPrice * item.quantity)}`);
  }
  const more = summary.items.length - MAX_ITEM_LINES;
  if (more > 0) lines.push(`+${more} article${more <= 1 ? "" : "s"}`);
  const place = summary.commune ? `${summary.commune}, ${summary.wilaya}` : summary.wilaya;
  lines.push(`Livraison : ${place} — ${formatDZD(summary.deliveryFee)}`);
  lines.push(`Total : ${formatDZD(summary.total)}`);

  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
}
