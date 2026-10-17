"use client";

import { createContext, useCallback, useContext } from "react";
import type { Brand } from "@/brands";
import { brandHref } from "@/lib/brand/routing";

const BrandContext = createContext<Brand | null>(null);

export function BrandProvider({ brand, children }: { brand: Brand; children: React.ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): Brand {
  const brand = useContext(BrandContext);
  if (!brand) throw new Error("useBrand() needs <BrandProvider> (set in app/layout.tsx).");
  return brand;
}

/** Client-side brandHref bound to the active brand. */
export function useBrandHref(): (path: string) => string {
  const { slug } = useBrand();
  return useCallback((path: string) => brandHref(path, slug), [slug]);
}
