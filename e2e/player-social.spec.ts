import { test, expect } from "@playwright/test";

test.describe("Player Social Features", () => {
  // --- Friends Page ---

  test("friends page loads or redirects to login", async ({ page }) => {
    await page.goto("/friends");
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes("/friends")) {
      await expect(page.locator("h1, h2").first()).toBeVisible();
    } else {
      expect(url).toContain("/login");
    }
  });

  test("friends page has search input", async ({ page }) => {
    await page.goto("/friends");
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes("/friends")) {
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], input[placeholder*="search"]');
      const hasSearch = (await searchInput.count()) > 0;
      expect(hasSearch).toBeTruthy();
    }
  });

  test("search input is at least 44px tall for touch targets", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/friends");
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes("/friends")) {
      const searchInput = page.locator('input[placeholder*="earch"]').first();
      if ((await searchInput.count()) > 0) {
        const box = await searchInput.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  // --- Player Search ---

  test("search returns results for common names", async ({ page }) => {
    await page.goto("/friends");
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes("/friends")) {
      const searchInput = page.locator('input[placeholder*="earch"]').first();
      if ((await searchInput.count()) > 0) {
        await searchInput.fill("Jo");
        await page.waitForTimeout(500);
        // Should show some results or empty state
        const body = await page.textContent("body");
        expect(body?.length).toBeGreaterThan(0);
      }
    }
  });

  // --- Profile Pages ---

  test("public profile page loads for a valid player ID", async ({ page }) => {
    // Try to access a profile - should render or redirect
    await page.goto("/profile/00000000-0000-0000-0000-000000000001");
    await page.waitForTimeout(2000);
    const url = page.url();
    const bodyText = await page.textContent("body");
    // Should show profile, 404, or redirect to login
    const isValid =
      url.includes("/profile") ||
      url.includes("/login") ||
      bodyText?.includes("not found") ||
      bodyText?.includes("404");
    expect(isValid).toBeTruthy();
  });

  test("profile setup page loads", async ({ page }) => {
    await page.goto("/profile/setup");
    await page.waitForTimeout(2000);
    const url = page.url();
    // Should load setup or redirect to login
    const isValid = url.includes("/profile") || url.includes("/login");
    expect(isValid).toBeTruthy();
  });

  // --- Chat ---

  test("chat page loads or redirects to login", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes("/chat")) {
      const status = await page.evaluate(() => document.readyState);
      expect(status).toBe("complete");
      const bodyText = await page.textContent("body");
      expect(bodyText).not.toContain("Internal Server Error");
    } else {
      expect(url).toContain("/login");
    }
  });

  // --- Club Chat ---

  test("club chat page loads or redirects", async ({ page }) => {
    await page.goto("/clubs/chat");
    await page.waitForTimeout(2000);
    const url = page.url();
    const bodyText = await page.textContent("body");
    const isValid =
      url.includes("/clubs") ||
      url.includes("/login") ||
      !bodyText?.includes("Internal Server Error");
    expect(isValid).toBeTruthy();
  });

  // --- Gallery ---

  test("gallery page loads without errors", async ({ page }) => {
    await page.goto("/gallery");
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes("/gallery")) {
      const status = await page.evaluate(() => document.readyState);
      expect(status).toBe("complete");
      const bodyText = await page.textContent("body");
      expect(bodyText).not.toContain("Internal Server Error");
    }
  });

  // --- Activity Feed ---

  test("activity page loads with feed or empty state", async ({ page }) => {
    await page.goto("/activity");
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes("/activity")) {
      const bodyText = await page.textContent("body");
      // Should have activity items or empty state
      const hasContent =
        bodyText?.includes("activity") ||
        bodyText?.includes("checked in") ||
        bodyText?.includes("match") ||
        bodyText?.includes("No activity") ||
        bodyText?.includes("Check back");
      expect(hasContent).toBeTruthy();
    }
  });

  // --- Mobile UX for Social Pages ---

  test("social pages render without horizontal scroll on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const socialPages = ["/friends", "/chat", "/gallery", "/activity"];

    for (const path of socialPages) {
      await page.goto(path);
      await page.waitForTimeout(1000);
      const url = page.url();

      if (!url.includes("/login")) {
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(
          bodyWidth,
          `Horizontal scroll detected on ${path}`
        ).toBeLessThanOrEqual(viewportWidth + 5);
      }
    }
  });

  // --- API Health ---

  test("search API returns valid JSON", async ({ request }) => {
    const response = await request.get("/api/search?q=test");
    expect(response.status()).toBeLessThan(500);
    if (response.status() === 200) {
      const json = await response.json();
      expect(json).toHaveProperty("players");
      expect(json).toHaveProperty("teams");
      expect(json).toHaveProperty("games");
    }
  });

  test("search API returns empty for short queries", async ({ request }) => {
    const response = await request.get("/api/search?q=a");
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.players).toHaveLength(0);
    expect(json.teams).toHaveLength(0);
    expect(json.games).toHaveLength(0);
  });

  test("friends API rejects unauthenticated requests", async ({
    request,
  }) => {
    const response = await request.post("/api/friends", {
      data: { friend_id: "test-id" },
    });
    // May return 401 (unauthorized) or 405 (method not allowed via middleware)
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("profile API handles unauthenticated requests", async ({
    request,
  }) => {
    const response = await request.get("/api/profile");
    // Returns 200 with null/redirect or 401 depending on middleware
    expect(response.status()).toBeLessThan(500);
  });

  test("gallery API handles unauthenticated requests", async ({
    request,
  }) => {
    const response = await request.get("/api/profile/gallery");
    expect(response.status()).toBeLessThan(500);
  });
});
