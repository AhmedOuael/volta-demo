import type { MetadataRoute } from "next";
import { getDefaultBrand } from "@/brands";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // A site made for one private preview keeps every crawler out.
  if (getDefaultBrand().visibility === "private") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or per-visitor pages; they're also marked noindex.
      disallow: ["/admin", "/cart", "/checkout", "/api/", "/p/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
