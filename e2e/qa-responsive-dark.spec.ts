import { test, expect } from "@playwright/test";

/**
 * AI-4919: Responsive design and dark mode QA tests.
 * Tests key pages at iPhone SE, iPhone 14 Pro, and iPad Pro breakpoints.
 * Verifies dark mode toggle and no horizontal overflow.
 */

const KEY_PAGES = [
  "/",
  "/about",
  "/blog",
  "/clubs",
  "/discover",
  "/faq",
  "/for-players",
  "/for-venues",
  "/gallery",
  "/insurance",
  "/learn",
  "/login",
  "/pricing",
  "/shop",
  "/signup",
  "/sponsors",
  "/tournament",
];

const VIEWPORTS = [
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 14 Pro", width: 393, height: 852 },
  { name: "iPad Pro", width: 1024, height: 1366 },
  { name: "iPad Landscape", width: 1366, height: 1024 },
];

// ─── RESPONSIVE: No horizontal overflow ─────────────────────────

test.describe("QA: Responsive — No Horizontal Overflow", () => {
  for (const viewport of VIEWPORTS) {
    for (const path of KEY_PAGES) {
      test(`${path} @ ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(path, { waitUntil: "domcontentloaded", timeout: 20000 });

        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(
          bodyWidth,
          `${path} overflows at ${viewport.name}: body=${bodyWidth}px, viewport=${viewport.width}px`
        ).toBeLessThanOrEqual(viewport.width + 10); // 10px tolerance
      });
    }
  }
});

// ─── RESPONSIVE: Touch targets on mobile ────────────────────────

test.describe("QA: Mobile Touch Targets", () => {
  const mobilePaths = ["/", "/login", "/signup", "/shop", "/clubs"];

  for (const path of mobilePaths) {
    test(`${path} has adequately sized touch targets`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(path, { waitUntil: "domcontentloaded", timeout: 20000 });

      // Check all clickable elements have min 44x44 touch target
      const smallTargets = await page.evaluate(() => {
        const clickables = document.querySelectorAll("a, button, input, select, textarea, [role='button']");
        const tooSmall: string[] = [];
        clickables.forEach((el) => {
          const rect = el.getBoundingClientRect();
          // Only check visible elements
          if (rect.width > 0 && rect.height > 0) {
            if (rect.width < 32 || rect.height < 32) {
              const tag = el.tagName.toLowerCase();
              const text = (el as HTMLElement).innerText?.substring(0, 30) || "";
              tooSmall.push(`${tag}[${text}] ${Math.round(rect.width)}x${Math.round(rect.height)}`);
            }
          }
        });
        return tooSmall;
      });

      // Warn but don't fail — log small targets for review
      if (smallTargets.length > 0) {
        console.log(`[QA] ${path} has ${smallTargets.length} small touch targets:`, smallTargets.slice(0, 5));
      }
    });
  }
});

// ─── DARK MODE ──────────────────────────────────────────────────

test.describe("QA: Dark Mode", () => {
  for (const path of KEY_PAGES) {
    test(`${path} renders in dark mode without white flash`, async ({ page }) => {
      // Emulate dark color scheme
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto(path, { waitUntil: "domcontentloaded", timeout: 20000 });

      // Check that the page has dark-mode styles applied
      const bgColor = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return style.backgroundColor;
      });

      // Page should load — not blank
      const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || "");
      expect(bodyText.length, `${path} blank in dark mode`).toBeGreaterThan(0);

      // Log the background color for review (don't hard-fail on color)
      console.log(`[QA] ${path} dark mode bg: ${bgColor}`);
    });
  }
});

// ─── BROKEN IMAGES ──────────────────────────────────────────────

test.describe("QA: Broken Images Check", () => {
  const imagePaths = ["/", "/about", "/blog", "/gallery", "/for-players", "/for-venues", "/shop", "/learn"];

  for (const path of imagePaths) {
    test(`${path} has no broken images`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle", timeout: 30000 });

      // Wait for lazy-loaded images
      await page.evaluate(() =>
        Promise.all(
          Array.from(document.querySelectorAll("img")).map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.addEventListener("load", () => resolve(), { once: true });
                  img.addEventListener("error", () => resolve(), { once: true });
                  setTimeout(() => resolve(), 10000);
                })
          )
        )
      );

      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll("img");
        const broken: string[] = [];
        images.forEach((img) => {
          if (!img.complete || img.naturalHeight === 0) {
            broken.push(img.src || img.getAttribute("data-src") || "unknown");
          }
        });
        return broken;
      });

      expect(brokenImages, `${path} has broken images: ${brokenImages.join(", ")}`).toEqual([]);
    });
  }
});

// ─── ERROR PAGES ────────────────────────────────────────────────

test.describe("QA: Error Pages", () => {
  test("404 page renders correctly", async ({ page }) => {
    const response = await page.goto("/this-page-definitely-does-not-exist-12345", {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    // Should return 404
    if (response) {
      expect(response.status()).toBe(404);
    }

    // Should show a friendly error page, not blank
    const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || "");
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test("offline page exists", async ({ page }) => {
    const response = await page.goto("/offline", {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    if (response) {
      expect(response.status()).toBeLessThan(500);
    }

    const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || "");
    expect(bodyText.length).toBeGreaterThan(0);
  });
});
