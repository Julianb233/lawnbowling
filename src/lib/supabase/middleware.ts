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

  const publicPaths = [
    "/login", "/signup", "/auth/callback", "/onboarding", "/offline",
    "/insurance", "/terms", "/privacy", "/contact", "/about", "/faq",
    "/for-venues", "/for-players", "/learn",
    "/checkin", "/api/qr",
    // Public content pages — no login required for discovery & SEO
    "/clubs", "/shop", "/blog", "/bowls/about", "/bowls/history",
    "/leaderboard", "/tv", "/kiosk",
    "/sitemap.xml", "/robots.txt",
    // API routes for public pages
    "/api/clubs", "/api/shop/products", "/api/stats/leaderboard",
  ];

  // Root path is public (landing page)
  if (request.nextUrl.pathname === "/") {
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
