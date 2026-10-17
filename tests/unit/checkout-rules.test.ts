import { describe, expect, it } from "vitest";
import { normalizePhone } from "@/lib/orders";
import { imageUrl } from "@/lib/images";
import { formatDZD, formatPhone } from "@/lib/format";

describe("normalizePhone (Algerian mobiles)", () => {
  it.each([
    ["0551234567", "0551234567"],
    ["05 51 23 45 67", "0551234567"],
    ["+213 661 23 45 67", "0661234567"],
    ["00213771234567", "0771234567"],
    ["213551234567", "0551234567"],
    ["0551-23.45(67)", "0551234567"],
  ])("accepts %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(["021123456", "0451234567", "055123456", "05512345678", "abc", ""])("rejects %s", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe("imageUrl", () => {
  it("keeps /public paths", () => expect(imageUrl("/images/shirt.jpg")).toBe("/images/shirt.jpg"));
  it("allows configured https hosts", () =>
    expect(imageUrl("https://lh3.googleusercontent.com/a")).toBe("https://lh3.googleusercontent.com/a"));
  it.each(["https://evil.example.com/x.jpg", "http://lh3.googleusercontent.com/a", "//evil.example.com/x.jpg", "javascript:alert(1)", "", "/"])(
    "refuses %s",
    (input) => expect(imageUrl(input)).toBeNull()
  );
  it("needs the CDN for storage keys", () => {
    // NEXT_PUBLIC_IMAGE_BASE_URL is unset in tests, so an R2 key can't resolve.
    expect(imageUrl("products/hoodie/abc.jpg")).toBeNull();
  });
});

describe("formatting", () => {
  it("formats prices the Algerian way, with non-breaking spaces", () => expect(formatDZD(14500)).toBe("14 500 DA"));
  it("groups phone digits", () => expect(formatPhone("0551234567")).toBe("0551 23 45 67"));
});
