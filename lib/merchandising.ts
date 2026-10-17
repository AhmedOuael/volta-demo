import type { CatalogProduct } from "./catalog";
import { formatDZD } from "./format";
import { stockBadge } from "./stock";

/** "14 500 DA", or "À partir de 14 500 DA" when the versions don't all cost the same. */
export function priceLabel(product: CatalogProduct): string {
  const prices = new Set(product.variants.map((v) => v.price));
  return prices.size > 1 ? `À partir de ${formatDZD(product.price)}` : formatDZD(product.price);
}

export type CardBadge = { label: string; tone: "out" | "low" | "new" };

/** The one corner badge a product card shows: sold out > almost gone > new > nothing. */
export function cardBadge(product: CatalogProduct, isNew: boolean): CardBadge | null {
  const best = Math.max(0, ...product.variants.map((v) => v.available));
  const stock = stockBadge(best);
  if (stock.tone === "out" || stock.tone === "low") return { label: stock.label, tone: stock.tone };
  return isNew ? { label: "Nouveau", tone: "new" } : null;
}

export type HomeTab = "new" | "budget" | "premium";

export const HOME_TABS: { key: HomeTab; label: string }[] = [
  { key: "new", label: "Nouveautés" },
  { key: "budget", label: "Petits prix" },
  { key: "premium", label: "Haut de gamme" },
];

/** Products for a home tab, from a newest-first list. Price tabs only show what can be ordered. */
export function productsForTab(products: CatalogProduct[], tab: HomeTab, count: number): CatalogProduct[] {
  if (tab === "new") return products.slice(0, count);
  const inStock = products.filter((p) => p.variants.some((v) => v.available > 0));
  const sorted = [...inStock].sort((a, b) => (tab === "budget" ? a.price - b.price : b.price - a.price));
  return sorted.slice(0, count);
}
