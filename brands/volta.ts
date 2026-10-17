import type { Brand } from "./types";

export const volta: Brand = {
  slug: "volta",
  name: "Volta Studio",
  visibility: "public",
  logo: "/brands/volta/logo.svg",
  logoAlt: "Volta Studio",
  // Same light palette as the Advanced Media preview (navy + orange on white).
  colors: {
    primary: "#183048",
    onPrimary: "#ffffff",
    accent: "#f07818",
    background: "#ffffff",
    surface: "#f4f6f9",
    text: "#183048",
    muted: "#55607a",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Caméras, micros, éclairage et informatique pour créateurs",
  deliveryPromise: "Livraison 58 wilayas · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
};
