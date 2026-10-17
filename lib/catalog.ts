import "server-only";
import { cache } from "react";
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

const listable = { active: true, variants: { some: { active: true } } } satisfies Prisma.ProductWhereInput;

/** Newest first; with filters, only the products that match (see lib/catalog-filters). */
export const getProducts = cache(async (filters?: CatalogFilters): Promise<CatalogProduct[]> => {
  const rows = await prisma.product.findMany({
    where: filters ? buildProductWhere(filters) : listable,
    include: productInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  const products = rows.map(toCatalogProduct);
  return filters ? applyAggregateFilters(products, filters) : products;
});

/** Makers that have at least one listable product, for the filter list. */
export const getMakers = cache(async (): Promise<string[]> => {
  const rows = await prisma.product.findMany({
    where: { ...listable, maker: { not: "" } },
    distinct: ["maker"],
    orderBy: { maker: "asc" },
    select: { maker: true },
  });
  return rows.map((r) => r.maker);
});

export const getProductBySlug = cache(async (slug: string): Promise<CatalogProduct | null> => {
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

export const getCategories = cache(async (): Promise<string[]> => {
  const rows = await prisma.category.findMany({
    where: { active: true, products: { some: { product: listable } } },
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return rows.map((c) => c.name);
});
