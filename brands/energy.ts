import type { Brand } from "./types";

// Private preview for Energy Audiovisuel (@audiovisuel_energy_dz). Colours picked from their Instagram profile picture.
export const energy: Brand = {
  slug: "energy",
  name: "Energy Audiovisuel",
  visibility: "private",
  logo: "/brands/energy/logo.jpg",
  logoAlt: "Energy Audiovisuel",
  colors: {
    primary: "#5b21b6",
    onPrimary: "#ffffff",
    accent: "#9333ea",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#1e1033",
    muted: "#5b6170",
  },
  fonts: { display: "Inter", body: "Inter" },
  tagline: "Son, image et éclairage pour vos tournages",
  deliveryPromise: "Livraison partout en Algérie · Paiement à la livraison",
  heroImage: "/catalog/hero-studio.jpg",
  instagram: "audiovisuel_energy_dz",
};
