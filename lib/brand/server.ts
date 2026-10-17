import "server-only";
import { headers } from "next/headers";
import type { Brand } from "@/brands";
import { BRAND_HEADER, brandHref, resolveBrand } from "./routing";

/** Active brand for this request (set by proxy.ts for /p/<slug> URLs). */
export async function getBrand(): Promise<Brand> {
  return resolveBrand((await headers()).get(BRAND_HEADER));
}

/** brandHref for the active brand, for server components, actions and redirects. */
export async function serverBrandHref(path: string): Promise<string> {
  return brandHref(path, (await getBrand()).slug);
}
