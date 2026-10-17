import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { getBrand } from "@/lib/brand/server";
import { SITE, jsonLd } from "@/lib/site";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Produit introuvable", robots: { index: false } };

  const brand = await getBrand();
  const description = (product.description || `${product.name} chez ${brand.name}.`).slice(0, 160);
  const images = product.image ? [{ url: product.image, alt: product.name }] : undefined;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `${product.name} | ${brand.name}`, description, url: `/products/${product.slug}`, images },
    twitter: { card: "summary_large_image", title: product.name, description, images: product.image ? [product.image] : undefined },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const brand = await getBrand();

  const url = `${SITE.url}/products/${product.slug}`;
  const absolute = (src: string) => (src.startsWith("http") ? src : `${SITE.url}${src}`);
  // Lets Google show price and availability in search results.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: [product.image, ...product.gallery].filter((s): s is string => !!s).map(absolute),
    brand: { "@type": "Brand", name: brand.name },
    sku: product.variants[0]?.sku,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "DZD",
      lowPrice: Math.min(...product.variants.map((v) => v.price)),
      highPrice: Math.max(...product.variants.map((v) => v.price)),
      offerCount: product.variants.length,
      availability: product.variants.some((v) => v.available > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
    },
  };

  return (
    <>
      {brand.visibility === "public" && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />}
      <ProductDetailClient product={product} />
    </>
  );
}
