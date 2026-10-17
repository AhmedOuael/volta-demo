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
  await expect(page.getByRole("link", { name: "Shop the collection" }).first()).toBeVisible();
  await expect(page.locator('a[href^="/products/"]').first()).toBeAttached();
  expect(errors).toEqual([]);
});

test("a customer can pick a size, add to bag and reach checkout", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/products");
  await page.locator('a[href^="/products/"]').first().click();
  await expect(page).toHaveURL(/\/products\/[^/]+$/);

  const size = page.locator("button:not([disabled])").filter({ hasText: /^(XXS|XS|S|M|L|XL|XXL|XXXL|One size|.{1,12} \/ .{1,6})$/ }).first();
  await size.click();
  await page.getByRole("button", { name: /add to bag/i }).click();
  await expect(page.getByRole("button", { name: /added to bag/i })).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByRole("link", { name: /checkout/i })).toBeVisible();
  await page.getByRole("link", { name: /checkout/i }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByRole("button", { name: /place order/i })).toBeVisible();
  expect(errors).toEqual([]);
});

test("admin pages require a login", async ({ page }) => {
  await page.goto("/admin/orders");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("unknown pages show the NOIR 404", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("This page isn't here")).toBeVisible();
});

test("SEO files and security headers are served", async ({ request }) => {
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/products/");
  const headers = (await request.get("/")).headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-powered-by"]).toBeUndefined();
});
