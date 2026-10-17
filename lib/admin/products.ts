import "server-only";
import { prisma } from "../prisma";
import { Prisma } from "../generated/prisma/client";
import { imageUrl } from "../images";
import type { ActionResult } from "./orders";

// ---------------------------------------------------------------- types

export type CategoryOption = { id: string; name: string };

export type ProductListRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  limited: boolean;
  image: string | null;
  categories: string[];
  sizes: number;
  available: number;
  reserved: number;
  minPrice: number;
  maxPrice: number;
};

export type VariantForm = {
  id?: string;
  size: string;
  color: string;
  sku: string;
  price: string;
  physicalStock: number;
  active: boolean;
  reservedStock?: number; // read-only, from the server
  hasOrders?: boolean; // read-only: can't be deleted, only hidden
};

export type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  details: string[];
  limited: boolean;
  active: boolean;
  categoryIds: string[];
  images: string[]; // stored values: "/public/path"; first = main photo
  variants: VariantForm[];
};

// ---------------------------------------------------------------- read

export async function listProducts(q?: string): Promise<ProductListRow[]> {
  const search = q?.trim();
  const rows = await prisma.product.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search.toLowerCase() } },
            { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
          ],
        }
      : undefined,
    orderBy: [{ active: "desc" }, { updatedAt: "desc" }],
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }], take: 1 },
      categories: { include: { category: { select: { name: true } } } },
      variants: { where: { active: true }, select: { price: true, physicalStock: true, reservedStock: true } },
    },
  });

  return rows.map((p) => {
    const prices = p.variants.map((v) => v.price.toNumber());
    return {
      id: p.id.toString(),
      name: p.name,
      slug: p.slug,
      active: p.active,
      limited: p.limited,
      image: p.images[0] ? imageUrl(p.images[0].imageUrl) : null,
      categories: p.categories.map((c) => c.category.name).sort(),
      sizes: p.variants.length,
      available: p.variants.reduce((n, v) => n + Math.max(0, v.physicalStock - v.reservedStock), 0),
      reserved: p.variants.reduce((n, v) => n + v.reservedStock, 0),
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
    };
  });
}

export async function listCategories(): Promise<CategoryOption[]> {
  const rows = await prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  return rows.map((c) => ({ id: c.id.toString(), name: c.name }));
}

export async function getProductForm(idParam: string): Promise<ProductForm | null> {
  if (!/^\d{1,18}$/.test(idParam)) return null;
  const p = await prisma.product.findUnique({
    where: { id: BigInt(idParam) },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }] },
      categories: true,
      variants: { orderBy: { id: "asc" }, include: { _count: { select: { orderItems: true } } } },
    },
  });
  if (!p) return null;
  return {
    id: p.id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    details: p.details,
    limited: p.limited,
    active: p.active,
    categoryIds: p.categories.map((c) => c.categoryId.toString()),
    images: p.images.map((i) => i.imageUrl),
    variants: p.variants.map((v) => ({
      id: v.id.toString(),
      size: v.size ?? "",
      color: v.color ?? "",
      sku: v.sku,
      price: v.price.toString(),
      physicalStock: v.physicalStock,
      active: v.active,
      reservedStock: v.reservedStock,
      hasOrders: v._count.orderItems > 0,
    })),
  };
}

// ---------------------------------------------------------------- validation

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const ID = /^\d{1,18}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SKU = /^[A-Za-z0-9._-]{1,40}$/;
const PRICE = /^\d{1,8}(\.\d{1,2})?$/;
const IMAGE_VALUE = /^(\/[\w\-./]+|products\/[\w-]+\/[\w-]+\.(jpg|png|webp|avif))$/;

class ProductError extends Error {}

type CleanVariant = {
  id: bigint | null;
  size: string | null;
  color: string | null;
  sku: string;
  price: Prisma.Decimal;
  physicalStock: number;
  active: boolean;
};

function parseForm(input: unknown) {
  if (!isRecord(input)) throw new ProductError("Requête invalide.");

  const name = str(input.name).replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 120) throw new ProductError("Entrez un nom de produit (2 à 120 caractères).");

  const slug = str(input.slug).toLowerCase();
  if (!SLUG.test(slug) || slug.length > 80) {
    throw new ProductError("L'adresse ne peut contenir que des minuscules, des chiffres et des tirets, par exemple micro-sans-fil-duo.");
  }

  const description = str(input.description);
  if (description.length > 2000) throw new ProductError("La description est trop longue (2 000 caractères maximum).");

  const details = Array.isArray(input.details) ? input.details.map(str).filter(Boolean) : [];
  if (details.length > 12 || details.some((d) => d.length > 120)) {
    throw new ProductError("Use at most 12 details of 120 characters each.");
  }

  const categoryIds = Array.isArray(input.categoryIds) ? [...new Set(input.categoryIds.filter((c) => typeof c === "string" && ID.test(c)))] : [];

  const images = Array.isArray(input.images) ? input.images.filter((i): i is string => typeof i === "string") : [];
  if (images.length > 12 || images.some((i) => !IMAGE_VALUE.test(i))) throw new ProductError("Liste de photos invalide.");

  if (!Array.isArray(input.variants) || input.variants.length === 0) {
    throw new ProductError("Ajoutez au moins une version.");
  }
  if (input.variants.length > 50) throw new ProductError("Un produit peut avoir au maximum 50 versions.");

  const variants: CleanVariant[] = input.variants.map((raw, i) => {
    const row = `Ligne ${i + 1}`;
    if (!isRecord(raw)) throw new ProductError(`${row} : invalide.`);
    const size = str(raw.size);
    const color = str(raw.color);
    const sku = str(raw.sku).toUpperCase();
    const price = str(raw.price);
    const stock = Number(raw.physicalStock);
    if (!size && !color) throw new ProductError(`${row} : indiquez une variante ou une couleur.`);
    if (size.length > 20 || color.length > 40) throw new ProductError(`${row} : la variante ou la couleur est trop longue.`);
    if (!SKU.test(sku)) throw new ProductError(`${row} : la référence ne peut contenir que des lettres, des chiffres, des points et des tirets.`);
    if (!PRICE.test(price)) throw new ProductError(`${row} : indiquez un prix valide.`);
    if (!Number.isInteger(stock) || stock < 0 || stock > 100000) throw new ProductError(`${row} : indiquez un stock entre 0 et 100 000.`);
    const id = typeof raw.id === "string" && ID.test(raw.id) ? BigInt(raw.id) : null;
    return {
      id,
      size: size || null,
      color: color || null,
      sku,
      price: new Prisma.Decimal(price),
      physicalStock: stock,
      active: raw.active !== false,
    };
  });

  const skus = new Set<string>();
  const combos = new Set<string>();
  for (const v of variants) {
    if (skus.has(v.sku)) throw new ProductError(`La référence ${v.sku} est utilisée deux fois.`);
    skus.add(v.sku);
    const combo = `${(v.color ?? "").toLowerCase()}|${(v.size ?? "").toLowerCase()}`;
    if (combos.has(combo)) {
      throw new ProductError(`${[v.color, v.size].filter(Boolean).join(" / ")} apparaît deux fois.`);
    }
    combos.add(combo);
  }

  return {
    name,
    slug,
    description: description || null,
    details,
    limited: input.limited === true,
    active: input.active !== false,
    categoryIds: categoryIds.map(BigInt),
    images,
    variants,
  };
}

// ---------------------------------------------------------------- write

export type SaveProductResult = (ActionResult & { id?: string; slugs?: string[] });

/** Creates (no id) or updates a product with its categories, photos and sizes. */
export async function saveProduct(idParam: string | null, input: unknown): Promise<SaveProductResult> {
  try {
    const data = parseForm(input);
    const productId = idParam && ID.test(idParam) ? BigInt(idParam) : null;
    if (idParam && !productId) throw new ProductError("Produit introuvable.");

    const result = await prisma.$transaction(async (tx) => {
      const existing = productId
        ? await tx.product.findUnique({
            where: { id: productId },
            include: { images: true, variants: { include: { _count: { select: { orderItems: true } } } } },
          })
        : null;
      if (productId && !existing) throw new ProductError("Produit introuvable.");

      const slugOwner = await tx.product.findUnique({ where: { slug: data.slug }, select: { id: true } });
      if (slugOwner && slugOwner.id !== productId) throw new ProductError("Un autre produit utilise déjà cette adresse.");

      const skuOwners = await tx.productVariant.findMany({
        where: { sku: { in: data.variants.map((v) => v.sku) } },
        select: { id: true, sku: true, productId: true },
      });
      const taken = skuOwners.find((owner) => owner.productId !== productId);
      if (taken) throw new ProductError(`La référence ${taken.sku} est déjà utilisée par un autre produit.`);

      if (data.categoryIds.length) {
        const found = await tx.category.count({ where: { id: { in: data.categoryIds } } });
        if (found !== data.categoryIds.length) throw new ProductError("Une catégorie sélectionnée n'existe plus.");
      }

      const fields = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        details: data.details,
        limited: data.limited,
        active: data.active,
      };
      const product = existing
        ? await tx.product.update({ where: { id: existing.id }, data: fields })
        : await tx.product.create({ data: fields });

      // Categories and photos: replace the set.
      await tx.productCategory.deleteMany({ where: { productId: product.id } });
      if (data.categoryIds.length) {
        await tx.productCategory.createMany({
          data: data.categoryIds.map((categoryId) => ({ productId: product.id, categoryId })),
        });
      }
      await tx.productImage.deleteMany({ where: { productId: product.id } });
      if (data.images.length) {
        await tx.productImage.createMany({
          data: data.images.map((imageUrl, i) => ({ productId: product.id, imageUrl, isPrimary: i === 0, displayOrder: i })),
        });
      }

      // Sizes: rows missing from the form are deleted, or hidden if they were ever ordered.
      const keptIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id!.toString()));
      for (const old of existing?.variants ?? []) {
        if (keptIds.has(old.id.toString())) continue;
        if (old._count.orderItems > 0 || old.reservedStock > 0) {
          await tx.productVariant.update({ where: { id: old.id }, data: { active: false } });
        } else {
          await tx.productVariant.delete({ where: { id: old.id } });
        }
      }
      for (const v of data.variants) {
        const values = {
          size: v.size,
          color: v.color,
          sku: v.sku,
          price: v.price,
          physicalStock: v.physicalStock,
          active: v.active,
        };
        if (v.id) {
          const old = existing?.variants.find((o) => o.id === v.id);
          if (!old) throw new ProductError("Une version du formulaire n'appartient pas à ce produit. Rechargez la page.");
          if (v.physicalStock < old.reservedStock) {
            const label = [v.color, v.size].filter(Boolean).join(" / ");
            throw new ProductError(`${label} : le stock ne peut pas être inférieur aux ${old.reservedStock} unités réservées par des commandes en cours.`);
          }
          await tx.productVariant.update({ where: { id: v.id }, data: values });
        } else {
          await tx.productVariant.create({ data: { ...values, productId: product.id } });
        }
      }

      return {
        id: product.id.toString(),
        slugs: [...new Set([data.slug, existing?.slug].filter((s): s is string => !!s))],
      };
    });

    return { ok: true, id: result.id, slugs: result.slugs };
  } catch (error) {
    if (error instanceof ProductError) return { ok: false, error: error.message };
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "Deux versions entrent en conflit (même SKU, ou même version et couleur). Vérifiez le tableau." };
    }
    throw error;
  }
}

/**
 * Products that were ever ordered are archived (hidden from the shop) so past
 * orders keep their history; others are deleted with their photos.
 */
export async function deleteProduct(idParam: string): Promise<ActionResult & { archived?: boolean; slug?: string }> {
  if (!ID.test(idParam)) return { ok: false, error: "Produit introuvable." };
  const product = await prisma.product.findUnique({
    where: { id: BigInt(idParam) },
    include: { images: true, variants: { include: { _count: { select: { orderItems: true } } } } },
  });
  if (!product) return { ok: false, error: "Produit introuvable." };

  const ordered = product.variants.some((v) => v._count.orderItems > 0 || v.reservedStock > 0);
  if (ordered) {
    await prisma.product.update({ where: { id: product.id }, data: { active: false } });
    return { ok: true, archived: true, slug: product.slug };
  }
  await prisma.product.delete({ where: { id: product.id } });
  return { ok: true, archived: false, slug: product.slug };
}

export async function createCategory(nameInput: unknown): Promise<ActionResult & { category?: CategoryOption }> {
  const name = str(nameInput).replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 40) return { ok: false, error: "Les noms de catégorie font de 2 à 40 caractères." };
  const existing = await prisma.category.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (existing) {
    if (!existing.active) await prisma.category.update({ where: { id: existing.id }, data: { active: true } });
    return { ok: true, category: { id: existing.id.toString(), name: existing.name } };
  }
  const created = await prisma.category.create({ data: { name } });
  return { ok: true, category: { id: created.id.toString(), name: created.name } };
}
