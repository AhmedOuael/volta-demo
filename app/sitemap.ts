import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getDefaultBrand } from "@/brands";
import { SITE } from "@/lib/site";

// Rebuilt at most once an hour so new products appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (getDefaultBrand().visibility === "private") return [];
  const products = await prisma.product.findMany({
    where: { active: true, variants: { some: { active: true } } },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/products`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({
      url: `${SITE.url}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
