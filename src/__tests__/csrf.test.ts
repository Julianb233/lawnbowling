import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { validateCsrf } from "@/lib/csrf";

function makeRequest(
  method: string,
  path: string,
  headers: Record<string, string> = {},
): NextRequest {
  const url = `https://lawnbowl.app${path}`;
  return new NextRequest(url, {
    method,
    headers: new Headers({ host: "lawnbowl.app", ...headers }),
  });
}

describe("CSRF Protection", () => {
  it("allows GET requests without Origin header", () => {
    const req = makeRequest("GET", "/api/favorites");
    expect(validateCsrf(req)).toBeNull();
  });

  it("allows same-origin POST requests", () => {
    const req = makeRequest("POST", "/api/favorites", {
      origin: "https://lawnbowl.app",
    });
    expect(validateCsrf(req)).toBeNull();
  });

  it("blocks POST requests with no Origin or Referer", () => {
    const req = makeRequest("POST", "/api/favorites");
    const res = validateCsrf(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("blocks cross-origin POST requests", () => {
    const req = makeRequest("POST", "/api/favorites", {
      origin: "https://evil.com",
    });
    const res = validateCsrf(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("allows requests with matching Referer when Origin is absent", () => {
    const req = makeRequest("POST", "/api/favorites", {
      referer: "https://lawnbowl.app/board",
    });
    expect(validateCsrf(req)).toBeNull();
  });

  it("blocks requests with cross-origin Referer", () => {
    const req = makeRequest("POST", "/api/favorites", {
      referer: "https://evil.com/attack",
    });
    const res = validateCsrf(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("allows Vercel preview deployment origins", () => {
    const req = makeRequest("POST", "/api/favorites", {
      origin: "https://lawnbowling-abc123.vercel.app",
    });
    expect(validateCsrf(req)).toBeNull();
  });

  it("skips CSRF for webhook routes", () => {
    const req = makeRequest("POST", "/api/webhooks/supabase");
    expect(validateCsrf(req)).toBeNull();
  });

  it("skips CSRF for Stripe webhook", () => {
    const req = makeRequest("POST", "/api/stripe/webhook");
    expect(validateCsrf(req)).toBeNull();
  });

  it("skips CSRF for cron routes", () => {
    const req = makeRequest("POST", "/api/cron/stats-refresh");
    expect(validateCsrf(req)).toBeNull();
  });

  it("skips CSRF for shop webhook routes", () => {
    const req = makeRequest("POST", "/api/shop/webhooks/printify");
    expect(validateCsrf(req)).toBeNull();
  });

  it("blocks DELETE requests from cross-origin", () => {
    const req = makeRequest("DELETE", "/api/favorites", {
      origin: "https://evil.com",
    });
    const res = validateCsrf(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("blocks PUT requests from cross-origin", () => {
    const req = makeRequest("PUT", "/api/profile", {
      origin: "https://evil.com",
    });
    const res = validateCsrf(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("blocks PATCH requests from cross-origin", () => {
    const req = makeRequest("PATCH", "/api/teams/123", {
      origin: "https://evil.com",
    });
    const res = validateCsrf(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("allows www.lawnbowl.app origin", () => {
    const req = makeRequest("POST", "/api/favorites", {
      origin: "https://www.lawnbowl.app",
    });
    expect(validateCsrf(req)).toBeNull();
  });

  it("ignores non-API routes", () => {
    const req = makeRequest("POST", "/login");
    expect(validateCsrf(req)).toBeNull();
  });
});
