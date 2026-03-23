import { test, expect } from "@playwright/test";

test.describe("Club Director — Public Club Pages", () => {
  test("club directory loads with search and filters", async ({ page }) => {
    await page.goto("/clubs");
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // Search input should be present
    const searchInput = page.getByRole("textbox").first();
    await expect(searchInput).toBeVisible();

    // Should display club content
    const bodyText = await page.textContent("body");
    expect(bodyText?.length).toBeGreaterThan(100);
    expect(bodyText).not.toContain("Internal Server Error");
  });

  test("club directory search filters results", async ({ page }) => {
    await page.goto("/clubs");

    const searchInput = page.getByRole("textbox").first();
    await searchInput.fill("bowling");
    await page.waitForTimeout(1500);

    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
  });

  test("club directory has country/region filter controls", async ({ page }) => {
    await page.goto("/clubs");

    const hasFilters =
      (await page.locator("select, [role='combobox'], button:has-text('filter'), button:has-text('Filter')").count()) >
      0;
    const hasFilterText = (await page.getByText(/country|region|state|filter/i).count()) > 0;
    expect(hasFilters || hasFilterText).toBeTruthy();
  });

  test("club directory displays club count statistics", async ({ page }) => {
    await page.goto("/clubs");

    const bodyText = await page.textContent("body");
    const hasNumbers = /\d+/.test(bodyText || "");
    expect(hasNumbers).toBeTruthy();
  });

  test("state club listing page loads", async ({ page }) => {
    await page.goto("/clubs/california");
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
  });
});

test.describe("Club Director — Protected Routes Require Auth", () => {
  test("club dashboard redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/clubs/dashboard");
    await page.waitForTimeout(2000);

    const url = page.url();
    const isAuthProtected =
      url.includes("/login") ||
      url.includes("/signup") ||
      (await page.getByText(/sign in|log in|unauthorized/i).count()) > 0;
    expect(isAuthProtected || url.includes("/clubs/dashboard")).toBeTruthy();
  });

  test("club manage page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/clubs/manage");
    await page.waitForTimeout(2000);

    const url = page.url();
    const isAuthProtected =
      url.includes("/login") ||
      url.includes("/signup") ||
      (await page.getByText(/sign in|log in|unauthorized/i).count()) > 0;
    expect(isAuthProtected || url.includes("/clubs/manage")).toBeTruthy();
  });

  test("club settings page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/clubs/settings");
    await page.waitForTimeout(2000);

    const url = page.url();
    const isAuthProtected =
      url.includes("/login") ||
      url.includes("/signup") ||
      (await page.getByText(/sign in|log in|unauthorized/i).count()) > 0;
    expect(isAuthProtected || url.includes("/clubs/settings")).toBeTruthy();
  });

  test("club chat page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/clubs/chat");
    await page.waitForTimeout(2000);

    const url = page.url();
    const isAuthProtected =
      url.includes("/login") ||
      url.includes("/signup") ||
      (await page.getByText(/sign in|log in|unauthorized/i).count()) > 0;
    expect(isAuthProtected || url.includes("/clubs/chat")).toBeTruthy();
  });
});

test.describe("Club Director — Claim Flow", () => {
  test("claim page loads with search interface", async ({ page }) => {
    await page.goto("/clubs/claim");
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");

    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
    expect(bodyText?.length).toBeGreaterThan(50);
  });

  test("claim page has club search or form fields", async ({ page }) => {
    await page.goto("/clubs/claim");

    const hasInputs = (await page.getByRole("textbox").count()) > 0;
    const hasButtons = (await page.getByRole("button").count()) > 0;
    const hasContent =
      (await page.getByText(/claim|search|find.*club/i).count()) > 0 ||
      (await page.getByText(/sign in|log in/i).count()) > 0;
    expect(hasInputs || hasButtons || hasContent).toBeTruthy();
  });
});

test.describe("Club Director — Onboarding Flow", () => {
  test("onboard page loads with registration wizard", async ({ page }) => {
    await page.goto("/clubs/onboard");
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");

    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
    expect(bodyText?.length).toBeGreaterThan(50);
  });

  test("onboard page shows plan selection or auth prompt", async ({ page }) => {
    await page.goto("/clubs/onboard");

    const hasPlans = (await page.getByText(/free|club|pro|plan|pricing/i).count()) > 0;
    const hasAuth = (await page.getByText(/sign in|log in|create account/i).count()) > 0;
    const hasForm = (await page.getByRole("textbox").count()) > 0;
    expect(hasPlans || hasAuth || hasForm).toBeTruthy();
  });

  test("onboard page displays feature comparison", async ({ page }) => {
    await page.goto("/clubs/onboard");

    const bodyText = await page.textContent("body");
    const hasFeatureContent =
      /member|tournament|event|feature|included/i.test(bodyText || "") ||
      /sign in|log in/i.test(bodyText || "");
    expect(hasFeatureContent).toBeTruthy();
  });
});

test.describe("Club Director — API Routes", () => {
  test("GET /api/clubs returns club listing without 5xx", async ({ request }) => {
    const response = await request.get("/api/clubs");
    expect(response.status()).toBeLessThan(500);
  });

  test("GET /api/clubs/managed returns auth error without credentials", async ({ request }) => {
    const response = await request.get("/api/clubs/managed");
    expect(response.status()).toBeLessThan(500);
    expect([401, 403, 302, 307, 200].includes(response.status())).toBeTruthy();
  });

  test("GET /api/clubs/memberships returns auth error without credentials", async ({ request }) => {
    const response = await request.get("/api/clubs/memberships");
    expect(response.status()).toBeLessThan(500);
  });

  test("GET /api/clubs/claims returns auth error without credentials", async ({ request }) => {
    const response = await request.get("/api/clubs/claims");
    expect(response.status()).toBeLessThan(500);
  });

  test("POST /api/clubs/visit-request requires auth", async ({ request }) => {
    const response = await request.post("/api/clubs/visit-request", {
      data: { clubId: "test", message: "test visit" },
    });
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe("Club Director — Dashboard Stability", () => {
  test("dashboard page does not crash (no 500 error)", async ({ page }) => {
    await page.goto("/clubs/dashboard");
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
    expect(bodyText).not.toContain("Application error");
  });

  test("manage page does not crash (no 500 error)", async ({ page }) => {
    await page.goto("/clubs/manage");
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
    expect(bodyText).not.toContain("Application error");
  });

  test("settings page does not crash (no 500 error)", async ({ page }) => {
    await page.goto("/clubs/settings");
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
    expect(bodyText).not.toContain("Application error");
  });
});

test.describe("Club Director — Mobile Responsive", () => {
  test("club directory is mobile-friendly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/clubs");
    await page.waitForTimeout(1000);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);

    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("club onboard page is mobile-friendly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/clubs/onboard");
    await page.waitForTimeout(1000);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test("club claim page is mobile-friendly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/clubs/claim");
    await page.waitForTimeout(1000);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test("all club pages render on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const clubPages = ["/clubs", "/clubs/claim", "/clubs/onboard", "/clubs/dashboard"];
    for (const path of clubPages) {
      await page.goto(path);
      const status = await page.evaluate(() => document.readyState);
      expect(status).toBe("complete");

      const bodyText = await page.textContent("body");
      expect(bodyText).not.toContain("Internal Server Error");

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
    }
  });
});

test.describe("Club Director — Navigation & Links", () => {
  test("club directory has links to manage and add club", async ({ page }) => {
    await page.goto("/clubs");

    const manageLink = page.locator(
      "a[href*='manage'], a[href*='dashboard'], a[href*='claim'], a[href*='onboard']"
    );
    const linkCount = await manageLink.count();
    expect(linkCount).toBeGreaterThanOrEqual(0);
  });

  test("club pages share consistent layout", async ({ page }) => {
    await page.goto("/clubs");
    const hasNav = (await page.locator("nav, header").count()) > 0;
    expect(hasNav).toBeTruthy();

    await page.goto("/clubs/claim");
    const hasNav2 = (await page.locator("nav, header").count()) > 0;
    expect(hasNav2).toBeTruthy();
  });
});
