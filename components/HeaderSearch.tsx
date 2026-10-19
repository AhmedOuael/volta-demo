"use client";

import { useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useBrandHref } from "@/components/brand/BrandProvider";
import { searchProducts, type Searchable } from "@/lib/search";

export type SearchItem = Searchable & { slug: string; image: string | null; price: string };

const LIMIT = 6;

/**
 * The header's search box: suggestions appear as you type (ARIA combobox, arrow keys
 * and Enter work), and Enter without a pick opens the full results on /products?q=…
 */
export default function HeaderSearch({ items, autoFocus = false, onDone }: { items: SearchItem[]; autoFocus?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const href = useBrandHref();
  const listId = useId();
  const wrapper = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const results = useMemo(() => searchProducts(items, query, LIMIT), [items, query]);
  const q = query.trim();
  const showList = open && q.length > 0;

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    setActive(-1);
    onDone?.();
    router.push(href(path));
  };
  const goAll = () => q && go(`/products?q=${encodeURIComponent(q)}`);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    setOpen(true);
    const n = results.length + 1; // the products, then "see all results"
    setActive((i) => (e.key === "ArrowDown" ? (i + 1) % n : (i - 1 + n) % n));
  };

  const optionId = (i: number) => `${listId}-${i}`;

  return (
    <form
      ref={wrapper}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (active >= 0 && active < results.length) go(`/products/${results[active].slug}`);
        else goAll();
      }}
      onBlur={(e) => {
        if (!wrapper.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      className="relative w-full"
    >
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" aria-hidden="true" />
      <input
        type="search"
        role="combobox"
        aria-label="Rechercher dans la boutique"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Caméra, micro, marque…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full rounded-full border border-outline-variant bg-surface-container-lowest py-2.5 pl-11 pr-4 text-sm outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_25%,transparent)]"
      />

      {showList && (
        <ul id={listId} role="listbox" aria-label="Suggestions" className="drop-in absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-md border border-outline-variant bg-background shadow-xl">
          {results.map((item, i) => (
            <li
              key={item.slug}
              id={optionId(i)}
              role="option"
              aria-selected={active === i}
              onMouseDown={(e) => e.preventDefault()} // keep focus so the click lands
              onClick={() => go(`/products/${item.slug}`)}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${active === i ? "bg-surface-container" : ""}`}
            >
              <span className="relative w-11 h-11 shrink-0 overflow-hidden rounded-sm bg-surface-container">
                {item.image && <Image src={item.image} alt="" fill sizes="44px" className="object-cover" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium truncate">{item.name}</span>
                <span className="block text-xs text-secondary">
                  {item.maker} · {item.price}
                </span>
              </span>
            </li>
          ))}
          {results.length === 0 && <li className="px-4 py-3 text-sm text-secondary">Aucun produit pour « {q} »</li>}
          <li
            id={optionId(results.length)}
            role="option"
            aria-selected={active === results.length}
            onMouseDown={(e) => e.preventDefault()}
            onClick={goAll}
            onMouseEnter={() => setActive(results.length)}
            className={`border-t border-outline-variant px-4 py-3 text-sm font-semibold cursor-pointer ${active === results.length ? "bg-surface-container" : ""}`}
          >
            Voir tous les résultats pour « {q} »
          </li>
        </ul>
      )}
    </form>
  );
}
