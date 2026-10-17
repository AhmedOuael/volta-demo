import { describe, expect, it } from "vitest";
import { buildWhatsAppOrderLink, type OrderSummary } from "@/lib/whatsapp";
import { TEST_CUSTOMER } from "@/lib/demo";
import { normalizePhone } from "@/lib/orders";
import { getBrandBySlug } from "@/brands";
import { formatDZD } from "@/lib/format";

const volta = getBrandBySlug("volta")!;
const advancedmedia = getBrandBySlug("advancedmedia")!;

const summary: OrderSummary = {
  orderId: "1042",
  customerName: "Client Démo",
  items: [
    { name: "Sonora USB Cast", version: "Avec bras · Noir", quantity: 1, unitPrice: 19500 },
    { name: "Carte SD Kairo Extreme", version: "128 Go", quantity: 2, unitPrice: 6500 },
  ],
  wilaya: "Alger",
  commune: null,
  deliveryFee: 400,
  total: 32900,
};

const textOf = (url: string) => decodeURIComponent(url.split("?text=")[1]);

describe("buildWhatsAppOrderLink", () => {
  it("opens a chat with the store number and the full order", () => {
    const url = buildWhatsAppOrderLink(summary, "213555000000", volta)!;
    expect(url.startsWith("https://wa.me/213555000000?text=")).toBe(true);
    const text = textOf(url);
    expect(text).toContain("#1042");
    expect(text).toContain("Client Démo");
    expect(text).toContain(`1 × Sonora USB Cast (Avec bras · Noir) — ${formatDZD(19500)}`);
    expect(text).toContain(`2 × Carte SD Kairo Extreme (128 Go) — ${formatDZD(13000)}`);
    expect(text).toContain("Alger");
    expect(text).toContain(formatDZD(400));
    expect(text).toContain(formatDZD(32900));
    expect(text).not.toContain("[Démo");
  });

  it("marks orders from a private preview as a demo", () => {
    const text = textOf(buildWhatsAppOrderLink(summary, "213555000000", advancedmedia)!);
    expect(text.startsWith("[Démo Advanced Media DZ]")).toBe(true);
  });

  it("lists at most 10 items and counts the rest", () => {
    const many = {
      ...summary,
      items: Array.from({ length: 12 }, (_, i) => ({ name: `Produit ${i + 1}`, version: null, quantity: 1, unitPrice: 1000 })),
    };
    const text = textOf(buildWhatsAppOrderLink(many, "213555000000", volta)!);
    expect(text.split("\n").filter((l) => l.startsWith("• "))).toHaveLength(10);
    expect(text).toContain("+2 articles");
    expect(text).not.toContain("Produit 11");
  });

  it("returns null without a store number", () => {
    expect(buildWhatsAppOrderLink(summary, undefined, volta)).toBeNull();
    expect(buildWhatsAppOrderLink(summary, "", volta)).toBeNull();
  });

  it("keeps only the digits of the store number", () => {
    expect(buildWhatsAppOrderLink(summary, "+213 555 00 00 00", volta)!.startsWith("https://wa.me/213555000000?text=")).toBe(true);
  });

  it("keeps accents intact", () => {
    const accented = { ...summary, items: [{ name: "Énergie Câble", version: null, quantity: 1, unitPrice: 500 }] };
    expect(textOf(buildWhatsAppOrderLink(accented, "213555000000", volta)!)).toContain("Énergie Câble");
  });

  it("shows the commune when there is one", () => {
    const text = textOf(buildWhatsAppOrderLink({ ...summary, commune: "Bab Ezzouar" }, "213555000000", volta)!);
    expect(text).toContain("Bab Ezzouar, Alger");
  });
});

describe("TEST_CUSTOMER", () => {
  it("is a valid Algerian mobile number", () => {
    expect(normalizePhone(TEST_CUSTOMER.phone)).toBe("0555000000");
    expect(TEST_CUSTOMER.fullName).toBe("Client Démo");
  });
});
