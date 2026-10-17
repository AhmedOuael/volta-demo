import Image from "next/image";
import Link from "@/components/brand/BrandLink";

export type SpotlightData = { title: string; tagline: string; href: string; image: string | null };

/** Two large rounded cards: text on the left, the product photo on the right. */
export default function SpotlightTiles({ items }: { items: SpotlightData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((s) => (
        <Link key={s.title} href={s.href} className="group grid grid-cols-2 items-center gap-4 overflow-hidden rounded-md bg-surface-container p-6 md:p-8">
          <div>
            <p className="font-display text-xl md:text-2xl font-bold leading-tight">{s.title}</p>
            <p className="mt-2 text-sm text-on-surface-variant">{s.tagline}</p>
            <p className="mt-4 text-sm font-semibold underline underline-offset-4">Découvrir ›</p>
          </div>
          {s.image && (
            <div className="relative aspect-square overflow-hidden rounded-sm">
              <Image src={s.image} alt="" fill sizes="(max-width: 768px) 45vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
