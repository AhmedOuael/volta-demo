import type { Brand } from "./types";

// Private preview for Promotech.it (@promotech.it.dz). Colours picked from their Instagram profile picture.
export const promotech: Brand = {
  slug: "promotech",
  name: "Promotech.it",
  visibility: "private",
  logo: "/brands/promotech/logo.jpg",
  logoAlt: "Promotech.it",
  colors: {
    primary: "#3b2b8f",
    onPrimary: "#ffffff",
    accent: "#c2255c",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#231a57",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Informatique et setups, commande en un message",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "promotech.it.dz",
};
