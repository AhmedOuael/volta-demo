import type { Brand } from "./types";

// Private preview for Mahmoud Camera (@mahmoud_camera_dz). Colours picked from their Instagram profile picture.
export const mahmoudcamera: Brand = {
  slug: "mahmoudcamera",
  name: "Mahmoud Camera",
  visibility: "private",
  logo: "/brands/mahmoudcamera/logo.jpg",
  logoAlt: "Mahmoud Camera",
  colors: {
    primary: "#18181b",
    onPrimary: "#ffffff",
    accent: "#52525b",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#18181b",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Appareils photo neufs et d'occasion, reprise possible",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "mahmoud_camera_dz",
};
