import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Routes that REQUIRE authentication — only these redirect to login
  const protectedPaths = [
    "/board", "/admin", "/settings", "/favorites",
    "/friends", "/chat", "/activity", "/queue",
    "/schedule", "/teams", "/stats", "/match-history",
  ];

  // Root path is public (landing page)
  if (request.nextUrl.pathname === "/") {
    return supabaseResponse;
  }

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    const returnTo = request.nextUrl.pathname;
    url.pathname = "/login";
    if (returnTo && returnTo !== "/login") {
      url.searchParams.set("returnTo", returnTo);
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
