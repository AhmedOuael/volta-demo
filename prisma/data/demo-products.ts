// The shared demo catalogue: every brand preview shows these 40 products.
// Names and makers are fictional; photos are free-licence (see lib/credits.ts).
// The nightly reset restores each variant's stock to the value here, matched by SKU.
import type { Spec } from "../../lib/specs";
import type { CategoryName } from "../../lib/categories";

export type DemoVariant = { version: string; color?: string; price: number; stock: number };

export type DemoProduct = {
  slug: string;
  name: string;
  maker: string;
  category: CategoryName;
  description: string;
  specs: Spec[];
  variants: DemoVariant[];
};

/** Stable SKU so the reset can find a variant again: AERIX-ONE-4K-2 */
export const demoSku = (slug: string, index: number) => `${slug.toUpperCase()}-${index + 1}`;

/** Every product has one photo at /catalog/<slug>.jpg. */
export const demoImage = (slug: string) => `/catalog/${slug}.jpg`;

const s = (label: string, value: string): Spec => ({ label, value });

export const DEMO_PRODUCTS: DemoProduct[] = [
  // Caméras
  {
    slug: "optiq-m50-hybride",
    name: "Optiq M50 Hybride",
    maker: "Optiq",
    category: "Caméras",
    description: "Appareil hybride plein format pour la photo et la vidéo 4K. Stabilisation dans le boîtier et autofocus rapide pour filmer seul.",
    specs: [s("Capteur", "Plein format 24,2 Mpx"), s("Vidéo", "4K 60 i/s, 10 bits"), s("Stabilisation", "5 axes dans le boîtier"), s("Poids", "650 g")],
    variants: [
      { version: "Boîtier nu", price: 189000, stock: 3 },
      { version: "Kit 24-70 mm", price: 239000, stock: 2 },
    ],
  },
  {
    slug: "optiq-85-f1-4",
    name: "Objectif Optiq 85 mm f/1.4",
    maker: "Optiq",
    category: "Caméras",
    description: "Le portrait avec un flou d'arrière-plan doux et une grande ouverture pour les lieux peu éclairés.",
    specs: [s("Focale", "85 mm"), s("Ouverture", "f/1.4"), s("Filtre", "77 mm"), s("Poids", "560 g")],
    variants: [{ version: "Monture M", price: 98000, stock: 4 }],
  },
  {
    slug: "optiq-cine-24",
    name: "Objectif Optiq Ciné 24 mm T1.5",
    maker: "Optiq",
    category: "Caméras",
    description: "Objectif cinéma à bagues crantées pour suivre la mise au point. Pensé pour les tournages et les clips.",
    specs: [s("Focale", "24 mm"), s("Ouverture", "T1.5"), s("Filtre", "82 mm"), s("Bagues", "Crantées 0,8 mod")],
    variants: [{ version: "Monture M", price: 145000, stock: 0 }],
  },
  {
    slug: "optiq-16-35-f4",
    name: "Objectif Optiq 16-35 mm f/4",
    maker: "Optiq",
    category: "Caméras",
    description: "Grand-angle stabilisé pour l'immobilier, le paysage et la vidéo à main levée.",
    specs: [s("Focale", "16-35 mm"), s("Ouverture", "f/4 constante"), s("Stabilisation", "Oui"), s("Filtre", "77 mm")],
    variants: [{ version: "Monture M", price: 112000, stock: 1 }],
  },
  {
    slug: "optiq-18-55-zoom",
    name: "Objectif Optiq 18-55 mm f/2.8-4",
    maker: "Optiq",
    category: "Caméras",
    description: "Zoom polyvalent et léger, idéal comme premier objectif pour le quotidien et les voyages.",
    specs: [s("Focale", "18-55 mm"), s("Ouverture", "f/2.8-4"), s("Filtre", "58 mm"), s("Poids", "310 g")],
    variants: [{ version: "Monture X", price: 64000, stock: 7 }],
  },
  {
    slug: "aerix-one-4k",
    name: "Aerix One 4K",
    maker: "Aerix",
    category: "Caméras",
    description: "Caméra d'action compacte, étanche sans caisson, avec stabilisation électronique pour le sport et le voyage.",
    specs: [s("Vidéo", "4K 60 i/s"), s("Étanchéité", "10 m sans caisson"), s("Autonomie", "Environ 2 h"), s("Écran", "Tactile 2,3\"")],
    variants: [
      { version: "Standard", price: 48000, stock: 10 },
      { version: "Pack créateur", price: 59000, stock: 4 },
    ],
  },
  {
    slug: "aerix-duo-ecran",
    name: "Aerix Duo Écran",
    maker: "Aerix",
    category: "Caméras",
    description: "Deux écrans pour se cadrer en vlog, son stéréo amélioré et mode nuit.",
    specs: [s("Vidéo", "4K 60 i/s"), s("Écrans", "Avant 1,4\" et arrière 2,25\""), s("Étanchéité", "11 m"), s("Poids", "134 g")],
    variants: [{ version: "Standard", price: 62000, stock: 5 }],
  },
  {
    slug: "aerix-go-etanche",
    name: "Aerix Go Étanche",
    maker: "Aerix",
    category: "Caméras",
    description: "La caméra d'action à petit prix, livrée avec son caisson étanche et ses fixations.",
    specs: [s("Vidéo", "4K 30 i/s"), s("Étanchéité", "30 m avec caisson"), s("Batterie", "1050 mAh"), s("Fixations", "Incluses")],
    variants: [{ version: "Avec caisson", price: 32000, stock: 12 }],
  },

  // Micros
  {
    slug: "sonora-studio-c1",
    name: "Sonora Studio C1",
    maker: "Sonora",
    category: "Micros",
    description: "Micro statique à large membrane pour la voix off, le doublage et le podcast. Livré avec sa suspension.",
    specs: [s("Type", "Statique cardioïde"), s("Membrane", "1\""), s("Connecteur", "XLR"), s("Alimentation", "Fantôme 48 V")],
    variants: [{ version: "Avec suspension", price: 38000, stock: 6 }],
  },
  {
    slug: "sonora-voix-pro",
    name: "Sonora Voix Pro",
    maker: "Sonora",
    category: "Micros",
    description: "Une voix claire et chaude pour les vidéos et les formations en ligne.",
    specs: [s("Type", "Statique cardioïde"), s("Connecteur", "XLR"), s("Bande passante", "20 Hz – 20 kHz"), s("Poids", "480 g")],
    variants: [
      { version: "Micro seul", price: 29000, stock: 5 },
      { version: "Avec filtre anti-pop", price: 32500, stock: 2 },
    ],
  },
  {
    slug: "sonora-dyn-58",
    name: "Sonora Dyn 58",
    maker: "Sonora",
    category: "Micros",
    description: "Micro dynamique à main, robuste et peu sensible aux bruits de la pièce. Parfait pour les conférences et les interviews.",
    specs: [s("Type", "Dynamique cardioïde"), s("Connecteur", "XLR"), s("Corps", "Métal"), s("Poids", "300 g")],
    variants: [{ version: "Standard", price: 11500, stock: 20 }],
  },
  {
    slug: "sonora-pied-perche",
    name: "Pied de micro perche Sonora",
    maker: "Sonora",
    category: "Micros",
    description: "Pied stable avec perche réglable, pour placer le micro exactement où il faut.",
    specs: [s("Hauteur", "90 à 160 cm"), s("Perche", "75 cm"), s("Filetage", "3/8\" et 5/8\""), s("Poids", "2,4 kg")],
    variants: [{ version: "Standard", price: 6500, stock: 15 }],
  },
  {
    slug: "sonora-usb-cast",
    name: "Sonora USB Cast",
    maker: "Sonora",
    category: "Micros",
    description: "Branchez-le en USB et enregistrez : aucun équipement en plus. Bras articulé inclus.",
    specs: [s("Type", "Statique cardioïde"), s("Connecteur", "USB-C"), s("Résolution", "24 bits / 96 kHz"), s("Sortie casque", "Jack 3,5 mm")],
    variants: [
      { version: "Avec bras", color: "Noir", price: 19500, stock: 8 },
      { version: "Avec bras", color: "Blanc", price: 19500, stock: 0 },
    ],
  },
  {
    slug: "sonora-podcast-d7",
    name: "Sonora Podcast D7",
    maker: "Sonora",
    category: "Micros",
    description: "Le micro dynamique des studios de podcast : une voix pleine et un rejet efficace de l'écho.",
    specs: [s("Type", "Dynamique cardioïde"), s("Connecteur", "XLR"), s("Bonnette", "Incluse"), s("Poids", "765 g")],
    variants: [{ version: "Standard", price: 44000, stock: 0 }],
  },
  {
    slug: "sonora-talk-s2",
    name: "Sonora Talk S2",
    maker: "Sonora",
    category: "Micros",
    description: "Micro à main livré avec un pied de table, pour les tables rondes, les lives et les visioconférences.",
    specs: [s("Type", "Dynamique supercardioïde"), s("Connecteur", "XLR"), s("Pied de table", "Inclus"), s("Câble", "5 m")],
    variants: [{ version: "Avec pied de table", price: 14000, stock: 9 }],
  },
  {
    slug: "sonora-hf-sans-fil",
    name: "Sonora HF Sans fil",
    maker: "Sonora",
    category: "Micros",
    description: "Système sans fil UHF : récepteur et micro à main, jusqu'à 80 m de portée.",
    specs: [s("Bande", "UHF"), s("Portée", "Jusqu'à 80 m"), s("Autonomie", "8 h"), s("Récepteur", "Sortie XLR et jack")],
    variants: [
      { version: "Simple", price: 27000, stock: 6 },
      { version: "Double", price: 45000, stock: 3 },
    ],
  },

  // Éclairage
  {
    slug: "lumex-panel-trio",
    name: "Kit Lumex Panel LED x3",
    maker: "Lumex",
    category: "Éclairage",
    description: "Trois panneaux LED bicolores avec volets et pieds : un éclairage trois points complet pour l'interview.",
    specs: [s("Puissance", "3 × 45 W"), s("Température", "3200 – 5600 K"), s("IRC", "≥ 96"), s("Pieds", "Inclus, 2 m")],
    variants: [{ version: "Kit 3 panneaux", price: 58000, stock: 4 }],
  },
  {
    slug: "lumex-cob-300",
    name: "Lumex COB 300",
    maker: "Lumex",
    category: "Éclairage",
    description: "Projecteur LED puissant livré avec boîte à lumière, pour une lumière douce sur fond vert ou en studio.",
    specs: [s("Puissance", "300 W"), s("Température", "5600 K"), s("Monture", "Bowens"), s("Commande", "Application et télécommande")],
    variants: [{ version: "Avec boîte à lumière", price: 72000, stock: 2 }],
  },
  {
    slug: "lumex-flash-studio",
    name: "Flash de studio Lumex 400",
    maker: "Lumex",
    category: "Éclairage",
    description: "Flash de studio fiable pour la photo produit et le portrait, avec lampe pilote LED.",
    specs: [s("Puissance", "400 Ws"), s("Recyclage", "0,9 s"), s("Monture", "Bowens"), s("Lampe pilote", "LED 10 W")],
    variants: [{ version: "Tête seule", price: 41000, stock: 6 }],
  },
  {
    slug: "nordlicht-lanterne-90",
    name: "Boîte à lumière Nordlicht Lanterne 90",
    maker: "Nordlicht",
    category: "Éclairage",
    description: "Diffuseur lanterne qui répand une lumière douce dans toute la pièce. Montage en quelques secondes.",
    specs: [s("Diamètre", "90 cm"), s("Monture", "Bowens"), s("Pliable", "Oui, sac inclus")],
    variants: [{ version: "90 cm", price: 16500, stock: 8 }],
  },
  {
    slug: "nordlicht-softbox-duo",
    name: "Kit 2 softbox Nordlicht",
    maker: "Nordlicht",
    category: "Éclairage",
    description: "Deux boîtes à lumière avec ampoules et pieds, le kit le plus simple pour démarrer en studio.",
    specs: [s("Dimensions", "50 × 70 cm"), s("Ampoules", "2 × 85 W, 5500 K"), s("Pieds", "Inclus, 2 m")],
    variants: [{ version: "Kit 2 boîtes", price: 34000, stock: 5 }],
  },
  {
    slug: "nordlicht-octa-kit",
    name: "Kit studio Nordlicht Octa",
    maker: "Nordlicht",
    category: "Éclairage",
    description: "Kit studio complet : octabox de 120 cm, panneau LED, pieds et fond. Prêt pour la photo produit.",
    specs: [s("Octabox", "120 cm"), s("Panneau LED", "100 W"), s("Fond", "2,7 × 5 m"), s("Pieds", "3 inclus")],
    variants: [{ version: "Kit complet", price: 89000, stock: 0 }],
  },
  {
    slug: "lumex-fresnel-650",
    name: "Projecteur Lumex Fresnel 650",
    maker: "Lumex",
    category: "Éclairage",
    description: "Faisceau réglable du spot au flood, le projecteur classique des plateaux de tournage.",
    specs: [s("Puissance", "650 W"), s("Faisceau", "15° à 50°"), s("Volets", "4 inclus"), s("Poids", "3,1 kg")],
    variants: [{ version: "Standard", price: 52000, stock: 3 }],
  },
  {
    slug: "lumex-matrix-led",
    name: "Lumex Matrix LED 1200",
    maker: "Lumex",
    category: "Éclairage",
    description: "Grand panneau LED très puissant pour éclairer un plateau entier. Commande DMX et sans fil.",
    specs: [s("Puissance", "1200 W"), s("Température", "2700 – 6500 K"), s("Commande", "DMX, Bluetooth"), s("Poids", "9,8 kg")],
    variants: [{ version: "Standard", price: 160000, stock: 1 }],
  },

  // Informatique
  {
    slug: "vektor-book-14",
    name: "Vektor Book 14",
    maker: "Vektor",
    category: "Informatique",
    description: "Ordinateur portable fin et silencieux, assez puissant pour le montage vidéo en Full HD.",
    specs: [s("Écran", "14\" 2,8K"), s("Processeur", "8 cœurs"), s("Autonomie", "Jusqu'à 15 h"), s("Poids", "1,4 kg")],
    variants: [
      { version: "8 Go / 256 Go", price: 115000, stock: 5 },
      { version: "16 Go / 512 Go", price: 139000, stock: 3 },
    ],
  },
  {
    slug: "vektor-air-13",
    name: "Vektor Air 13",
    maker: "Vektor",
    category: "Informatique",
    description: "Le portable léger pour le bureau et les études, avec un écran tactile lumineux.",
    specs: [s("Écran", "13,4\" tactile"), s("Mémoire", "16 Go"), s("Stockage", "512 Go SSD"), s("Poids", "1,2 kg")],
    variants: [{ version: "16 Go / 512 Go", price: 98000, stock: 4 }],
  },
  {
    slug: "vektor-curve-34",
    name: "Écran Vektor Curve 34\"",
    maker: "Vektor",
    category: "Informatique",
    description: "Écran incurvé ultra-large pour la timeline de montage et le multitâche.",
    specs: [s("Taille", "34\" incurvé"), s("Définition", "3440 × 1440"), s("Fréquence", "144 Hz"), s("Connectique", "HDMI, DisplayPort, USB-C")],
    variants: [{ version: "Standard", price: 84000, stock: 3 }],
  },
  {
    slug: "vektor-view-27",
    name: "Écran Vektor View 27\" 4K",
    maker: "Vektor",
    category: "Informatique",
    description: "Écran 4K aux couleurs fidèles pour la retouche photo et l'étalonnage.",
    specs: [s("Taille", "27\""), s("Définition", "3840 × 2160"), s("Couleurs", "99 % sRGB"), s("Connectique", "HDMI, USB-C 65 W")],
    variants: [{ version: "Standard", price: 62000, stock: 6 }],
  },
  {
    slug: "vektor-k84-meca",
    name: "Clavier mécanique Vektor K84",
    maker: "Vektor",
    category: "Informatique",
    description: "Clavier mécanique compact sans fil, rétroéclairé, compatible Windows et Mac.",
    specs: [s("Format", "75 %, 84 touches"), s("Connexion", "Bluetooth et USB-C"), s("Autonomie", "Jusqu'à 200 h"), s("Disposition", "AZERTY")],
    variants: [
      { version: "Switch rouge", price: 14500, stock: 7 },
      { version: "Switch marron", price: 14500, stock: 1 },
    ],
  },
  {
    slug: "vektor-souris-r1",
    name: "Souris sans fil Vektor R1",
    maker: "Vektor",
    category: "Informatique",
    description: "Souris sans fil ergonomique avec récepteur USB, jusqu'à 12 mois sur une pile.",
    specs: [s("Connexion", "Récepteur USB 2,4 GHz"), s("Résolution", "1600 DPI"), s("Autonomie", "12 mois")],
    variants: [
      { version: "Standard", color: "Rouge", price: 3200, stock: 14 },
      { version: "Standard", color: "Noir", price: 3200, stock: 10 },
    ],
  },
  {
    slug: "vektor-souris-m2",
    name: "Souris sans fil Vektor M2",
    maker: "Vektor",
    category: "Informatique",
    description: "Souris silencieuse et précise, Bluetooth ou récepteur, pour passer d'un appareil à l'autre.",
    specs: [s("Connexion", "Bluetooth et récepteur USB"), s("Résolution", "4000 DPI"), s("Clics", "Silencieux")],
    variants: [{ version: "Standard", price: 4500, stock: 11 }],
  },
  {
    slug: "vektor-ram-ddr4",
    name: "Mémoire Vektor DDR4 3200",
    maker: "Vektor",
    category: "Informatique",
    description: "Barrette mémoire pour accélérer un PC de bureau qui rame au montage ou au jeu.",
    specs: [s("Type", "DDR4 DIMM"), s("Fréquence", "3200 MHz"), s("Latence", "CL16"), s("Garantie", "Limitée à vie")],
    variants: [
      { version: "8 Go", price: 7500, stock: 20 },
      { version: "16 Go", price: 13500, stock: 9 },
    ],
  },

  // Accessoires
  {
    slug: "kairo-trepied-alu",
    name: "Trépied Kairo Alu 150",
    maker: "Kairo",
    category: "Accessoires",
    description: "Trépied léger en aluminium avec tête trois directions, pour appareil photo ou smartphone.",
    specs: [s("Hauteur max", "150 cm"), s("Charge", "3 kg"), s("Poids", "1,1 kg"), s("Support smartphone", "Inclus")],
    variants: [{ version: "Standard", price: 5900, stock: 18 }],
  },
  {
    slug: "kairo-rotule-video",
    name: "Rotule vidéo fluide Kairo",
    maker: "Kairo",
    category: "Accessoires",
    description: "Rotule fluide pour des panoramiques sans à-coups, avec plateau à dégagement rapide.",
    specs: [s("Charge", "8 kg"), s("Base", "Plate 3/8\""), s("Plateau", "Dégagement rapide"), s("Poids", "1,3 kg")],
    variants: [{ version: "Standard", price: 21000, stock: 4 }],
  },
  {
    slug: "kairo-carte-sd-extreme",
    name: "Carte SD Kairo Extreme",
    maker: "Kairo",
    category: "Accessoires",
    description: "Carte rapide pour la vidéo 4K et les rafales photo sans attente.",
    specs: [s("Classe", "V30, U3"), s("Lecture", "Jusqu'à 170 Mo/s"), s("Écriture", "Jusqu'à 90 Mo/s")],
    variants: [
      { version: "64 Go", price: 3900, stock: 25 },
      { version: "128 Go", price: 6500, stock: 12 },
    ],
  },
  {
    slug: "sonora-casque-h1",
    name: "Casque Sonora H1 sans fil",
    maker: "Sonora",
    category: "Accessoires",
    description: "Casque Bluetooth confortable pour le quotidien, avec micro pour les appels.",
    specs: [s("Connexion", "Bluetooth 5.3 et jack"), s("Autonomie", "40 h"), s("Charge", "USB-C"), s("Poids", "250 g")],
    variants: [{ version: "Standard", price: 16000, stock: 7 }],
  },
  {
    slug: "sonora-casque-anc",
    name: "Casque Sonora ANC 900",
    maker: "Sonora",
    category: "Accessoires",
    description: "Réduction de bruit active pour se concentrer au bureau comme en voyage.",
    specs: [s("Réduction de bruit", "Active, adaptative"), s("Autonomie", "30 h"), s("Charge rapide", "10 min = 5 h"), s("Poids", "254 g")],
    variants: [{ version: "Standard", price: 42000, stock: 2 }],
  },
  {
    slug: "sonora-casque-retro",
    name: "Casque Sonora Rétro filaire",
    maker: "Sonora",
    category: "Accessoires",
    description: "Casque filaire léger pour le contrôle du son au montage, sans latence.",
    specs: [s("Connexion", "Jack 3,5 mm"), s("Câble", "1,5 m"), s("Impédance", "32 Ω"), s("Poids", "180 g")],
    variants: [{ version: "Standard", price: 8500, stock: 9 }],
  },
  {
    slug: "kairo-sac-photo-pro",
    name: "Sac à dos photo Kairo Pro 30 L",
    maker: "Kairo",
    category: "Accessoires",
    description: "Sac à dos rembourré à compartiments réglables : un boîtier, quatre objectifs et un ordinateur 15\".",
    specs: [s("Volume", "30 L"), s("Ordinateur", "Jusqu'à 15\""), s("Accès", "Dos et côté"), s("Housse de pluie", "Incluse")],
    variants: [{ version: "Standard", price: 24000, stock: 5 }],
  },
  {
    slug: "kairo-sac-photo-urban",
    name: "Sac à dos photo Kairo Urban 20 L",
    maker: "Kairo",
    category: "Accessoires",
    description: "Sac discret pour la ville, avec un compartiment photo amovible.",
    specs: [s("Volume", "20 L"), s("Ordinateur", "Jusqu'à 14\""), s("Compartiment photo", "Amovible")],
    variants: [{ version: "Standard", price: 15500, stock: 6 }],
  },
];
