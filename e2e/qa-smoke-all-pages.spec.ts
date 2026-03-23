import { test, expect, Page } from "@playwright/test";

/**
 * AI-4919: Full QA smoke test — visits every route and checks for
 * critical failures (500 errors, blank screens after hydration).
 */

const PUBLIC_PAGES = [
  "/", "/about", "/barefoot-bowls", "/blog", "/contact",
  "/connection-styles", "/discover", "/events", "/faq",
  "/for-players", "/for-venues", "/gallery", "/insurance",
  "/insurance/lawn-bowls", "/lawn-bowls-app", "/lawn-bowls-rules",
  "/pricing", "/privacy", "/sponsors", "/terms", "/tv",
];

const AUTH_PAGES = [
  "/login", "/sign-in", "/sign-up", "/signup", "/forgot-password",
];

const LEARN_PAGES = [
  "/learn", "/learn/equipment", "/learn/formats", "/learn/glossary",
  "/learn/lawn-bowling-vs-bocce", "/learn/positions", "/learn/rules",
];

const CLUB_PAGES = ["/clubs", "/clubs/claim", "/clubs/onboard"];

const SHOP_PAGES = ["/shop", "/shop/equipment", "/shop/custom-merch", "/shop/checkout"];

const GAME_PAGES = [
  "/bowls", "/bowls/about", "/bowls/stats",
  "/tournament", "/pennant",
];

const KIOSK_PAGES = ["/kiosk", "/kiosk/bowls", "/kiosk/scan"];

const PROTECTED_PAGES = [
  "/activity", "/board", "/chat", "/favorites", "/friends",
  "/leaderboard", "/match-history", "/onboarding", "/onboarding/player",
  "/planner", "/preferences", "/profile", "/profile/setup",
  "/queue", "/schedule", "/settings", "/settings/notifications",
  "/stats", "/teams",
  "/clubs/chat", "/clubs/dashboard", "/clubs/manage", "/clubs/settings",
  "/sponsors/portal", "/sponsors/portal/analytics",
  "/sponsors/portal/earnings", "/sponsors/portal/listings",
  "/sponsors/portal/settings", "/sponsors/signup",
];

const ADMIN_PAGES = [
  "/admin", "/admin/analytics", "/admin/branding", "/admin/claims",
  "/admin/courts", "/admin/insurance", "/admin/kiosk-settings",
  "/admin/matches", "/admin/monitoring", "/admin/players",
  "/admin/reports", "/admin/venue", "/admin/venue-qr", "/admin/venues",
  "/admin/waivers", "/admin/waiver-templates", "/pennant/admin",
];

const DYNAMIC_PAGES = [
  "/blog/test-post", "/bowls/test-id", "/bowls/test-id/draw-sheet",
  "/bowls/test-id/live", "/bowls/test-id/members", "/bowls/test-id/results",
  "/bowls/test-id/scores", "/bowls/assign", "/bowls/history",
  "/checkin/test-venue", "/clubs/nsw", "/clubs/nsw/test-club",
  "/clubs/nsw/test-club/admin", "/kiosk/bowls/test-id", "/learn/lawn-bowls",
  "/match/test-id", "/pennant/test-season", "/pennant/test-season/test-division",
  "/pennant/test-season/fixtures/test-fixture", "/profile/test-id",
  "/schedule/test-id", "/shop/test-product", "/teams/test-id",
  "/teams/join/test-code", "/tournament/test-id", "/tournament/test-id/live",
];

/** Wait for page to load and hydrate, check for 500s */
async function smokeCheck(page: Page, path: string) {
  const serverErrors: string[] = [];

  page.on("response", (resp) => {
    // Only flag 500s on the page navigation itself
    if (resp.status() >= 500 && resp.url().includes(path.split("?")[0])) {
      serverErrors.push(`${resp.status()} ${resp.url()}`);
    }
  });

  const response = await page.goto(path, {
    waitUntil: "load",
    timeout: 25000,
  });

  // Wait for client-side hydration
  await page.waitForTimeout(2000);

  // Must not be a server error on the page response
  if (response) {
    expect(response.status(), `${path} returned ${response.status()}`).toBeLessThan(500);
  }

  // Check body has content after hydration
  const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || "");

  return { bodyText, serverErrors, status: response?.status() };
}

// ─── PUBLIC PAGES ───────────────────────────────────────────────

test.describe("QA: Public Pages @smoke", () => {
  for (const path of PUBLIC_PAGES) {
    test(`${path} loads`, async ({ page }) => {
      const { bodyText, serverErrors } = await smokeCheck(page, path);
      expect(serverErrors, `${path} server errors`).toEqual([]);
      expect(bodyText.length, `${path} blank screen`).toBeGreaterThan(0);
    });
  }
});

// ─── AUTH PAGES ─────────────────────────────────────────────────

test.describe("QA: Auth Pages @smoke", () => {
  for (const path of AUTH_PAGES) {
    test(`${path} loads`, async ({ page }) => {
      const { bodyText, serverErrors } = await smokeCheck(page, path);
      expect(serverErrors, `${path} server errors`).toEqual([]);
      // Auth pages might redirect — check final URL has content
      const finalText = await page.evaluate(() => document.body?.innerText?.trim() || "");
      expect(finalText.length, `${path} (final) blank screen`).toBeGreaterThan(0);
    });
  }
});

// ─── LEARN PAGES ────────────────────────────────────────────────

test.describe("QA: Learn Pages @smoke", () => {
  for (const path of LEARN_PAGES) {
    test(`${path} loads`, async ({ page }) => {
      const { bodyText, serverErrors } = await smokeCheck(page, path);
      expect(serverErrors, `${path} server errors`).toEqual([]);
      expect(bodyText.length, `${path} blank screen`).toBeGreaterThan(0);
    });
  }
});

// ─── CLUB PAGES ─────────────────────────────────────────────────

test.describe("QA: Club Pages @smoke", () => {
  for (const path of CLUB_PAGES) {
    test(`${path} loads`, async ({ page }) => {
      const { bodyText, serverErrors } = await smokeCheck(page, path);
      expect(serverErrors, `${path} server errors`).toEqual([]);
    });
  }
});

// ─── SHOP PAGES ─────────────────────────────────────────────────

test.describe("QA: Shop Pages @smoke", () => {
  for (const path of SHOP_PAGES) {
    test(`${path} loads`, async ({ page }) => {
      const { bodyText, serverErrors } = await smokeCheck(page, path);
      expect(serverErrors, `${path} server errors`).toEqual([]);
      expect(bodyText.length, `${path} blank screen`).toBeGreaterThan(0);
    });
  }
});

// ─── GAME PAGES ─────────────────────────────────────────────────

test.describe("QA: Game Pages @smoke", () => {
  for (const path of GAME_PAGES) {
    test(`${path} loads`, async ({ page }) => {
      const { bodyText, serverErrors } = await smokeCheck(page, path);
      expect(serverErrors, `${path} server errors`).toEqual([]);
    });
  }
});

// ─── KIOSK PAGES ────────────────────────────────────────────────

test.describe("QA: Kiosk Pages @smoke", () => {
  for (const path of KIOSK_PAGES) {
    test(`${path} loads`, async ({ page }) => {
      const { bodyText, serverErrors } = await smokeCheck(page, path);
      expect(serverErrors, `${path} server errors`).toEqual([]);
    });
  }
});

// ─── PROTECTED PAGES ────────────────────────────────────────────

test.describe("QA: Protected Pages @smoke", () => {
  for (const path of PROTECTED_PAGES) {
    test(`${path} handles unauth`, async ({ page }) => {
      const serverErrors: string[] = [];
      page.on("response", (resp) => {
        if (resp.status() >= 500) {
          serverErrors.push(`${resp.status()} ${resp.url()}`);
        }
      });

      const response = await page.goto(path, {
        waitUntil: "load",
        timeout: 25000,
      });

      // Wait for client-side redirect to complete
      await page.waitForTimeout(3000);

      if (response) {
        expect(response.status(), `${path} returned ${response.status()}`).toBeLessThan(500);
      }

      // After redirect, final page should have content
      const finalUrl = page.url();
      const finalText = await page.evaluate(() => document.body?.innerText?.trim() || "");
      expect(finalText.length, `${path} → ${finalUrl} blank screen after redirect`).toBeGreaterThan(0);
      expect(serverErrors, `${path} server errors`).toEqual([]);
    });
  }
});

// ─── ADMIN PAGES ────────────────────────────────────────────────

test.describe("QA: Admin Pages @smoke", () => {
  for (const path of ADMIN_PAGES) {
    test(`${path} handles unauth`, async ({ page }) => {
      const serverErrors: string[] = [];
      page.on("response", (resp) => {
        if (resp.status() >= 500) {
          serverErrors.push(`${resp.status()} ${resp.url()}`);
        }
      });

      const response = await page.goto(path, {
        waitUntil: "load",
        timeout: 25000,
      });

      await page.waitForTimeout(3000);

      if (response) {
        expect(response.status(), `${path} returned ${response.status()}`).toBeLessThan(500);
      }

      const finalUrl = page.url();
      const finalText = await page.evaluate(() => document.body?.innerText?.trim() || "");
      expect(finalText.length, `${path} → ${finalUrl} blank screen after redirect`).toBeGreaterThan(0);
      expect(serverErrors, `${path} server errors`).toEqual([]);
    });
  }
});

// ─── DYNAMIC ROUTES ─────────────────────────────────────────────

test.describe("QA: Dynamic Routes @smoke", () => {
  for (const path of DYNAMIC_PAGES) {
    test(`${path} no crash`, async ({ page }) => {
      const serverErrors: string[] = [];
      page.on("response", (resp) => {
        if (resp.status() >= 500) {
          serverErrors.push(`${resp.status()} ${resp.url()}`);
        }
      });

      const response = await page.goto(path, {
        waitUntil: "load",
        timeout: 25000,
      });

      await page.waitForTimeout(2000);

      if (response) {
        expect(response.status(), `${path} returned ${response.status()}`).toBeLessThan(500);
      }

      expect(serverErrors, `${path} server errors`).toEqual([]);
    });
  }
});
