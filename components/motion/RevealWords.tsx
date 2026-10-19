"use client";

import { useRef, type ElementType } from "react";
import { useReveal } from "./Reveal";

/** A heading whose words rise in one after another (45 ms apart) when it scrolls into view. */
export default function RevealWords({ text, as: Tag = "h2", className, id }: { text: string; as?: ElementType; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, "words");
  const words = text.split(" ");
  return (
    <Tag ref={ref} id={id} className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <span className="reveal-word">
            <span style={{ "--i": i } as React.CSSProperties}>{word}</span>
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
