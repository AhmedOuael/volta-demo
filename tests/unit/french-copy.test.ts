import { describe, expect, it, vi } from "vitest";

// createOrder validates the request before touching the database.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { createOrder } from "@/lib/orders";
import { ORDER_STAGES, STATUS_LABELS } from "@/lib/order-status";

describe("order status labels", () => {
  it("are in French", () => {
    expect(STATUS_LABELS).toEqual({
      NEW: "Nouvelle",
      CALLED: "Appelée",
      CUSTOMER_UNREACHABLE: "Client injoignable",
      CONFIRMED: "Confirmée",
      PREPARING: "En préparation",
      AT_DELIVERY_DESK: "Au bureau de livraison",
      OUT_FOR_DELIVERY: "En cours de livraison",
      DELIVERED: "Livrée",
      REFUSED: "Refusée",
      RETURNED: "Retournée",
      CANCELED: "Annulée",
    });
    expect(ORDER_STAGES["to-call"].label).toBe("À appeler");
    expect(ORDER_STAGES["on-the-road"].label).toBe("En route");
  });
});

describe("checkout validation messages", () => {
  const ctx = { storeSlug: "volta" };
  it("rejects a malformed request in French", async () => {
    expect(await createOrder(null, ctx)).toEqual({ ok: false, error: "Requête invalide." });
  });

  it("asks for the full name", async () => {
    expect(await createOrder({ fullName: "A" }, ctx)).toEqual({ ok: false, field: "fullName", error: "Entrez votre nom complet." });
  });

  it("asks for a valid Algerian mobile", async () => {
    expect(await createOrder({ fullName: "Client Démo", phone: "123" }, ctx)).toEqual({
      ok: false,
      field: "phone",
      error: "Entrez un numéro de mobile valide (05, 06 ou 07…).",
    });
  });

  it("asks for a delivery type", async () => {
    expect(await createOrder({ fullName: "Client Démo", phone: "0555000000", deliveryType: "X" }, ctx)).toEqual({
      ok: false,
      field: "deliveryType",
      error: "Choisissez la livraison à domicile ou au bureau de livraison.",
    });
  });
});

describe("dates", () => {
  it("are formatted in French, Algeria time", async () => {
    const { formatDateTime } = await import("@/lib/format");
    expect(formatDateTime("2026-10-17T13:05:00Z")).toBe("17 oct., 14:05");
  });
});
