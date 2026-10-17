export type StockBadge = { label: string; tone: "ok" | "low" | "out" };

/** What shoppers see next to a version: sold out, only N left, or in stock. */
export function stockBadge(available: number): StockBadge {
  if (available <= 0) return { label: "Rupture", tone: "out" };
  if (available <= 2) return { label: `Plus que ${available}`, tone: "low" };
  return { label: "En stock", tone: "ok" };
}
