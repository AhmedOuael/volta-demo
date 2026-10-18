import type { Brand } from "./types";

// Private preview for Chakib Camera Store (@chakib_camera_store). Colours picked from their Instagram profile picture.
export const chakibcamera: Brand = {
  slug: "chakibcamera",
  name: "Chakib Camera Store",
  visibility: "private",
  logo: "/brands/chakibcamera/logo.svg",
  logoAlt: "Chakib Camera Store",
  colors: {
    primary: "#1f2937",
    onPrimary: "#ffffff",
    accent: "#c2410c",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#1f2937",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Vente et location de matériel photo et vidéo à Mila",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "chakib_camera_store",
};
