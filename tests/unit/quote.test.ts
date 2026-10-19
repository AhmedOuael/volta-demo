import { describe, expect, it } from "vitest";
import { buildQuoteLink } from "@/lib/quote";
import { getBrandBySlug } from "@/brands";

const volta = getBrandBySlug("volta")!;
const advancedmedia = getBrandBySlug("advancedmedia")!;
const textOf = (url: string) => decodeURIComponent(url.split("?text=")[1]);

const request = { company: "  Agence Lumière  ", items: "3 kits Lumex Panel x3", quantity: "3" };

describe("buildQuoteLink", () => {
  it("opens a WhatsApp chat with the store, pre-filled with the request", () => {
    const result = buildQuoteLink(request, "+213 555 00 00 00", volta);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.url.startsWith("https://wa.me/213555000000?text=")).toBe(true);
    expect(textOf(result.url)).toBe(
      ["Bonjour, je souhaite un devis pour une entreprise.", "", "Entreprise : Agence Lumière", "Demande : 3 kits Lumex Panel x3", "Quantité : 3"].join("\n")
    );
  });

  it("leaves out the quantity when it is empty", () => {
    const result = buildQuoteLink({ ...request, quantity: " " }, "213555000000", volta);
    expect(result.ok && textOf(result.url)).not.toContain("Quantité");
  });

  it("marks requests from a private preview as a demo", () => {
    const result = buildQuoteLink(request, "213555000000", advancedmedia);
    expect(result.ok && textOf(result.url).startsWith("[Démo Advanced Media DZ]\n")).toBe(true);
  });

  it("asks for the company and the products in French", () => {
    expect(buildQuoteLink({ ...request, company: " " }, "213555000000", volta)).toEqual({
      ok: false,
      field: "company",
      error: "Indiquez le nom de votre entreprise",
    });
    expect(buildQuoteLink({ ...request, items: "" }, "213555000000", volta)).toEqual({
      ok: false,
      field: "items",
      error: "Indiquez les produits souhaités",
    });
  });

  it("cuts very long answers", () => {
    const result = buildQuoteLink({ ...request, items: "x".repeat(2000) }, "213555000000", volta);
    expect(result.ok && textOf(result.url).length).toBeLessThan(700);
  });

  it("fails when the store has no WhatsApp number", () => {
    expect(buildQuoteLink(request, undefined, volta)).toEqual({ ok: false, error: "Numéro WhatsApp de la boutique manquant" });
  });
});
