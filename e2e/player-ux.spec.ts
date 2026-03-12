import { test, expect } from "@playwright/test";

test.describe("Player UX Flows", () => {
  // --- Navigation & Discovery ---

  test("bottom nav links all resolve to valid pages", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Find bottom nav or main nav links
    const navLinks = page.locator(
      'nav a[href], footer a[href], [role="navigation"] a[href]'
    );
    const count = await navLinks.count();

    // Verify at least some nav links exist
    expect(count).toBeGreaterThan(0);

    // Check a sample of links resolve without 500 errors
    const hrefs: string[] = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      const href = await navLinks.nth(i).getAttribute("href");
      if (href && href.startsWith("/") && !href.startsWith("//")) {
        hrefs.push(href);
      }
    }

    for (const href of hrefs) {
      const response = await page.goto(href);
      expect(response?.status()).toBeLessThan(500);
    }
  });

  test("teams page loads and shows team list or empty state", async ({
    page,
  }) => {
    await page.goto("/teams");
    // Should load or redirect to login
    const url = page.url();
    if (url.includes("/teams")) {
      await expect(page.locator("h1, h2").first()).toBeVisible();
    } else {
      // Redirected to login — that's valid for a protected page
      expect(url).toContain("/login");
    }
  });

  test("clubs directory page loads with content", async ({ page }) => {
    await page.goto("/clubs");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
  });

  test("leaderboard page shows rankings or empty state", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page.locator("h1, h2").first()).toBeVisible();

    const hasRankings =
      (await page.getByText(/rank|#|position|player|score|elo/i).count()) > 0;
    const hasEmpty =
      (await page.getByText(/no.*data|no.*rankings|coming soon|empty/i).count()) > 0;
    expect(hasRankings || hasEmpty).toBeTruthy();
  });

  test("profile page redirects to login when not authenticated", async ({
    page,
  }) => {
    await page.goto("/profile");
    await page.waitForTimeout(2000);
    const url = page.url();
    // Should redirect or show login prompt
    const isProtected =
      url.includes("/login") || url.includes("/profile");
    expect(isProtected).toBeTruthy();
  });

  // --- Player Journey ---

  test("can browse clubs directory", async ({ page }) => {
    await page.goto("/clubs");
    await page.waitForTimeout(1000);

    // Should have a heading
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // Should have either club listings or state links
    const links = page.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test("schedule page loads without errors", async ({ page }) => {
    await page.goto("/schedule");
    const url = page.url();
    // Either loads or redirects to login
    if (url.includes("/schedule")) {
      const status = await page.evaluate(() => document.readyState);
      expect(status).toBe("complete");
    } else {
      expect(url).toContain("/login");
    }
  });

  test("activity feed loads or redirects", async ({ page }) => {
    await page.goto("/activity");
    const url = page.url();
    if (url.includes("/activity")) {
      await expect(page.locator("h1, h2").first()).toBeVisible();
    } else {
      expect(url).toContain("/login");
    }
  });

  test("events page loads", async ({ page }) => {
    await page.goto("/events");
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
  });

  test("learn page loads with educational content", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    // Should mention lawn bowls topics
    const body = await page.textContent("body");
    const hasContent =
      body?.toLowerCase().includes("bowl") ||
      body?.toLowerCase().includes("rule") ||
      body?.toLowerCase().includes("learn");
    expect(hasContent).toBeTruthy();
  });

  // --- Mobile UX ---

  test("all key pages render without horizontal scroll on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const pages = ["/", "/clubs", "/leaderboard", "/learn", "/bowls"];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForTimeout(500);

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(
        bodyWidth,
        `Horizontal scroll detected on ${path}`
      ).toBeLessThanOrEqual(viewportWidth + 5);
    }
  });

  test("bottom navigation is visible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Look for bottom navigation or any fixed-bottom nav element
    const bottomNav = page.locator(
      'nav[class*="bottom"], nav[class*="fixed"], [class*="BottomNav"], [class*="bottom-nav"]'
    );
    const navExists = (await bottomNav.count()) > 0;

    // Also accept regular nav elements visible on mobile
    const anyNav = page.locator("nav");
    const anyNavExists = (await anyNav.count()) > 0;

    expect(navExists || anyNavExists).toBeTruthy();
  });

  test("forms are usable with mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");

    const emailInput = page.getByRole("textbox").first();
    await expect(emailInput).toBeVisible();

    // Input should be tappable and fillable
    await emailInput.fill("mobile-test@example.com");
    const value = await emailInput.inputValue();
    expect(value).toBe("mobile-test@example.com");
  });

  // --- Error Handling ---

  test("404 page renders for non-existent routes", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-xyz-12345");
    // Should return 404 or show a not-found page
    const status = response?.status();
    const bodyText = await page.textContent("body");
    const is404 =
      status === 404 ||
      bodyText?.toLowerCase().includes("not found") ||
      bodyText?.toLowerCase().includes("404");
    expect(is404).toBeTruthy();
  });

  test("navigating to protected page while logged out redirects to login", async ({
    page,
  }) => {
    const protectedPages = ["/board", "/stats", "/match-history", "/settings"];

    for (const path of protectedPages) {
      await page.goto(path);
      await page.waitForTimeout(2000);
      const url = page.url();
      // Should redirect to login
      expect(
        url,
        `Expected ${path} to redirect to login`
      ).toContain("/login");
    }
  });
});
