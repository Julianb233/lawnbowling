import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure player profile exists
      const { data: existingPlayer } = await supabase
        .from("players")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingPlayer) {
        await supabase.from("players").insert({
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Player",
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
