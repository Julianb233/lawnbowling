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

  const publicPaths = ["/login", "/signup", "/auth/callback", "/offline", "/insurance", "/terms", "/privacy", "/contact", "/about", "/faq", "/for-venues", "/learn"];

  // Root path: redirect logged-in users to /board, show landing for guests
  if (request.nextUrl.pathname === "/") {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/board";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && !isPublicPath) {
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
