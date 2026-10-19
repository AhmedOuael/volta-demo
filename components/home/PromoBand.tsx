import Image from "next/image";
import Link from "@/components/brand/BrandLink";
import RevealWords from "@/components/motion/RevealWords";
import Reveal from "@/components/motion/Reveal";

export type PromoData = { kicker: string; title: string; tagline: string; price: string; href: string; image: string | null };

/** A wide "product of the moment" band in the store's main colour, photo on the right. */
export default function PromoBand({ promo }: { promo: PromoData }) {
  return (
    <div data-spotlight className="grid md:grid-cols-2 items-center overflow-hidden rounded-lg bg-primary text-on-primary">
      <div className="p-8 md:p-14">
        <p className="text-xs font-semibold tracking-label uppercase opacity-80">{promo.kicker}</p>
        <RevealWords text={promo.title} className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-tight" />
        <p className="mt-4 max-w-md opacity-85">{promo.tagline}</p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link href={promo.href} className="relative z-2 rounded-full bg-on-primary px-7 py-3 text-sm font-semibold text-primary hover:opacity-90 transition-opacity">
            Commander
          </Link>
          <p className="text-lg font-bold">{promo.price}</p>
        </div>
      </div>
      {promo.image && (
        <Reveal className="relative aspect-4/3 md:aspect-auto md:h-full md:min-h-96">
          <Image src={promo.image} alt={promo.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </Reveal>
      )}
    </div>
  );
}
