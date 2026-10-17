// Site-wide URL settings. Brand values (name, colours, copy) live in brands/<slug>.ts.
// NEXT_PUBLIC_SITE_URL wins; then the host's own address (Render: RENDER_EXTERNAL_URL, Netlify: URL).
export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.RENDER_EXTERNAL_URL ?? process.env.URL ?? "http://localhost:3000").replace(/\/$/, ""),
};

/** JSON for a <script type="application/ld+json">, with "<" escaped so content can't break out of the tag. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\u003c") };
}
