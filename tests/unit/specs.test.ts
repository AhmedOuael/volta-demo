import { describe, expect, it } from "vitest";
import { parseSpecs } from "@/lib/specs";

describe("parseSpecs", () => {
  it("keeps valid label/value pairs", () => {
    expect(parseSpecs([{ label: "Connecteur", value: "USB-C" }])).toEqual([{ label: "Connecteur", value: "USB-C" }]);
  });

  it("returns [] for anything that is not an array", () => {
    expect(parseSpecs("x")).toEqual([]);
    expect(parseSpecs(null)).toEqual([]);
    expect(parseSpecs({ label: "A", value: "B" })).toEqual([]);
  });

  it("drops entries without a non-empty string label and value", () => {
    expect(parseSpecs([{ label: "", value: "a" }, { label: "A" }, { label: "B", value: 3 }, "C", null])).toEqual([]);
  });

  it("keeps at most 20 entries", () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ label: `L${i}`, value: `V${i}` }));
    expect(parseSpecs(many)).toHaveLength(20);
  });

  it("trims whitespace", () => {
    expect(parseSpecs([{ label: "  Poids ", value: " 350 g  " }])).toEqual([{ label: "Poids", value: "350 g" }]);
  });
});
