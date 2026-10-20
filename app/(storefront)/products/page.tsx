import type { Metadata } from "next";
import FilterSheet from "@/components/catalog/FilterSheet";
import { getCategories, getMakers, getProducts } from "@/lib/catalog";
import { parseFilters } from "@/lib/catalog-filters";
import ProductGrid from "./ProductGrid";
import { toCardProduct } from "@/lib/merchandising";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Caméras, micros, éclairage, informatique et accessoires. Paiement à la livraison partout en Algérie.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseFilters(await searchParams);
  const [products, all, categories, makers] = await Promise.all([getProducts(filters), getProducts(), getCategories(), getMakers()]);

  return (
    <div className="px-5 md:px-16 py-16">
      <div className="mb-10 motion-safe:animate-rise">
        <p className="text-xs tracking-label uppercase text-secondary mb-2">Catalogue</p>
        <h1 className="font-display text-3xl md:text-5xl">{filters.cat ?? "Tous les produits"}</h1>
      </div>

      <FilterSheet filters={filters} categories={categories} makers={makers}>
        <ProductGrid products={products.map(toCardProduct)} total={all.length} />
      </FilterSheet>
    </div>
  );
}
