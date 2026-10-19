"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/brand/BrandLink";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useBrandHref } from "@/components/brand/BrandProvider";

export type HeroSlideData = { slug: string; kicker: string; title: string; tagline: string; image: string | null; price: string };

const INTERVAL_S = 6;

/**
 * Centered product hero: kicker, big name, tagline, two buttons, the product below.
 * Slides cross-fade, and the text of each new slide rises in line by line.
 * It moves on by itself every 6 s: the active dot fills up, and the slide changes
 * when the fill ends, so pausing (hover, focus, or the pause button) stops both
 * together. No autoplay for visitors who ask for reduced motion (the fill doesn't run).
 * Swipe on phones, arrows and dots everywhere.
 */
export default function Hero({ slides }: { slides: HeroSlideData[] }) {
  const href = useBrandHref();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = slides.length;
  const go = (i: number) => setActive(((i % n) + n) % n);
  const paused = hovered || stopped;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Produits à la une"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHovered(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
      }}
      className={`relative overflow-hidden bg-linear-to-b from-surface-container to-background ${paused ? "hero-paused" : ""}`}
      style={{ "--hero-interval": `${INTERVAL_S}s` } as React.CSSProperties}
    >
      <div aria-live={stopped ? "polite" : "off"} className="grid">
        {slides.map((s, i) => {
          const on = i === active;
          const line = on ? "hero-line" : "";
          return (
            <div
              key={s.slug}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} sur ${n}`}
              aria-hidden={!on}
              inert={!on}
              className={`col-start-1 row-start-1 px-5 md:px-16 pt-10 md:pt-12 pb-20 text-center transition-opacity duration-700 ${on ? "opacity-100" : "opacity-0"}`}
            >
              <p className={`${line} text-xs md:text-sm font-semibold tracking-label uppercase text-secondary`} style={{ "--i": 0 } as React.CSSProperties}>
                {s.kicker}
              </p>
              {i === 0 ? (
                <h1 className={`${line} mt-3 font-display font-extrabold text-4xl md:text-6xl tracking-tight`} style={{ "--i": 1 } as React.CSSProperties}>
                  {s.title}
                </h1>
              ) : (
                <p className={`${line} mt-3 font-display font-extrabold text-4xl md:text-6xl tracking-tight`} style={{ "--i": 1 } as React.CSSProperties}>
                  {s.title}
                </p>
              )}
              <p className={`${line} mt-3 text-base md:text-lg text-on-surface-variant max-w-xl mx-auto`} style={{ "--i": 2 } as React.CSSProperties}>
                {s.tagline}
              </p>
              <div className={`${line} mt-7 flex flex-wrap justify-center gap-3`} style={{ "--i": 3 } as React.CSSProperties}>
                <Link href={href(`/products/${s.slug}`)} className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity">
                  Acheter · {s.price}
                </Link>
                <Link href={href("/products")} className="rounded-full border border-primary px-7 py-3 text-sm font-semibold hover:bg-surface-container transition-colors">
                  Voir la boutique
                </Link>
              </div>
              {s.image && (
                <div className={`${on ? "hero-photo" : ""} relative mx-auto mt-8 w-full max-w-2xl aspect-16/9 overflow-hidden rounded-lg shadow-xl shadow-black/10`}>
                  <Image src={s.image} alt={s.title} fill preload={i === 0} sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <>
          <button type="button" onClick={() => go(active - 1)} aria-label="Produit précédent" className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-6 w-11 h-11 rounded-full bg-background/80 border border-outline-variant items-center justify-center hover:border-primary transition">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => go(active + 1)} aria-label="Produit suivant" className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-6 w-11 h-11 rounded-full bg-background/80 border border-outline-variant items-center justify-center hover:border-primary transition">
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-3">
            <div className="flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Voir ${s.title}`}
                  aria-current={active === i}
                  className={`relative h-1.5 overflow-hidden rounded-full bg-outline-variant transition-[width] duration-300 ${active === i ? "w-10" : "w-4"}`}
                >
                  {active === i && <span key={active} className="hero-dot-fill absolute inset-0 rounded-full bg-primary" onAnimationEnd={() => go(active + 1)} />}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStopped((v) => !v)}
              aria-label={stopped ? "Reprendre le défilement" : "Mettre le défilement en pause"}
              className="w-7 h-7 rounded-full border border-outline-variant flex items-center justify-center text-secondary hover:border-primary hover:text-on-surface transition-colors"
            >
              {stopped ? <Play size={12} /> : <Pause size={12} />}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
