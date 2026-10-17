import { describe, expect, it } from "vitest";
import { assertCanWrite, canWrite, DEMO_READ_ONLY_ERROR } from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";

const user = (role: SessionUser["role"]): SessionUser => ({ id: BigInt(1), email: "x@example.com", name: "X", role });

describe("canWrite", () => {
  it("lets admins and staff change things", () => {
    expect(canWrite(user("ADMIN"))).toBe(true);
    expect(canWrite(user("STAFF"))).toBe(true);
  });

  it("keeps the demo login read-only", () => {
    expect(canWrite(user("DEMO"))).toBe(false);
  });
});

describe("assertCanWrite", () => {
  it("refuses the demo login with a French message", () => {
    expect(assertCanWrite(user("DEMO"))).toEqual({ ok: false, error: DEMO_READ_ONLY_ERROR });
    expect(DEMO_READ_ONLY_ERROR).toBe("Action désactivée en mode démo");
  });

  it("lets admins through", () => {
    expect(assertCanWrite(user("ADMIN"))).toBeNull();
    expect(assertCanWrite(user("STAFF"))).toBeNull();
  });
});
