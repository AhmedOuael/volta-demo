import type { Brand } from "./types";

// Private preview for Pro Vision DZ (@pro_visiondz). Colours picked from their Instagram profile picture.
export const provision: Brand = {
  slug: "provision",
  name: "Pro Vision DZ",
  visibility: "private",
  logo: "/brands/provision/logo.jpg",
  logoAlt: "Pro Vision DZ",
  colors: {
    primary: "#111111",
    onPrimary: "#ffffff",
    accent: "#15803d",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#111111",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Audiovisuel au détail et en gros à Médéa",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "pro_visiondz",
};
