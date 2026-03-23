import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { validateCsrf } from "@/lib/csrf";

export async function middleware(request: NextRequest) {
  // CSRF: reject cross-origin state-changing requests before anything else
  const csrfResponse = validateCsrf(request);
  if (csrfResponse) return csrfResponse;

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|serwist/|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
