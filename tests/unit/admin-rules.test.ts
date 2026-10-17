import { describe, expect, it } from "vitest";
import { DETAILS_EDITABLE, ORDER_STAGES, ORDER_STATUSES, STATUS_TRANSITIONS, isOrderStatus } from "@/lib/order-status";
import { algiersDate, parseAlgiersDate, periodRange } from "@/lib/admin/stats";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("order status rules", () => {
  it("only ever moves to real statuses", () => {
    for (const next of Object.values(STATUS_TRANSITIONS)) for (const s of next) expect(isOrderStatus(s)).toBe(true);
  });
  it("has a transition entry for every status", () => {
    expect(Object.keys(STATUS_TRANSITIONS).sort()).toEqual([...ORDER_STATUSES].sort());
  });
  it("treats delivered, returned and canceled as final", () => {
    for (const s of ["DELIVERED", "RETURNED", "CANCELED"] as const) expect(STATUS_TRANSITIONS[s]).toEqual([]);
  });
  it("can't skip shipping (confirmed -> delivered)", () => {
    expect(STATUS_TRANSITIONS.CONFIRMED).not.toContain("DELIVERED");
  });
  it("locks delivery details once the parcel is being prepared", () => {
    expect(DETAILS_EDITABLE).not.toContain("PREPARING");
  });
  it("overview groups only contain real statuses", () => {
    for (const stage of Object.values(ORDER_STAGES)) for (const s of stage.statuses) expect(isOrderStatus(s)).toBe(true);
  });
});

describe("Algeria-time dates", () => {
  it("starts 'today' at midnight in Algiers (UTC+1)", () => {
    // 00:30 on 11 March in Algiers is 23:30 on 10 March UTC.
    expect(periodRange("today", new Date("2026-03-10T23:30:00Z")).from?.toISOString()).toBe("2026-03-10T23:00:00.000Z");
  });
  it("starts '12 months' on the 1st, 11 months back", () => {
    expect(periodRange("12m", new Date("2026-10-07T10:00:00Z")).from?.toISOString()).toBe("2025-10-31T23:00:00.000Z");
  });
  it("round-trips calendar dates", () => {
    expect(algiersDate(new Date("2026-03-10T23:30:00Z"))).toBe("2026-03-11");
    expect(parseAlgiersDate("2026-03-11")?.toISOString()).toBe("2026-03-10T23:00:00.000Z");
    expect(parseAlgiersDate("11/03/2026")).toBeNull();
  });
});

describe("passwords", () => {
  it("verifies the right password only", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).toMatch(/^scrypt\$16384\$8\$1\$/);
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("correct horse batterY", hash)).toBe(false);
  });
  it("salts every hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });
  it("rejects malformed stored hashes instead of crashing or accepting", async () => {
    for (const bad of ["scrypt$16384$8$1$c2FsdA$!!!", "scrypt$1000$8$1$c2FsdA$aGFzaA", "plaintext", ""]) {
      expect(await verifyPassword("anything", bad)).toBe(false);
    }
  });
});
