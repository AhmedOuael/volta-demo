import type { Brand } from "./types";

// Private preview for Spider Gaming (@spidergaming.store). Colours picked from their Instagram profile picture.
export const spidergaming: Brand = {
  slug: "spidergaming",
  name: "Spider Gaming",
  visibility: "private",
  logo: "/brands/spidergaming/logo.jpg",
  logoAlt: "Spider Gaming",
  colors: {
    primary: "#b91c1c",
    onPrimary: "#ffffff",
    accent: "#111111",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#111111",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Gaming et accessoires PC livrés partout en Algérie",
  deliveryPromise: "Livraison 58 wilayas · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "spidergaming.store",
};
