// Site-wide URL settings. Brand values (name, colours, copy) live in brands/<slug>.ts.
// NEXT_PUBLIC_SITE_URL wins; on Netlify, URL is the site's main address.
export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? "http://localhost:3000").replace(/\/$/, ""),
};

/** JSON for a <script type="application/ld+json">, with "<" escaped so content can't break out of the tag. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\u003c") };
}
