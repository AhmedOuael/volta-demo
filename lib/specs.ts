export type Spec = { label: string; value: string };

const MAX_SPECS = 20;

/** Reads Product.specs (JSON) into a clean list; anything malformed is dropped. */
export function parseSpecs(value: unknown): Spec[] {
  if (!Array.isArray(value)) return [];
  const specs: Spec[] = [];
  for (const entry of value) {
    if (specs.length === MAX_SPECS) break;
    if (!entry || typeof entry !== "object") continue;
    const { label, value: v } = entry as Record<string, unknown>;
    if (typeof label !== "string" || typeof v !== "string") continue;
    const l = label.trim();
    const t = v.trim();
    if (l && t) specs.push({ label: l, value: t });
  }
  return specs;
}
