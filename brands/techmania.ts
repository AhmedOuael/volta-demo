import type { Brand } from "./types";

// Private preview for Tech Mania DZ (@tech_mania_dz). Colours picked from their Instagram profile picture.
export const techmania: Brand = {
  slug: "techmania",
  name: "Tech Mania DZ",
  visibility: "private",
  logo: "/brands/techmania/logo.jpg",
  logoAlt: "Tech Mania DZ",
  colors: {
    primary: "#1e3a5f",
    onPrimary: "#ffffff",
    accent: "#2f6fb5",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#1e3a5f",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "High-tech à Alger, retrait en boutique",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "tech_mania_dz",
};
