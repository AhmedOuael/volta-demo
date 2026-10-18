import type { Brand } from "./types";

// Private preview for Aissa Audiovisuel (@aissa.audiovisuel). Colours picked from their Instagram profile picture.
export const aissa: Brand = {
  slug: "aissa",
  name: "Aissa Audiovisuel",
  visibility: "private",
  logo: "/brands/aissa/logo.jpg",
  logoAlt: "Aissa Audiovisuel",
  colors: {
    primary: "#c8102e",
    onPrimary: "#ffffff",
    accent: "#c8102e",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#1a1a1a",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Caméras, micros et éclairage à Constantine",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "aissa.audiovisuel",
};
