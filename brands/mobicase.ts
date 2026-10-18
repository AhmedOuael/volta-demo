import type { Brand } from "./types";

// Private preview for Mobicase DZ (@mobicase.dz). Colours picked from their Instagram profile picture.
export const mobicase: Brand = {
  slug: "mobicase",
  name: "Mobicase DZ",
  visibility: "private",
  logo: "/brands/mobicase/logo.svg",
  logoAlt: "Mobicase DZ",
  colors: {
    primary: "#1e3a8a",
    onPrimary: "#ffffff",
    accent: "#be185d",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#172554",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Coques et accessoires mobiles, au détail et en gros",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "mobicase.dz",
};
