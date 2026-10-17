import type { SessionUser } from "./session";

export const DEMO_READ_ONLY_ERROR = "Action désactivée en mode démo";

/** Everyone but the shared demo login may change data. */
export function canWrite(user: SessionUser): boolean {
  return user.role !== "DEMO";
}

/**
 * Call at the top of every mutating Server Action, right after requireUser():
 *   const denied = assertCanWrite(user); if (denied) return denied;
 */
export function assertCanWrite(user: SessionUser): { ok: false; error: string } | null {
  return canWrite(user) ? null : { ok: false, error: DEMO_READ_ONLY_ERROR };
}
