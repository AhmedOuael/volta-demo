import Link from "@/components/brand/BrandLink";

/**
 * The brands the store carries, sliding slowly in a loop (pauses on hover).
 * The list is rendered twice so the loop has no seam; the copy is hidden from
 * screen readers and keyboards. Static and wrapped under reduced motion.
 */
export default function MakerMarquee({ makers }: { makers: string[] }) {
  const row = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} className="flex shrink-0 items-center gap-4 pr-4">
      {makers.map((m) => (
        <li key={m}>
          <Link
            href={`/products?maker=${encodeURIComponent(m)}`}
            tabIndex={copy ? -1 : undefined}
            className="block rounded-full border border-outline-variant px-7 py-3 font-display text-xl md:text-2xl font-bold text-on-surface-variant hover:border-primary hover:text-on-surface transition-colors"
          >
            {m}
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
