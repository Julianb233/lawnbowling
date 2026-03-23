import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { validateCsrf } from "@/lib/csrf";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Rate limit tiers (requests per minute)
const RATE_LIMITS = {
  auth: 5,       // Auth endpoints: prevent brute force
  mutation: 30,  // POST/PUT/DELETE/PATCH: prevent spam
  read: 100,     // GET endpoints: generous but bounded
} as const;

function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/api/auth/");
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

function isCronRoute(pathname: string): boolean {
  return pathname.startsWith("/api/cron/");
}

function isWebhookRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/membership/webhook") ||
    pathname.startsWith("/api/shop/webhooks/")
  );
}

function rateLimitHeaders(limit: number, remaining: number, resetAt: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };
}

const MAX_JSON_BODY_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_UPLOAD_BODY_SIZE = 10 * 1024 * 1024; // 10MB

const FILE_UPLOAD_PATHS = ["/api/profile/avatar", "/api/profile/gallery"];

function isFileUploadRoute(pathname: string): boolean {
  return FILE_UPLOAD_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  // CSRF: reject cross-origin state-changing requests before anything else
  const csrfResponse = validateCsrf(request);
  if (csrfResponse) return csrfResponse;

  // Body size limits: reject oversized payloads early to prevent DoS
  if (
    request.nextUrl.pathname.startsWith("/api/") &&
    ["POST", "PUT", "PATCH"].includes(request.method)
  ) {
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      const limit = isFileUploadRoute(request.nextUrl.pathname)
        ? MAX_UPLOAD_BODY_SIZE
        : MAX_JSON_BODY_SIZE;

      if (size > limit) {
        return NextResponse.json(
          { error: "Payload Too Large" },
          { status: 413 },
        );
      }
    }
  }

  const pathname = request.nextUrl.pathname;

  // Rate limit API routes (skip cron jobs and webhooks — they have their own auth)
  if (isApiRoute(pathname) && !isCronRoute(pathname) && !isWebhookRoute(pathname)) {
    const ip = getClientIp(request);
    const method = request.method;

    let tier: keyof typeof RATE_LIMITS;
    let key: string;

    if (isAuthRoute(pathname)) {
      tier = "auth";
      key = `auth:${ip}`;
    } else if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
      tier = "mutation";
      key = `mutation:${ip}`;
    } else {
      tier = "read";
      key = `read:${ip}`;
    }

    const result = rateLimit(key, RATE_LIMITS[tier]);

    if (!result.success) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, retryAfter)),
            ...rateLimitHeaders(result.limit, result.remaining, result.resetAt),
          },
        }
      );
    }

    // Continue with auth/session handling, but add rate limit headers to response
    const response = await updateSession(request);
    const headers = rateLimitHeaders(result.limit, result.remaining, result.resetAt);
    for (const [k, v] of Object.entries(headers)) {
      response.headers.set(k, v);
    }
    return response;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|serwist/|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
