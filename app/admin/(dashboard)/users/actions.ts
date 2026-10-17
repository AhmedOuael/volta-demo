"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { assertCanWrite } from "@/lib/auth/permissions";
import { createUser, resetUserPassword, setUserActive } from "@/lib/admin/users";
import type { ActionResult } from "@/lib/admin/orders";

// Admin-only (never the demo login): each action re-checks the role.

export async function createUserAction(input: {
  email: unknown;
  name: unknown;
  role: unknown;
  password: unknown;
}): Promise<ActionResult> {
  const denied = assertCanWrite(await requireUser("ADMIN", { allowDemo: false }));
  if (denied) return denied;
  const result = await createUser({ email: input?.email, name: input?.name, role: input?.role, password: input?.password });
  if (result.ok) refresh();
  return result;
}

export async function setUserActiveAction(userId: unknown, active: unknown): Promise<ActionResult> {
  const actor = await requireUser("ADMIN", { allowDemo: false });
  const denied = assertCanWrite(actor);
  if (denied) return denied;
  const result = await setUserActive(userId, active === true, actor);
  if (result.ok) refresh();
  return result;
}

export async function resetPasswordAction(userId: unknown, password: unknown): Promise<ActionResult> {
  const actor = await requireUser("ADMIN", { allowDemo: false });
  const denied = assertCanWrite(actor);
  if (denied) return denied;
  return resetUserPassword(userId, password, actor);
}
