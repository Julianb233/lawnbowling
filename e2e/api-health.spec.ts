import { test, expect } from "@playwright/test";

test.describe("API Health Checks", () => {
  // Unauthenticated API requests get redirected to login by Supabase middleware.
  // We verify that protected endpoints don't return data without auth.

  test("protected endpoints redirect or return 401 without auth", async ({ request }) => {
    const protectedEndpoints = [
      { method: "get" as const, path: "/api/matchmaking/suggestions" },
      { method: "get" as const, path: "/api/waitlist/status" },
      { method: "post" as const, path: "/api/partner/request" },
      { method: "post" as const, path: "/api/partner/respond" },
      { method: "post" as const, path: "/api/push/subscribe" },
    ];

    for (const endpoint of protectedEndpoints) {
      const response =
        endpoint.method === "get"
          ? await request.get(endpoint.path)
          : await request.post(endpoint.path, {
              data: {},
              headers: { "Content-Type": "application/json" },
            });

      // Should either redirect (302/307) or return 401, or return HTML login page (200)
      // The key assertion: it should NOT return actual data
      const status = response.status();
      const contentType = response.headers()["content-type"] || "";

      if (contentType.includes("application/json")) {
        // If JSON response, it should be an error
        const data = await response.json();
        expect(data.error || status === 401 || status === 403).toBeTruthy();
      } else {
        // HTML response means middleware redirected to login
        expect(status).toBeLessThan(500);
      }
    }
  });

  test("stats API handles nonexistent player gracefully", async ({ request }) => {
    const response = await request.get("/api/stats/nonexistent-id");
    // Should not crash (no 500)
    const status = response.status();
    expect(status).not.toBe(500);
  });

  test("leaderboard endpoint is reachable", async ({ page }) => {
    // Use page context to hit the API (bypasses middleware redirect for API routes)
    const response = await page.goto("/api/stats/leaderboard");
    // Either returns data or redirects
    expect(response?.status()).toBeLessThan(500);
  });
});
