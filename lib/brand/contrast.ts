// WCAG 2.x contrast ratio between two #rrggbb colours (1 to 21).
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrastRatio(hexA: string, hexB: string): number {
  const [a, b] = [luminance(hexA), luminance(hexB)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Black or white, whichever reads better on `hex` (text on an accent-coloured bar). */
export function inkOn(hex: string): "#000000" | "#ffffff" {
  return contrastRatio("#000000", hex) >= contrastRatio("#ffffff", hex) ? "#000000" : "#ffffff";
}
