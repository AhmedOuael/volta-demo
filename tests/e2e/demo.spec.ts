import { expect, test, type Page } from "@playwright/test";

// The demo journeys, on the public brand and on a private preview. Phone only:
// that's how store owners open the link from an Instagram DM.
// Needs the test branch seeded with `npm run db:seed-demo` (playwright.config.ts).

const BRANDS = [
  { base: "", name: "Volta Studio (public)" },
  { base: "/p/advancedmedia", name: "Advanced Media DZ (private preview)" },
] as const;

const orderIds: Record<string, string> = {};

test.describe.configure({ mode: "serial" });
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "demo journeys run on the phone project");
});

async function demoLogin(page: Page, base: string) {
  await page.goto(`${base}/admin/login`);
  const shown = page.locator(".select-all");
  const email = (await shown.nth(0).textContent())!.trim();
  const password = (await shown.nth(1).textContent())!.trim();
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(new RegExp(`${base}/admin(/orders)?$`));
}

for (const { base, name } of BRANDS) {
  test.describe(name, () => {
    test("search from the header finds products by name and by maker", async ({ page }) => {
      await page.goto(`${base}/`);
      await page.getByRole("button", { name: "Ouvrir le menu" }).click();
      await page.getByRole("link", { name: "Rechercher un produit" }).click();
      await expect(page).toHaveURL(`${base}/products`);

      const search = page.getByPlaceholder("Rechercher un produit ou une marque");
      await search.fill("micro");
      await search.press("Enter");
      await expect(page).toHaveURL(new RegExp(`^[^?]*${base}/products\\?q=micro$`));
      await expect(page.getByRole("link", { name: /Pied de micro perche Sonora/ })).toBeVisible();

      await page.goto(`${base}/products?q=vektor`);
      await expect(page.getByRole("link", { name: /Vektor Book 14/ })).toBeVisible();
    });

    test("'En stock uniquement' hides a sold-out product", async ({ page }) => {
      await page.goto(`${base}/products?cat=Micros`);
      await expect(page.getByRole("link", { name: /Sonora Podcast D7/ })).toBeVisible();
      await page.getByRole("button", { name: /Filtres/ }).click();
      await page.getByLabel("En stock uniquement").check();
      await expect(page).toHaveURL(/stock=1/);
      await expect(page.getByRole("link", { name: /Sonora Studio C1/ })).toBeVisible();
      await expect(page.getByRole("link", { name: /Sonora Podcast D7/ })).toHaveCount(0);
    });

    test("product page shows the maker, specs and a stock badge", async ({ page }) => {
      await page.goto(`${base}/products/optiq-16-35-f4`);
      await expect(page.getByRole("heading", { level: 1, name: "Objectif Optiq 16-35 mm f/4" })).toBeVisible();
      await expect(page.getByRole("table", { name: "Caractéristiques" })).toContainText("Focale");
      await expect(page.getByText("Plus que 1")).toBeVisible();

      await page.goto(`${base}/products/optiq-cine-24`);
      await expect(page.getByText("Rupture", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Rupture de stock" })).toBeDisabled();
    });

    test("checkout with test data ends on WhatsApp", async ({ page }) => {
      await page.goto(`${base}/products/sonora-dyn-58`);
      await page.getByRole("button", { name: "Ajouter au panier" }).click();
      await expect(page.getByRole("button", { name: /Ajouté au panier/ })).toBeVisible();

      await page.goto(`${base}/cart`);
      await page.getByRole("link", { name: "Commander" }).click();
      await expect(page).toHaveURL(`${base}/checkout`);

      await page.getByRole("button", { name: "Remplir avec des données de test" }).click();
      await expect(page.getByLabel("Nom complet")).toHaveValue("Client Démo");
      await page.getByLabel("Wilaya").selectOption({ label: "16 – Alger" });
      await expect(page.getByText(/Livraison/).first()).toBeVisible();
      await page.getByRole("button", { name: "Commander" }).click();

      await expect(page).toHaveURL(new RegExp(`${base}/checkout/success\\?order=\\d+$`));
      const orderId = new URL(page.url()).searchParams.get("order")!;
      orderIds[base] = orderId;
      await expect(page.getByText(`#${orderId}`)).toBeVisible();

      const whatsapp = page.getByRole("link", { name: "Envoyer ma commande sur WhatsApp" });
      const href = (await whatsapp.getAttribute("href"))!;
      expect(href.startsWith("https://wa.me/213555000000?text=")).toBe(true);
      const text = decodeURIComponent(href.split("?text=")[1]);
      expect(text).toContain(`#${orderId}`);
      if (base) expect(text.startsWith("[Démo Advanced Media DZ]")).toBe(true);
      else expect(text).not.toContain("[Démo");
    });

    test("the demo login sees the order but can't change it", async ({ page }) => {
      const orderId = orderIds[base];
      test.skip(!orderId, "needs the order from the checkout test");
      await demoLogin(page, base);

      await page.goto(`${base}/admin/orders`);
      // Phones get cards; the desktop table is in the DOM but hidden.
      await expect(page.getByText(`#${orderId}`).filter({ visible: true }).first()).toBeVisible();
      if (base) {
        const voltaOrder = orderIds[""];
        if (voltaOrder) await expect(page.getByText(`#${voltaOrder}`, { exact: true })).toHaveCount(0);
      }

      await page.goto(`${base}/admin/orders/${orderId}`);
      page.on("dialog", (d) => d.accept());
      await page.getByRole("button", { name: "Appelée" }).click();
      await expect(page.getByText("Action désactivée en mode démo")).toBeVisible();
    });
  });
}

test.describe("private previews", () => {
  test("are hidden from search engines and marked as a proposal", async ({ page, request }) => {
    const res = await request.get("/p/advancedmedia");
    expect(res.headers()["x-robots-tag"]).toContain("noindex");

    await page.goto("/p/advancedmedia");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByText(/Advanced Media DZ par Willou/).first()).toBeVisible();
  });

  test("the public store stays indexable", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  });

  test("mixed-case slugs redirect and unknown slugs are 404", async ({ page }) => {
    await page.goto("/p/AdvancedMedia");
    await expect(page).toHaveURL(/\/p\/advancedmedia$/);

    const res = await page.goto("/p/unknown");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("Cette page n'existe pas")).toBeVisible();
  });
});
