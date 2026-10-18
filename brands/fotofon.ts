import type { Brand } from "./types";

// Private preview for Fotofon (@fotofon.dz). Colours picked from their Instagram profile picture.
export const fotofon: Brand = {
  slug: "fotofon",
  name: "Fotofon",
  visibility: "private",
  logo: "/brands/fotofon/logo.jpg",
  logoAlt: "Fotofon",
  colors: {
    primary: "#1e4f7a",
    onPrimary: "#ffffff",
    accent: "#e8962e",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#173b5c",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Fonds photo, arrière-plans et matériel de studio",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "fotofon.dz",
};
