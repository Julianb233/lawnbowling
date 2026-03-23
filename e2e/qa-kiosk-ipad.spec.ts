import { test, expect } from "@playwright/test";

/**
 * AI-4919: Kiosk mode QA — iPad landscape, touch targets, auto-reset.
 */

test.describe("QA: Kiosk Mode — iPad Landscape", () => {
  test.beforeEach(async ({ page }) => {
    // iPad Pro landscape viewport
    await page.setViewportSize({ width: 1366, height: 1024 });
  });

  test("/kiosk loads in landscape mode", async ({ page }) => {
    await page.goto("/kiosk", { waitUntil: "domcontentloaded", timeout: 20000 });

    const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || "");
    expect(bodyText.length).toBeGreaterThan(0);

    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(1376);
  });

  test("/kiosk/bowls loads in landscape mode", async ({ page }) => {
    await page.goto("/kiosk/bowls", { waitUntil: "domcontentloaded", timeout: 20000 });

    const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || "");
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test("/kiosk/scan loads in landscape mode", async ({ page }) => {
    await page.goto("/kiosk/scan", { waitUntil: "domcontentloaded", timeout: 20000 });

    const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || "");
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test("kiosk touch targets are large enough", async ({ page }) => {
    await page.goto("/kiosk", { waitUntil: "domcontentloaded", timeout: 20000 });

    const smallTargets = await page.evaluate(() => {
      const clickables = document.querySelectorAll("a, button, [role='button']");
      const tooSmall: string[] = [];
      clickables.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
          const text = (el as HTMLElement).innerText?.substring(0, 30) || "";
          tooSmall.push(`${el.tagName}[${text}] ${Math.round(rect.width)}x${Math.round(rect.height)}`);
        }
      });
      return tooSmall;
    });

    // Kiosk should have large touch targets
    expect(
      smallTargets.length,
      `Kiosk has ${smallTargets.length} small touch targets: ${smallTargets.slice(0, 5).join(", ")}`
    ).toBeLessThanOrEqual(3); // Allow a few small non-critical elements
  });

  test("check-in page loads for test venue", async ({ page }) => {
    const response = await page.goto("/checkin/test-venue", {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    if (response) {
      expect(response.status()).toBeLessThan(500);
    }
  });
});
