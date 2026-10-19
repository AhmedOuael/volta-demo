import Image from "next/image";
import Link from "@/components/brand/BrandLink";
import Reveal from "@/components/motion/Reveal";

export type CategoryTile = { name: string; href: string; image: string | null };

/** Big photo tiles with the category name centred; the first one spans the full width. */
export default function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      {tiles.map((t, i) => (
        <Reveal key={t.name} delay={i === 0 ? 0 : ((i - 1) % 2) * 90} className={i === 0 ? "md:col-span-2" : undefined}>
        <Link
          href={t.href}
          data-spotlight
          className={`group relative isolate flex items-center justify-center overflow-hidden rounded-md bg-zinc-900 ${
            i === 0 ? "aspect-16/9 md:aspect-21/8" : "aspect-16/9"
          }`}
        >
          {t.image && (
            <Image
              src={t.image}
              alt=""
              fill
              sizes={i === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
              className="-z-10 object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/40 group-hover:bg-black/30 transition-colors" />
          <div className="text-center text-white">
            <p className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">{t.name}</p>
            <p className="mt-2 text-sm font-medium opacity-90 transition-transform duration-300 group-hover:translate-x-1">Explorer la catégorie →</p>
          </div>
        </Link>
        </Reveal>
      ))}
    </div>
  );
}
