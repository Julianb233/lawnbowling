/**
 * In-memory sliding window rate limiter for Next.js middleware (Edge Runtime compatible).
 *
 * Limits are per-IP within a single serverless instance. On Vercel, each instance
 * maintains its own window — this provides baseline protection against abuse.
 * For distributed rate limiting, swap this for @upstash/ratelimit.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean expired entries to prevent memory leaks
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given identifier.
 * @param identifier - Unique key (typically IP + route prefix)
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 60_000
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count++;

  if (entry.count > limit) {
    return { success: false, limit, remaining: 0, resetAt: entry.resetAt };
  }

  return { success: true, limit, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Get the client IP from a Next.js request (works on Vercel and local dev).
 */
export function getClientIp(request: Request): string {
  // Vercel provides x-forwarded-for; use the first IP (client)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  // Fallback for local dev
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}
