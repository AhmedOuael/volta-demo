// Brand + site-wide SEO settings, in one place.
// Set NEXT_PUBLIC_SITE_URL to the real domain at launch (e.g. https://noirluxe.dz).
// On Vercel it falls back to the project's production URL.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE = {
  name: "NOIR",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")).replace(/\/$/, ""),
  title: "NOIR | Luxury streetwear made in Algeria",
  description:
    "Heavyweight hoodies, coats and essentials cut and finished in Algeria. Cash on delivery to every wilaya.",
  locale: "en",
  ogImage: "/images/hero-wardrobe.jpg",
};

/** JSON for a <script type="application/ld+json">, with "<" escaped so content can't break out of the tag. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
