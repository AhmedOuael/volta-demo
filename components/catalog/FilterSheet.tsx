"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useBrandHref } from "@/components/brand/BrandProvider";
import { activeFilterCount, type CatalogFilters } from "@/lib/catalog-filters";

const SORT_LABELS = { new: "Nouveautés", "price-asc": "Prix croissant", "price-desc": "Prix décroissant" } as const;

const field = "w-full bg-transparent border border-outline-variant px-3 py-2.5 text-sm focus:outline-none focus:border-primary";
const legend = "text-xs font-semibold tracking-label uppercase text-secondary mb-3";

/**
 * The /products filters as one GET form, so it works without JavaScript.
 * With JavaScript, changes apply at once (client navigation) and on phones the
 * filters open as a bottom sheet. The results are passed in as children.
 */
export default function FilterSheet({
  filters,
  categories,
  makers,
  children,
}: {
  filters: CatalogFilters;
  categories: string[];
  makers: string[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const href = useBrandHref();
  const action = href("/products");
  const [open, setOpen] = useState(false);
  // While the new results load, the current ones stay in place, dimmed.
  const [pending, startTransition] = useTransition();
  const count = activeFilterCount(filters);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (form: HTMLFormElement) => {
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(form)) {
      // Empty fields and the default sort stay out of the URL.
      if (typeof v === "string" && v.trim() && !(k === "sort" && v === "new")) params.append(k, v.trim());
    }
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${action}?${qs}` : action, { scroll: false }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOpen(false);
    go(e.currentTarget);
  };

  // Checkboxes, radios and the sort apply at once; typed fields wait for Enter or "Appliquer".
  const onChange = (e: React.FormEvent<HTMLFormElement>) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    if (t.type === "checkbox" || t.type === "radio" || t.tagName === "SELECT") go(e.currentTarget);
  };

  return (
    <form
      action={action}
      method="get"
      onSubmit={onSubmit}
      onChange={onChange}
      className="md:grid md:grid-cols-[220px_1fr] md:gap-10 lg:gap-14"
    >
      {/* Without JavaScript the panel can't open as a sheet, so show it inline. */}
      <noscript>
        <style>{".filter-panel{display:block!important;position:static!important}.filter-backdrop,.filter-close,.filter-toggle{display:none!important}"}</style>
      </noscript>

      {open && <div className="filter-backdrop fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside
        id="catalog-filters"
        aria-label="Filtres"
        className={`filter-panel ${open ? "block" : "hidden"} md:block fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto bg-surface p-5 pb-8 rounded-t-2xl md:static md:z-auto md:max-h-none md:overflow-visible md:bg-transparent md:p-0 md:rounded-none`}
      >
        <div className="flex items-center justify-between mb-5 md:hidden">
          <p className="font-display text-xl">Filtres</p>
          <button type="button" onClick={() => setOpen(false)} aria-label="Fermer les filtres" className="filter-close p-2 -mr-2">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-7">
          <fieldset>
            <legend className={legend}>Catégorie</legend>
            <div className="flex flex-wrap gap-2">
              {["", ...categories].map((c) => (
                <label key={c || "all"} className="cursor-pointer">
                  <input type="radio" name="cat" value={c} defaultChecked={(filters.cat ?? "") === c} className="peer sr-only" />
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium border border-outline-variant text-secondary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                    {c || "Tout"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {makers.length > 0 && (
            <fieldset>
              <legend className={legend}>Marque</legend>
              <div className="space-y-2">
                {makers.map((m) => (
                  <label key={m} className="flex items-center gap-2.5 text-sm cursor-pointer">
                    <input type="checkbox" name="maker" value={m} defaultChecked={filters.makers.includes(m)} className="accent-primary w-4 h-4" />
                    {m}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset>
            <legend className={legend}>Prix (DA)</legend>
            <div className="flex items-center gap-2">
              <input name="min" inputMode="numeric" pattern="[0-9]*" placeholder="Min" aria-label="Prix minimum" defaultValue={filters.min ?? ""} className={field} />
              <span className="text-secondary">–</span>
              <input name="max" inputMode="numeric" pattern="[0-9]*" placeholder="Max" aria-label="Prix maximum" defaultValue={filters.max ?? ""} className={field} />
            </div>
          </fieldset>

          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" name="stock" value="1" defaultChecked={filters.inStock} className="accent-primary w-4 h-4" />
            En stock uniquement
          </label>

          <div className="flex flex-col gap-3">
            <button type="submit" className="w-full px-5 py-3 bg-primary text-on-primary text-sm font-semibold rounded-md">
              Appliquer
            </button>
            {count > 0 && (
              <a href={action} className="text-center text-sm text-secondary underline underline-offset-4 hover:text-primary">
                Réinitialiser les filtres
              </a>
            )}
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <label className="flex-1 min-w-48">
            <span className="sr-only">Rechercher un produit ou une marque</span>
            <input type="search" name="q" defaultValue={filters.q ?? ""} placeholder="Rechercher un produit ou une marque" maxLength={80} className={field} />
          </label>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="catalog-filters"
            className="filter-toggle md:hidden inline-flex items-center gap-2 px-4 py-2.5 border border-outline-variant text-sm"
          >
            <SlidersHorizontal size={16} aria-hidden="true" /> Filtres{count > 0 && ` (${count})`}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-secondary whitespace-nowrap">Trier par</span>
            <select name="sort" defaultValue={filters.sort} className="bg-transparent border border-outline-variant px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-surface">
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div aria-busy={pending} className={`transition-opacity duration-200 ${pending ? "opacity-50 pointer-events-none" : ""}`}>
          {children}
        </div>
      </div>
    </form>
  );
}
