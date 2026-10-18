import type { Brand } from "./types";

// Private preview for RamTeck Audiovisuel (@ramtech.audiovisuel). Colours picked from their Instagram profile picture.
export const ramtech: Brand = {
  slug: "ramtech",
  name: "RamTeck Audiovisuel",
  visibility: "private",
  logo: "/brands/ramtech/logo.jpg",
  logoAlt: "RamTeck Audiovisuel",
  colors: {
    primary: "#b5121b",
    onPrimary: "#ffffff",
    accent: "#b5121b",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#1f1f1f",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Vente de matériel audiovisuel à Constantine",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "ramtech.audiovisuel",
};
