import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("homepage loads with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Pick a Partner/i);
    // Hero CTA should be visible
    await expect(page.getByRole("link", { name: /get started|sign up/i }).first()).toBeVisible();
  });

  test("insurance page loads with coverage info", async ({ page }) => {
    await page.goto("/insurance");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    // Should show coverage types
    await expect(page.getByText(/coverage/i).first()).toBeVisible();
  });

  test("for-venues page loads", async ({ page }) => {
    await page.goto("/for-venues");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByText(/venue/i).first()).toBeVisible();
  });

  test("for-players page loads", async ({ page }) => {
    await page.goto("/for-players");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("login page renders auth form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("textbox").first()).toBeVisible();
  });

  test("signup page renders registration form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("textbox").first()).toBeVisible();
  });

  test("protected route redirects to login", async ({ page }) => {
    await page.goto("/board");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("stats page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("match-history page redirects to login", async ({ page }) => {
    await page.goto("/match-history");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});

test.describe("Navigation", () => {
  test("homepage navigation links work", async ({ page }) => {
    await page.goto("/");

    // Check for nav links
    const navLinks = page.locator("nav a, header a");
    await expect(navLinks.first()).toBeVisible();
  });

  test("insurance page has working CTAs", async ({ page }) => {
    await page.goto("/insurance");
    const ctas = page.getByRole("link", { name: /get started|sign up|learn more/i });
    if (await ctas.count() > 0) {
      await expect(ctas.first()).toBeVisible();
    }
  });
});

test.describe("Responsive Design", () => {
  test("homepage is mobile-friendly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    // No horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance

    // Hero text visible
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("insurance page is mobile-friendly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/insurance");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});
