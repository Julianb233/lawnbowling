import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const MAX_JSON_BODY_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_UPLOAD_BODY_SIZE = 10 * 1024 * 1024; // 10MB

const FILE_UPLOAD_PATHS = ["/api/profile/avatar", "/api/profile/gallery"];

function isFileUploadRoute(pathname: string): boolean {
  return FILE_UPLOAD_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
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
          { status: 413 }
        );
      }
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|serwist/|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
