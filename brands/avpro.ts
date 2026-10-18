import type { Brand } from "./types";

// Private preview for AVPRO DZ (@avpro.dz). Colours picked from their Instagram profile picture.
export const avpro: Brand = {
  slug: "avpro",
  name: "AVPRO DZ",
  visibility: "private",
  logo: "/brands/avpro/logo.jpg",
  logoAlt: "AVPRO DZ",
  colors: {
    primary: "#0b0b0b",
    onPrimary: "#ffffff",
    accent: "#1597b8",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#0b0b0b",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Photo et vidéo pour créateurs et professionnels",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "avpro.dz",
};
