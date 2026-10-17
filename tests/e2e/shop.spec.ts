import { expect, test, type Page } from "@playwright/test";

// Fails the test on any browser error or Content-Security-Policy violation.
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

test("home page loads with hero, products and no errors", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Voir la boutique" }).first()).toBeVisible();
  await expect(page.locator('a[href^="/products/"]').first()).toBeAttached();
  expect(errors).toEqual([]);
});

test("a customer can pick a version, add to the bag and reach checkout", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/products?stock=1");
  await page.locator('a[href^="/products/"]').first().click();
  await expect(page).toHaveURL(/\/products\/[^/]+$/);

  // The first version in stock is preselected.
  await page.getByRole("button", { name: "Ajouter au panier" }).click();
  await expect(page.getByRole("button", { name: /Ajouté au panier/ })).toBeVisible();

  await page.goto("/cart");
  await page.getByRole("link", { name: "Commander" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByLabel("Nom complet")).toBeVisible();
  await expect(page.getByRole("button", { name: "Commander" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("admin pages require a login", async ({ page }) => {
  await page.goto("/admin/orders");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByLabel("Mot de passe")).toBeVisible();
});

test("unknown pages show the 404 page", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("Cette page n'existe pas")).toBeVisible();
});

test("SEO files and security headers are served", async ({ request }) => {
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/products/");
  const headers = (await request.get("/")).headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-powered-by"]).toBeUndefined();
});
