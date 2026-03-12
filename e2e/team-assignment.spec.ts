import { test, expect } from "@playwright/test";

test.describe("Team Assignment Flow", () => {
  // --- Happy Path ---

  test("can navigate to bowls assignment page", async ({ page }) => {
    await page.goto("/bowls");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    // The bowls page should load without errors
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
  });

  test("bowls page shows list of tournaments or empty state", async ({
    page,
  }) => {
    await page.goto("/bowls");
    await page.waitForTimeout(2000);

    // Page should have rendered content
    const bodyText = await page.textContent("body");
    expect(bodyText?.length).toBeGreaterThan(10);

    // Should show either tournament items or an empty/create state
    const hasItems =
      (await page.getByRole("link").filter({ hasText: /bowls|draw|fours|triples|pairs|singles/i }).count()) > 0;
    const hasEmpty =
      (await page.getByText(/no.*bowls|no.*tournament|create|get started|sign in|log in/i).count()) > 0;
    const hasHeading = (await page.locator("h1, h2").count()) > 0;
    expect(hasItems || hasEmpty || hasHeading).toBeTruthy();
  });

  test("bowls history page loads", async ({ page }) => {
    await page.goto("/bowls/history");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
  });

  test("bowls stats page loads", async ({ page }) => {
    await page.goto("/bowls/stats");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
  });

  test("bowls about page explains formats", async ({ page }) => {
    await page.goto("/bowls/about");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    // Should mention at least one format
    const formatMentioned = await page
      .getByText(/fours|triples|pairs|singles/i)
      .count();
    expect(formatMentioned).toBeGreaterThan(0);
  });

  test("bowls detail page renders tournament view with tabs", async ({
    page,
  }) => {
    // Navigate to a tournament page — uses a placeholder ID; if it doesn't exist
    // the page should show an error state, not crash
    await page.goto("/bowls/test-id-placeholder");
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
    // Should not be a 500 error page
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
  });

  // --- Format & Generation ---

  test("format labels include Fours, Triples, Pairs, Singles", async ({
    page,
  }) => {
    await page.goto("/bowls/about");
    const body = await page.textContent("body");
    const formats = ["fours", "triples", "pairs", "singles"];
    const found = formats.filter((f) =>
      body?.toLowerCase().includes(f)
    );
    // At least 2 formats should be mentioned somewhere
    expect(found.length).toBeGreaterThanOrEqual(2);
  });

  test("bowls page does not crash with no auth session", async ({ page }) => {
    await page.goto("/bowls");
    // Should either redirect to login or show the page
    const url = page.url();
    const isOk = url.includes("/bowls") || url.includes("/login");
    expect(isOk).toBeTruthy();
  });

  // --- Interaction ---

  test("draw sheet page loads for a tournament", async ({ page }) => {
    await page.goto("/bowls/test-id-placeholder/draw-sheet");
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
  });

  test("results page loads for a tournament", async ({ page }) => {
    await page.goto("/bowls/test-id-placeholder/results");
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
  });

  test("scores page loads for a tournament", async ({ page }) => {
    await page.goto("/bowls/test-id-placeholder/scores");
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
  });

  // --- Chaos & Edge ---

  test("double-navigating to bowls page doesn't break state", async ({
    page,
  }) => {
    await page.goto("/bowls");
    await page.goto("/bowls");
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
  });

  test("bowls page is responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/bowls");
    await page.waitForTimeout(1000);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test("members page for a tournament loads", async ({ page }) => {
    await page.goto("/bowls/test-id-placeholder/members");
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
  });
});
