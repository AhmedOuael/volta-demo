import type { CatalogProduct } from "./catalog";
import { formatDZD } from "./format";
import { stockBadge } from "./stock";

/**
 * What a product card and its quick view need. Cards are client components, so
 * everything they get is sent inside the page: the specs, details and gallery
 * (product page only) stay out of it.
 */
export type CardProduct = Pick<CatalogProduct, "id" | "slug" | "name" | "maker" | "description" | "price" | "image" | "variants">;

export function toCardProduct(p: CatalogProduct): CardProduct {
  return { id: p.id, slug: p.slug, name: p.name, maker: p.maker, description: p.description, price: p.price, image: p.image, variants: p.variants };
}

type Priced = Pick<CatalogProduct, "price" | "variants">;

/** "14 500 DA", or "À partir de 14 500 DA" when the versions don't all cost the same. */
export function priceLabel(product: Priced): string {
  const prices = new Set(product.variants.map((v) => v.price));
  return prices.size > 1 ? `À partir de ${formatDZD(product.price)}` : formatDZD(product.price);
}

export type CardBadge = { label: string; tone: "out" | "low" | "new" };

/** The one corner badge a product card shows: sold out > almost gone > new > nothing. */
export function cardBadge(product: Pick<CatalogProduct, "variants">, isNew: boolean): CardBadge | null {
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
export function productsForTab<T extends Priced>(products: T[], tab: HomeTab, count: number): T[] {
  if (tab === "new") return products.slice(0, count);
  const inStock = products.filter((p) => p.variants.some((v) => v.available > 0));
  const sorted = [...inStock].sort((a, b) => (tab === "budget" ? a.price - b.price : b.price - a.price));
  return sorted.slice(0, count);
}

export type CardAction = { kind: "add"; variant: CatalogProduct["variants"][number] } | { kind: "choose" } | { kind: "out" };

/** What the card's cart button does: add the only orderable version, open the quick view to choose, or nothing. */
export function cardAction(product: Pick<CatalogProduct, "variants">): CardAction {
  const orderable = product.variants.filter((v) => v.available > 0);
  if (orderable.length === 0) return { kind: "out" };
  return orderable.length === 1 ? { kind: "add", variant: orderable[0] } : { kind: "choose" };
}
