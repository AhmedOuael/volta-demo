"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createCategory, deleteProduct, saveProduct, type SaveProductResult } from "@/lib/admin/products";
import type { ActionResult } from "@/lib/admin/orders";

// Admin-only: every action re-checks the role (actions are reachable by direct POST).

function refreshStorefront(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/products");
  for (const slug of slugs) revalidatePath(`/products/${slug}`);
}

export async function saveProductAction(productId: string | null, input: unknown): Promise<SaveProductResult> {
  await requireUser("ADMIN");
  const result = await saveProduct(typeof productId === "string" ? productId : null, input);
  if (result.ok) {
    refreshStorefront(result.slugs ?? []);
    revalidatePath("/admin/products");
  }
  return result;
}

export async function deleteProductAction(productId: string): Promise<ActionResult & { archived?: boolean }> {
  await requireUser("ADMIN");
  const result = await deleteProduct(String(productId));
  if (result.ok) {
    refreshStorefront(result.slug ? [result.slug] : []);
    revalidatePath("/admin/products");
  }
  return result.ok ? { ok: true, archived: result.archived } : result;
}

export async function createCategoryAction(name: unknown) {
  await requireUser("ADMIN");
  return createCategory(name);
}
