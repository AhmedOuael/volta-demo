"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/auth/session";
import { serverBrandHref } from "@/lib/brand/server";

export async function logoutAction() {
  await deleteSession();
  redirect(await serverBrandHref("/admin/login"));
}
