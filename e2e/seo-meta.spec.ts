import { test, expect } from "@playwright/test";

test.describe("SEO & Meta Tags", () => {
  const pages = [
    { path: "/", name: "Homepage" },
    { path: "/insurance", name: "Insurance" },
    { path: "/for-venues", name: "For Venues" },
    { path: "/for-players", name: "For Players" },
    { path: "/login", name: "Login" },
  ];

  for (const { path, name } of pages) {
    test(`${name} has proper meta tags`, async ({ page }) => {
      await page.goto(path);

      // Title exists
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // Viewport meta
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute("content", /width=device-width/);
    });

    test(`${name} has no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto(path);
      await page.waitForTimeout(2000);

      // Filter out known non-critical errors (e.g., service worker, analytics)
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes("service-worker") &&
          !e.includes("sw.js") &&
          !e.includes("analytics") &&
          !e.includes("favicon") &&
          !e.includes("manifest") &&
          !e.includes("redirect") &&
          !e.includes("script resource") &&
          !e.includes("workbox") &&
          !e.includes("serwist") &&
          !e.includes("push-sw")
      );

      expect(criticalErrors).toEqual([]);
    });
  }
});

test.describe("Performance Basics", () => {
  test("homepage loads within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(5000);
  });

  test("no broken images on homepage", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Wait for all images to finish loading (Next.js image optimization can be slow)
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.querySelectorAll("img")).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.addEventListener("load", () => resolve(), { once: true });
                img.addEventListener("error", () => resolve(), { once: true });
                // Safety timeout per image
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
          broken.push(img.src);
        }
      });
      return broken;
    });

    expect(brokenImages).toEqual([]);
  });
});
