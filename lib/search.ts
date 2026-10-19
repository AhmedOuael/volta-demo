// Instant search for the header box. The catalogue is small (tens of products),
// so it runs in the browser on a list the layout hands over; Enter still opens
// /products?q=… for the full, database-backed results.

export type Searchable = { name: string; maker: string; categories: string[] };

/** Lowercase without accents: "Éclairage" → "eclairage". */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Products whose name, maker or category contain every word of the query; names starting with it first. */
export function searchProducts<T extends Searchable>(items: T[], query: string, limit = 6): T[] {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(/\s+/);
  const hits: { item: T; rank: number; index: number }[] = [];
  items.forEach((item, index) => {
    const name = normalize(item.name);
    const haystack = [name, normalize(item.maker), ...item.categories.map(normalize)].join(" ");
    if (!words.every((w) => haystack.includes(w))) return;
    const rank = name.startsWith(q) ? 0 : name.split(/\s+/).some((w) => w.startsWith(words[0])) ? 1 : 2;
    hits.push({ item, rank, index });
  });
  return hits
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, limit)
    .map((h) => h.item);
}
