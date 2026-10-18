import type { Brand } from "@/brands";
import { bannerText } from "@/lib/brand/theme";

/** Always-visible demo notice. Private previews must never look like the store's official shop. */
export default function DemoBanner({ brand }: { brand: Brand }) {
  const isPrivate = brand.visibility === "private";
  return (
    <p
      role="note"
      className={`text-center text-[11px] md:text-xs leading-snug px-4 py-2 ${
        isPrivate ? "bg-accent text-on-accent font-semibold" : "bg-surface-container text-on-surface-variant"
      }`}
    >
      {bannerText(brand)}
    </p>
  );
}
