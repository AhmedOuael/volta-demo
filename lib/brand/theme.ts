import type { Brand } from "@/brands";

const mix = (a: string, b: string, pctA: number) => `color-mix(in srgb, ${a} ${pctA}%, ${b})`;

/**
 * CSS custom properties for <html style>. They override the Tailwind @theme tokens
 * (globals.css), so every existing utility like bg-primary or text-on-surface follows the brand.
 */
export function brandCssVars(brand: Brand): Record<string, string> {
  const { primary, onPrimary, accent, background, surface, text, muted } = brand.colors;
  return {
    "--color-primary": primary,
    "--color-on-primary": onPrimary,
    "--color-secondary": muted,
    "--color-on-secondary": background,
    "--color-accent": accent,
    "--color-background": background,
    "--color-surface": background,
    "--color-surface-bright": background,
    "--color-surface-dim": mix(text, background, 12),
    "--color-surface-container-lowest": background,
    "--color-surface-container-low": mix(surface, background, 60),
    "--color-surface-container": surface,
    "--color-surface-container-high": mix(text, surface, 6),
    "--color-surface-container-highest": mix(text, surface, 10),
    "--color-surface-variant": mix(text, surface, 10),
    "--color-on-surface": text,
    "--color-on-surface-variant": muted,
    "--color-outline": mix(muted, background, 80),
    "--color-outline-variant": mix(text, background, 18),
    "--font-display": `"${brand.fonts.display}", ui-sans-serif, system-ui, sans-serif`,
    "--font-body": `"${brand.fonts.body}", ui-sans-serif, system-ui, sans-serif`,
  };
}

export function bannerText(brand: Brand): string {
  return brand.visibility === "private"
    ? `Maquette proposée à ${brand.name} par Willou — pas une boutique officielle`
    : "Boutique de démonstration — aucune commande n'est réelle. Conçue par Willou · ahmedouael.com";
}
