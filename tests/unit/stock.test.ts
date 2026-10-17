import { describe, expect, it } from "vitest";
import { stockBadge } from "@/lib/stock";

describe("stockBadge", () => {
  it("shows sold out at 0", () => {
    expect(stockBadge(0)).toEqual({ label: "Rupture", tone: "out" });
  });

  it("warns when only 1 or 2 are left", () => {
    expect(stockBadge(1)).toEqual({ label: "Plus que 1", tone: "low" });
    expect(stockBadge(2)).toEqual({ label: "Plus que 2", tone: "low" });
  });

  it("shows in stock from 3", () => {
    expect(stockBadge(3)).toEqual({ label: "En stock", tone: "ok" });
    expect(stockBadge(50)).toEqual({ label: "En stock", tone: "ok" });
  });
});
