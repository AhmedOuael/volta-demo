import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createHash } from "node:crypto";
import { prisma } from "./prisma";
import { imageUrl } from "./images";
import type { Prisma } from "./generated/prisma/client";
import { parseSpecs, type Spec } from "./specs";
import { applyAggregateFilters, buildProductWhere, type CatalogFilters } from "./catalog-filters";

// Plain, serializable shapes handed to components (no BigInt/Decimal).
export type CatalogVariant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number; // DZD
  available: number; // physicalStock - reservedStock
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  maker: string;
  specs: Spec[];
  description: string | null;
  details: string[];
  categories: string[]; // all active categories, alphabetical
  colorName: string | null;
  price: number; // lowest active variant price
  image: string | null;
  gallery: string[];
  limited: boolean;
  variants: CatalogVariant[];
};

const productInclude = {
  categories: { include: { category: true } },
  images: { orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }] },
  variants: { where: { active: true }, orderBy: [{ price: "asc" }, { id: "asc" }] }, // cheapest version first, then seed order
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toCatalogProduct(p: ProductRow): CatalogProduct {
  const variants = p.variants
    .map((v) => ({
      id: v.id.toString(),
      sku: v.sku,
      size: v.size,
      color: v.color,
      price: v.price.toNumber(),
      available: Math.max(0, v.physicalStock - v.reservedStock),
    }));
  const images = p.images.map((img) => imageUrl(img.imageUrl)).filter((url): url is string => url !== null);
  const categories = p.categories
    .filter((pc) => pc.category.active)
    .map((pc) => pc.category.name)
    .sort((a, b) => a.localeCompare(b));

  return {
    id: p.id.toString(),
    slug: p.slug,
    name: p.name,
    maker: p.maker,
    specs: parseSpecs(p.specs),
    description: p.description,
    details: p.details,
    categories,
    colorName: variants.find((v) => v.color)?.color ?? null,
    price: variants.length ? Math.min(...variants.map((v) => v.price)) : 0,
    image: images[0] ?? null,
    gallery: images.slice(1),
    limited: p.limited,
    variants,
  };
}

// The catalogue changes only through the admin, orders and the nightly reset,
// but the database is far from the server (Neon in Frankfurt), so every page
// read used to cost a round trip of several hundred milliseconds. Reads are
// kept in the Next.js data cache, tagged "catalog": admin edits and orders
// expire it at once (updateTag), and it refreshes itself at least every 5 min
// (covers the nightly reset, which runs outside the app).
export const CATALOG_TAG = "catalog";
const CATALOG_TTL_S = 300;
// Entries are also keyed by database (a fingerprint, never the URL itself): the
// build reads the live database while the tests run on the test branch, and
// neither may be served the other's catalogue.
export const DB_CACHE_KEY = createHash("sha256").update(process.env.DATABASE_URL ?? "").digest("hex").slice(0, 12);
function cachedRead<A extends unknown[], R>(key: string, read: (...args: A) => Promise<R>) {
  return cache(unstable_cache(read, ["catalog", DB_CACHE_KEY, key], { tags: [CATALOG_TAG], revalidate: CATALOG_TTL_S }));
}

const listable = { active: true, variants: { some: { active: true } } } satisfies Prisma.ProductWhereInput;

/** Newest first; with filters, only the products that match (see lib/catalog-filters). */
export const getProducts = cachedRead("products", async (filters?: CatalogFilters): Promise<CatalogProduct[]> => {
  const rows = await prisma.product.findMany({
    where: filters ? buildProductWhere(filters) : listable,
    include: productInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  const products = rows.map(toCatalogProduct);
  return filters ? applyAggregateFilters(products, filters) : products;
});

/** Makers that have at least one listable product, for the filter list. */
export const getMakers = cachedRead("makers", async (): Promise<string[]> => {
  const rows = await prisma.product.findMany({
    where: { ...listable, maker: { not: "" } },
    distinct: ["maker"],
    orderBy: { maker: "asc" },
    select: { maker: true },
  });
  return rows.map((r) => r.maker);
});

export const getProductBySlug = cachedRead("product", async (slug: string): Promise<CatalogProduct | null> => {
  const row = await prisma.product.findFirst({
    where: { ...listable, slug },
    include: productInclude,
  });
  return row ? toCatalogProduct(row) : null;
});

export type CartVariantInfo = {
  price: number;
  available: number;
  name: string;
  slug: string;
  image: string | null;
};

/** Current price/stock for cart lines; variants no longer for sale are omitted. Not cached. */
export async function getCartVariants(variantIds: bigint[]): Promise<Record<string, CartVariantInfo>> {
  const rows = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, active: true, product: { active: true } },
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          images: { orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }], take: 1 },
        },
      },
    },
  });
  return Object.fromEntries(
    rows.map((v) => [
      v.id.toString(),
      {
        price: v.price.toNumber(),
        available: Math.max(0, v.physicalStock - v.reservedStock),
        name: v.product.name,
        slug: v.product.slug,
        image: v.product.images[0] ? imageUrl(v.product.images[0].imageUrl) : null,
      },
    ])
  );
}

/** One size of a product for "Buy now", priced and stocked from the DB. Not cached. */
export async function getBuyNowItem(variantIdParam: string) {
  if (!/^\d{1,18}$/.test(variantIdParam)) return null;
  const v = await prisma.productVariant.findFirst({
    where: { id: BigInt(variantIdParam), active: true, product: { active: true } },
    include: {
      product: {
        select: { name: true, slug: true, images: { orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }], take: 1 } },
      },
    },
  });
  if (!v) return null;
  return {
    variantId: v.id.toString(),
    slug: v.product.slug,
    name: v.product.name,
    size: v.size,
    color: v.color,
    price: v.price.toNumber(),
    image: v.product.images[0] ? imageUrl(v.product.images[0].imageUrl) : null,
    available: Math.max(0, v.physicalStock - v.reservedStock),
    quantity: 1,
  };
}

export const getCategories = cachedRead("categories", async (): Promise<string[]> => {
  const rows = await prisma.category.findMany({
    where: { active: true, products: { some: { product: listable } } },
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return rows.map((c) => c.name);
});
