"use client";

import { useEffect, useRef, type ElementType, type ReactNode, type RefObject } from "react";

// Fades content in as it scrolls into view (opacity + transform only, so it
// runs on the compositor and never blocks scrolling). Progressive enhancement:
// the server renders everything visible; only elements that are still below
// the fold when the page loads get hidden, so there is no flash, nothing is
// lost without JavaScript, and above-the-fold content (LCP) is never delayed.
//
// Where an element is comes from the observer's first report, never from
// measuring it (getBoundingClientRect): measuring dozens of elements while
// hiding others forced the browser to redo the page layout each time.

type RevealAttr = "reveal" | "words";

const attrOf = new WeakMap<Element, RevealAttr>();
const seen = new WeakSet<Element>();

let observer: IntersectionObserver | null = null;
function getObserver() {
  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      const attr = attrOf.get(el) ?? "reveal";
      if (!seen.has(el)) {
        // First report, right after the first layout: on screen stays as it is,
        // below the fold is hidden until it scrolls in.
        seen.add(el);
        if (entry.isIntersecting) observer!.unobserve(el);
        else el.dataset[attr] = "hidden";
      } else if (entry.isIntersecting) {
        el.dataset[attr] = "shown";
        observer!.unobserve(el);
      }
    }
  });
  return observer;
}

/** Hides the element (via data-<attr>="hidden") if it starts below the fold, and shows it once it scrolls in. */
export function useReveal(ref: RefObject<HTMLElement | null>, attr: RevealAttr = "reveal") {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    attrOf.set(el, attr);
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
