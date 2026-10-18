import type { Brand } from "./types";

// Private preview for NXT Store (@nxt_store_dz). Colours picked from their Instagram profile picture.
export const nxtstore: Brand = {
  slug: "nxtstore",
  name: "NXT Store",
  visibility: "private",
  logo: "/brands/nxtstore/logo.jpg",
  logoAlt: "NXT Store",
  colors: {
    primary: "#0b1f3a",
    onPrimary: "#ffffff",
    accent: "#2563eb",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#0b1f3a",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "High-tech et accessoires livrés partout en Algérie",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "nxt_store_dz",
};
