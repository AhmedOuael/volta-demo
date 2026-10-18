import type { Brand } from "./types";

// Private preview for Eternel Store (@eternel_audiovisuel). Colours picked from their Instagram profile picture.
export const eternel: Brand = {
  slug: "eternel",
  name: "Eternel Store",
  visibility: "private",
  logo: "/brands/eternel/logo.jpg",
  logoAlt: "Eternel Store",
  colors: {
    primary: "#2b2b2b",
    onPrimary: "#ffffff",
    accent: "#e07b12",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#2b2b2b",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Your Techno World : audiovisuel et informatique",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "eternel_audiovisuel",
};
