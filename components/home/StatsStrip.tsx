import CountUp from "@/components/motion/CountUp";
import type { HomeStat } from "@/lib/home";

/** Real numbers from the catalogue and delivery zones, counting up when seen. */
export default function StatsStrip({ stats }: { stats: HomeStat[] }) {
  return (
    <dl className="grid grid-cols-2 md:grid-cols-4 divide-outline-variant rounded-md border border-outline-variant md:divide-x">
      {stats.map((s, i) => (
        <div key={s.label} className={`px-4 py-6 text-center ${i < 2 ? "border-b md:border-b-0 border-outline-variant" : ""} ${i % 2 === 0 ? "border-r md:border-r-0 border-outline-variant" : ""}`}>
          <dt className="sr-only">{s.label}</dt>
          <dd>
            <CountUp value={s.value} className="block font-display text-3xl md:text-4xl font-extrabold tabular-nums" />
            <span aria-hidden="true" className="mt-1 block text-sm text-secondary">
              {s.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
