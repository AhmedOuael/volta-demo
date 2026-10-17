// Hand-picked home page content. Slugs refer to the shared demo catalogue
// (prisma/data/demo-products.ts); tests/unit/home.test.ts checks they exist.
import type { CategoryName } from "./categories";

export type HeroSlide = { slug: string; kicker: string; title: string; tagline: string };

export const HERO_SLIDES: HeroSlide[] = [
  { slug: "optiq-m50-hybride", kicker: "Appareil hybride", title: "Optiq M50", tagline: "La photo et la vidéo 4K, dans un seul boîtier" },
  { slug: "sonora-usb-cast", kicker: "Micro USB", title: "Sonora USB Cast", tagline: "Branchez, enregistrez. Rien d'autre à acheter" },
  { slug: "lumex-panel-trio", kicker: "Kit d'éclairage", title: "Lumex Panel x3", tagline: "Un éclairage d'interview complet, prêt en 5 minutes" },
];

/** The photo behind each category tile. */
export const CATEGORY_TILES: Record<CategoryName, string> = {
  Caméras: "optiq-85-f1-4",
  Micros: "sonora-studio-c1",
  Éclairage: "nordlicht-softbox-duo",
  Informatique: "vektor-view-27",
  Accessoires: "kairo-sac-photo-urban",
};

export type Spotlight = { slug: string; title: string; tagline: string };

export const SPOTLIGHTS: Spotlight[] = [
  { slug: "aerix-one-4k", title: "Aerix One 4K", tagline: "Étanche sans caisson, stabilisée, prête pour le voyage" },
  { slug: "vektor-curve-34", title: "Vektor Curve 34\"", tagline: "Toute votre timeline de montage, d'un seul regard" },
];
