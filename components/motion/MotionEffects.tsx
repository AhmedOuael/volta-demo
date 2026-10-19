"use client";

import { useEffect, useRef } from "react";

/**
 * Page-wide effects, one listener each:
 * - the scroll progress bar and html[data-scrolled] (header shadow, smaller logo);
 * - the pointer light on [data-spotlight] cards (mouse and trackpad only).
 */
export default function MotionEffects() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      document.documentElement.dataset.scrolled = String(y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.scale = `${max > 0 ? Math.min(y / max, 1) : 0} 1`;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest<HTMLElement>("[data-spotlight]");
      if (!card) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${Math.round(e.clientX - r.left)}px`);
        card.style.setProperty("--spot-y", `${Math.round(e.clientY - r.top)}px`);
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return <div ref={bar} className="scroll-progress" aria-hidden="true" />;
}
