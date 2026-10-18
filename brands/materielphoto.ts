import type { Brand } from "./types";

// Private preview for Matériel Photographique (@materiel_photo_dz). Colours picked from their Instagram profile picture.
export const materielphoto: Brand = {
  slug: "materielphoto",
  name: "Matériel Photographique",
  visibility: "private",
  logo: "/brands/materielphoto/logo.svg",
  logoAlt: "Matériel Photographique",
  colors: {
    primary: "#1f2937",
    onPrimary: "#ffffff",
    accent: "#b91c1c",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#1f2937",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Matériel photo et vidéo à Sétif",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "materiel_photo_dz",
};
