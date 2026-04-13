import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sbCookies = cookieHeader
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter((n) => n.startsWith("sb-"));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return NextResponse.json({
    user: data.user?.email ?? null,
    error: error?.message ?? null,
    sbCookiesInRequest: sbCookies,
  });
}
