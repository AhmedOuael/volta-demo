import type { Brand } from "./types";

// Private preview for Mido Camera (@mido.camera). Colours picked from their Instagram profile picture.
export const midocamera: Brand = {
  slug: "midocamera",
  name: "Mido Camera",
  visibility: "private",
  logo: "/brands/midocamera/logo.jpg",
  logoAlt: "Mido Camera",
  colors: {
    primary: "#9b1c1c",
    onPrimary: "#ffffff",
    accent: "#9b1c1c",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#1f1f1f",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Magasin informatique et audiovisuel",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "mido.camera",
};
