import type { Brand } from "./types";

// Private preview for Informatics (@informatics.dz.algeria). Colours picked from their Instagram profile picture.
export const informatics: Brand = {
  slug: "informatics",
  name: "Informatics",
  visibility: "private",
  logo: "/brands/informatics/logo.jpg",
  logoAlt: "Informatics",
  colors: {
    primary: "#1f2a44",
    onPrimary: "#ffffff",
    accent: "#e85d04",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#1f2a44",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Informatique et high-tech à Alger",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "informatics.dz.algeria",
};
