import type { Brand } from "./types";

// Private preview for AEK Tech Store (@aek.tech.store). Colours picked from their Instagram profile picture.
export const aektech: Brand = {
  slug: "aektech",
  name: "AEK Tech Store",
  visibility: "private",
  logo: "/brands/aektech/logo.jpg",
  logoAlt: "AEK Tech Store",
  colors: {
    primary: "#0f2236",
    onPrimary: "#ffffff",
    accent: "#2b8fb3",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#0f2236",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "High-tech et accessoires livrés partout en Algérie",
  deliveryPromise: "Livraison 58 wilayas · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "aek.tech.store",
};
