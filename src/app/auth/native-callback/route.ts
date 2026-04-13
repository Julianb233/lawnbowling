import { NextRequest } from "next/server";

/**
 * Trampoline for Capacitor OAuth.
 *
 * SFSafariViewController is unreliable when a web page uses JavaScript to
 * jump to a custom URL scheme. A server-side 302 bridge is more reliable:
 * Supabase redirects here over HTTPS and this route immediately issues an
 * HTTP redirect to the app deep link.
 */
export function GET(request: NextRequest) {
  const params = new URLSearchParams(request.nextUrl.searchParams);

  if (!params.has("next")) {
    params.set("next", "/board");
  }

  const deepLink = `lawnbowl://auth/callback?${params.toString()}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: deepLink,
      "Cache-Control": "no-store",
    },
  });
}
