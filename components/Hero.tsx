"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/brand/BrandLink";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBrandHref } from "@/components/brand/BrandProvider";

export type HeroSlideData = { slug: string; kicker: string; title: string; tagline: string; image: string | null; price: string };

/**
 * Centered product hero: kicker, big name, tagline, two buttons, the product below.
 * Slides scroll natively (swipe on phones, snap points); dots and arrows jump between them.
 * No autoplay.
 */
export default function Hero({ slides }: { slides: HeroSlideData[] }) {
  const href = useBrandHref();
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setActive(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  const arrow =
    "hidden md:flex absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-background/80 border border-outline-variant items-center justify-center hover:border-primary disabled:opacity-0 transition";

  return (
    <section aria-roledescription="carousel" aria-label="Produits à la une" className="relative bg-linear-to-b from-surface-container to-background">
      <div ref={track} className="hide-scrollbar flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain">
        {slides.map((s, i) => (
          <div
            key={s.slug}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} sur ${slides.length}`}
            className="snap-start shrink-0 w-full px-5 md:px-16 pt-10 md:pt-12 pb-16 text-center"
          >
            <p className="text-xs md:text-sm font-semibold tracking-label uppercase text-secondary">{s.kicker}</p>
            {i === 0 ? (
              <h1 className="mt-3 font-display font-extrabold text-4xl md:text-6xl tracking-tight">{s.title}</h1>
            ) : (
              <p className="mt-3 font-display font-extrabold text-4xl md:text-6xl tracking-tight">{s.title}</p>
            )}
            <p className="mt-3 text-base md:text-lg text-on-surface-variant max-w-xl mx-auto">{s.tagline}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href={href(`/products/${s.slug}`)} className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity">
                Acheter · {s.price}
              </Link>
              <Link href={href("/products")} className="rounded-full border border-primary px-7 py-3 text-sm font-semibold hover:bg-surface-container transition-colors">
                Voir la boutique
              </Link>
            </div>
            {s.image && (
              <div className="relative mx-auto mt-8 w-full max-w-2xl aspect-16/9 overflow-hidden rounded-lg shadow-xl shadow-black/10">
                <Image src={s.image} alt={s.title} fill preload={i === 0} sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Produit précédent" className={`${arrow} left-6`}>
        <ChevronLeft size={18} />
      </button>
      <button type="button" onClick={() => go(active + 1)} disabled={active === slides.length - 1} aria-label="Produit suivant" className={`${arrow} right-6`}>
        <ChevronRight size={18} />
      </button>

      <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => go(i)}
              aria-label={`Voir ${s.title}`}
              aria-current={active === i}
              className={`h-1.5 rounded-full transition-all ${active === i ? "w-8 bg-primary" : "w-4 bg-outline-variant"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
