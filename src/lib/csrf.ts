import { NextRequest, NextResponse } from "next/server";

/**
 * Paths exempt from CSRF validation — these receive requests from
 * external services (Stripe, Printify, Supabase, Vercel Cron) that
 * will never carry a same-origin Origin header.
 */
const CSRF_EXEMPT_PREFIXES = [
  "/api/webhooks/",
  "/api/stripe/webhook",
  "/api/cron/",
  "/api/shop/webhooks/",
];

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

/**
 * Validate that the request Origin (or Referer) matches one of the
 * allowed hosts.  Returns a 403 response when the check fails, or
 * `null` when the request is safe to proceed.
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  // Only check state-changing methods
  if (!STATE_CHANGING_METHODS.has(request.method)) return null;

  // Only check API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) return null;

  // Skip exempt paths (webhooks, cron jobs)
  const path = request.nextUrl.pathname;
  if (CSRF_EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return null;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Determine the source host from Origin or Referer
  const sourceOrigin = origin ?? (referer ? new URL(referer).origin : null);

  if (!sourceOrigin) {
    return NextResponse.json(
      { error: "Forbidden — missing Origin header" },
      { status: 403 },
    );
  }

  const allowed = getAllowedOrigins(request);

  if (!isOriginAllowed(sourceOrigin, allowed)) {
    return NextResponse.json(
      { error: "Forbidden — origin not allowed" },
      { status: 403 },
    );
  }

  return null;
}

/** Build the set of allowed origins from the request's own host + env. */
function getAllowedOrigins(request: NextRequest): Set<string> {
  const origins = new Set<string>();

  // The host the request was sent to is always allowed (covers Vercel
  // preview URLs, localhost, and production).
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("host");
  if (host) {
    origins.add(`${proto}://${host}`);
    // Also allow plain https if proto was http (dev)
    if (proto === "http") origins.add(`https://${host}`);
  }

  // Explicit production domains (both lawnbowl.app and lawnbowling.app are valid)
  origins.add("https://lawnbowl.app");
  origins.add("https://www.lawnbowl.app");
  origins.add("https://lawnbowling.app");
  origins.add("https://www.lawnbowling.app");

  // Additional allowed origins from env (comma-separated)
  const extra = process.env.CSRF_ALLOWED_ORIGINS;
  if (extra) {
    extra.split(",").forEach((o) => {
      const trimmed = o.trim();
      if (trimmed) origins.add(trimmed);
    });
  }

  return origins;
}

function isOriginAllowed(origin: string, allowed: Set<string>): boolean {
  if (allowed.has(origin)) return true;

  // Allow any *.vercel.app preview deployment
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith(".vercel.app")) return true;
  } catch {
    return false;
  }

  return false;
}
