import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { shouldBeAdmin } from "@/lib/auth/auto-admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const email = data.user.email;
      const role = shouldBeAdmin(email) ? "admin" : "player";

      // Ensure player profile exists
      const { data: existingPlayer } = await supabase
        .from("players")
        .select("id, role")
        .eq("user_id", data.user.id)
        .single();

      if (!existingPlayer) {
        await supabase.from("players").insert({
          user_id: data.user.id,
          display_name: data.user.user_metadata?.name || email?.split("@")[0] || "Player",
          role,
        });
      } else if (role === "admin" && existingPlayer.role !== "admin") {
        // Promote existing player if their email is in ADMIN_EMAILS
        await supabase
          .from("players")
          .update({ role: "admin" })
          .eq("id", existingPlayer.id);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
