"use client";

import { useEffect, useRef, type ElementType, type ReactNode, type RefObject } from "react";

// Fades content in as it scrolls into view (opacity + transform only, so it
// runs on the compositor and never blocks scrolling). Progressive enhancement:
// the server renders everything visible; only elements that are still below
// the fold when the page loads get hidden, so there is no flash, nothing is
// lost without JavaScript, and above-the-fold content (LCP) is never delayed.

type RevealAttr = "reveal" | "words";

let observer: IntersectionObserver | null = null;
function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        for (const attr of ["reveal", "words"] as const) if (el.dataset[attr] === "hidden") el.dataset[attr] = "shown";
        observer!.unobserve(el);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0 }
  );
  return observer;
}

/** Hides the element (via data-<attr>="hidden") if it starts below the fold, and shows it once it scrolls in. */
export function useReveal(ref: RefObject<HTMLElement | null>, attr: RevealAttr = "reveal") {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return; // already on screen: leave it be
    el.dataset[attr] = "hidden";
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, [ref, attr]);
}

export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  delay?: number; // ms, for staggering siblings
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <Tag ref={ref} className={className} style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}>
      {children}
    </Tag>
  );
}
