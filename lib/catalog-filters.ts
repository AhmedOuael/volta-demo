import type { Prisma } from "./generated/prisma/client";
import type { CatalogProduct } from "./catalog";

export const SORTS = ["new", "price-asc", "price-desc"] as const;
export type Sort = (typeof SORTS)[number];

/** Everything /products can filter on; all of it lives in the URL query string. */
export type CatalogFilters = {
  q?: string;
  cat?: string;
  makers: string[];
  min?: number;
  max?: number;
  inStock: boolean;
  sort: Sort;
};

type SearchParams = Record<string, string | string[] | undefined>;

const MAX_QUERY = 80;
const MAX_MAKERS = 20;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

function price(v: string | string[] | undefined) {
  const s = first(v);
  if (!s || !/^\d{1,9}$/.test(s)) return undefined;
  return Number(s);
}

export function parseFilters(sp: SearchParams): CatalogFilters {
  const makers = [sp.maker]
    .flat()
    .map((m) => m?.trim())
    .filter((m): m is string => !!m)
    .slice(0, MAX_MAKERS);
  let min = price(sp.min);
  let max = price(sp.max);
  if (min !== undefined && max !== undefined && min > max) min = max = undefined;
  const sort = first(sp.sort);

  const filters: CatalogFilters = {
    makers: [...new Set(makers)],
    inStock: first(sp.stock) === "1",
    sort: SORTS.includes(sort as Sort) ? (sort as Sort) : "new",
  };
  const q = first(sp.q)?.slice(0, MAX_QUERY);
  const cat = first(sp.cat);
  if (q) filters.q = q;
  if (cat) filters.cat = cat;
  if (min !== undefined) filters.min = min;
  if (max !== undefined) filters.max = max;
  return filters;
}

/** The filters the database can apply directly: text, category, makers. */
export function buildProductWhere(f: CatalogFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { active: true, variants: { some: { active: true } } };
  if (f.q) {
    where.OR = [
      { name: { contains: f.q, mode: "insensitive" } },
      { maker: { contains: f.q, mode: "insensitive" } },
    ];
  }
  if (f.cat) where.categories = { some: { category: { name: f.cat, active: true } } };
  if (f.makers.length) where.maker = { in: f.makers };
  return where;
}

/** Price and stock depend on variant aggregates, so they run after loading. */
export function applyAggregateFilters(products: CatalogProduct[], f: CatalogFilters): CatalogProduct[] {
  const kept = products.filter(
    (p) =>
      (f.min === undefined || p.price >= f.min) &&
      (f.max === undefined || p.price <= f.max) &&
      (!f.inStock || p.variants.some((v) => v.available > 0))
  );
  if (f.sort === "price-asc") return kept.sort((a, b) => a.price - b.price);
  if (f.sort === "price-desc") return kept.sort((a, b) => b.price - a.price);
  return kept;
}

/** Number of filters set, for the "Filtres (n)" button. Search and sort don't count. */
export function activeFilterCount(f: CatalogFilters) {
  return (f.cat ? 1 : 0) + f.makers.length + (f.min !== undefined || f.max !== undefined ? 1 : 0) + (f.inStock ? 1 : 0);
}
