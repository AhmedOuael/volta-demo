import type { Brand } from "./types";

// Private preview for Milo Tech (@milo_techdz). Colours picked from their Instagram profile picture.
export const milotech: Brand = {
  slug: "milotech",
  name: "Milo Tech",
  visibility: "private",
  logo: "/brands/milotech/logo.jpg",
  logoAlt: "Milo Tech",
  colors: {
    primary: "#1c1c1c",
    onPrimary: "#ffffff",
    accent: "#4f8f25",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#1c1c1c",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "High-tech et accessoires à Birtouta",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "milo_techdz",
};
