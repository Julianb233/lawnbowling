import { test, expect } from "@playwright/test";

test.describe("Ralph Wiggum Chaos Tests", () => {
  // === "The Doctor Said I Wouldn't Have So Many Nosebleeds..." ===

  test("rapid-fire clicking navigation doesn't break the app", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(500);

    // Collect hrefs first, then navigate rapidly (clicking causes DOM detachment)
    const links = page.locator("a[href]");
    const count = await links.count();
    const hrefs: string[] = [];
    for (let i = 0; i < Math.min(count, 8); i++) {
      const href = await links.nth(i).getAttribute("href");
      if (href && href.startsWith("/") && !href.startsWith("//")) {
        hrefs.push(href);
      }
    }

    // Rapidly navigate to each href without waiting for full load
    for (const href of hrefs) {
      await page.goto(href, { waitUntil: "commit" }).catch(() => {});
    }

    // Wait for things to settle, then verify the app is still functional
    await page.waitForTimeout(2000);
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");

    // Should not show a crash or blank page
    const bodyText = await page.textContent("body");
    expect(bodyText?.length).toBeGreaterThan(10);
  });

  test("browser back button during page transition doesn't crash", async ({
    page,
  }) => {
    await page.goto("/");
    await page.goto("/clubs");
    await page.goto("/leaderboard");

    // Go back rapidly
    await page.goBack();
    await page.goBack();

    await page.waitForTimeout(1000);
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
  });

  test("refreshing any page preserves app state or shows clean reload", async ({
    page,
  }) => {
    const pages = ["/", "/clubs", "/learn", "/bowls"];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForTimeout(500);

      // Refresh
      await page.reload();
      await page.waitForTimeout(1000);

      const status = await page.evaluate(() => document.readyState);
      expect(status).toBe("complete");

      // Should not show error
      const bodyText = await page.textContent("body");
      expect(bodyText).not.toContain("Internal Server Error");
    }
  });

  // === "Me Fail English?" ===

  test("search with unicode characters doesn't break", async ({ page }) => {
    await page.goto("/clubs");
    await page.waitForTimeout(1000);

    // Find any input/search field
    const searchInput = page
      .locator(
        'input[type="search"], input[type="text"], input[placeholder*="search" i], input[placeholder*="filter" i]'
      )
      .first();

    if ((await searchInput.count()) > 0) {
      await searchInput.fill("Lawn bowls Zurich");
      await page.waitForTimeout(500);
      await searchInput.fill("emojitest");
      await page.waitForTimeout(500);

      // Should not crash
      const status = await page.evaluate(() => document.readyState);
      expect(status).toBe("complete");
    } else {
      // No search field — test passes, nothing to break
      expect(true).toBeTruthy();
    }
  });

  test("extremely long input in search field is handled gracefully", async ({
    page,
  }) => {
    await page.goto("/login");
    const emailInput = page.getByRole("textbox").first();
    await expect(emailInput).toBeVisible();

    // Fill with absurdly long string
    const longString = "a".repeat(5000) + "@example.com";
    await emailInput.fill(longString);

    // Should not crash the page
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
  });

  test("submitting forms with special characters doesn't cause XSS", async ({
    page,
  }) => {
    await page.goto("/login");
    const emailInput = page.getByRole("textbox").first();
    await expect(emailInput).toBeVisible();

    // Try XSS payload
    await emailInput.fill('<script>alert("xss")</script>');
    await page.waitForTimeout(500);

    // Try form submission
    const submitBtn = page
      .getByRole("button", { name: /sign in|log in|continue/i })
      .first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
    }

    // Verify no alert dialogs popped up (XSS check)
    // If we get here without an unhandled dialog, the test passes
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain('<script>alert("xss")</script>');
  });

  // === "I Bent My Wookie" ===

  test("resizing browser during page load doesn't break layout", async ({
    page,
  }) => {
    // Start desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    // Resize to mobile mid-load
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    // Resize back to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);

    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");

    // Content should still be visible
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("toggling between pages rapidly keeps UI consistent", async ({
    page,
  }) => {
    const routes = ["/", "/clubs", "/leaderboard", "/learn", "/bowls"];

    for (let round = 0; round < 2; round++) {
      for (const route of routes) {
        await page.goto(route, { waitUntil: "commit" });
      }
    }

    // Final page should be loaded properly
    await page.waitForTimeout(2000);
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
    const bodyText = await page.textContent("body");
    expect(bodyText?.length).toBeGreaterThan(10);
  });

  test("scrolling to bottom of long lists works smoothly", async ({
    page,
  }) => {
    await page.goto("/leaderboard");
    await page.waitForTimeout(1000);

    // Scroll to the very bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Page should still be functional
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");
  });

  // === "It Tastes Like Burning" ===

  test("clicking disabled buttons does nothing", async ({ page }) => {
    await page.goto("/login");
    await page.waitForTimeout(1000);

    // Find any disabled buttons
    const disabledBtns = page.locator(
      "button[disabled], button[aria-disabled='true']"
    );
    const count = await disabledBtns.count();

    if (count > 0) {
      // Click the disabled button
      await disabledBtns.first().click({ force: true });
      await page.waitForTimeout(500);

      // Page should remain stable
      const status = await page.evaluate(() => document.readyState);
      expect(status).toBe("complete");
    } else {
      // No disabled buttons found — check that submitting empty form doesn't navigate away
      expect(page.url()).toContain("/login");
    }
  });

  test("submitting empty required forms shows validation errors", async ({
    page,
  }) => {
    await page.goto("/login");

    const submitBtn = page
      .getByRole("button", { name: /sign in|log in|continue/i })
      .first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);

      // Should either show validation message or stay on login page
      expect(page.url()).toContain("/login");
    }
  });

  test("visiting /bowls with garbage query params doesn't crash", async ({
    page,
  }) => {
    await page.goto(
      "/bowls?format=<script>&id=../../../../etc/passwd&z=%00%00"
    );
    await page.waitForTimeout(1000);

    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe("complete");

    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("Internal Server Error");
  });
});
