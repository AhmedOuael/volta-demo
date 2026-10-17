/** Every brand-specific value the store shows. A new store = one file like this + a logo. */
export type BrandColors = {
  primary: string; // main buttons, active states
  onPrimary: string; // text on primary
  accent: string; // highlights, badges
  background: string; // page background
  surface: string; // cards, panels
  text: string; // body text
  muted: string; // secondary text
};

export interface Brand {
  slug: string; // URL segment for /p/<slug>; lowercase [a-z0-9-]
  name: string;
  visibility: "public" | "private";
  logo: string; // path under /public
  logoAlt: string;
  colors: BrandColors; // all #rrggbb
  fonts: { display: string; body: string }; // families installed via @fontsource
  tagline: string;
  deliveryPromise: string;
  heroImage: string; // path under /public
  instagram?: string; // handle without @, shown for private brands
}
