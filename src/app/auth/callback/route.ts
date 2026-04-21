import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { shouldBeAdmin } from "@/lib/auth/auto-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/board";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const email = data.user.email;
      const role = shouldBeAdmin(email) ? "admin" : "player";

      // Ensure player profile exists
      const { data: existingPlayer } = await supabase
        .from("players")
        .select("id, role, onboarding_completed")
        .eq("user_id", data.user.id)
        .single();

      if (!existingPlayer) {
        await supabase.from("players").upsert({
          user_id: data.user.id,
          display_name: data.user.user_metadata?.name || email?.split("@")[0] || "Player",
          role,
        }, { onConflict: "user_id" });
        // New player — send them to onboarding
        return NextResponse.redirect(`${origin}/onboarding/player`);
      } else if (!existingPlayer.onboarding_completed) {
        // Existing player who hasn't finished onboarding
        return NextResponse.redirect(`${origin}/onboarding/player`);
      } else if (role === "admin" && existingPlayer.role !== "admin") {
        // Promote existing player if their email is in ADMIN_EMAILS
        await supabase
          .from("players")
          .update({ role: "admin" })
          .eq("id", existingPlayer.id);
      }

      // Check if user has MFA enrolled and needs verification
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (
        aalData &&
        aalData.currentLevel === "aal1" &&
        aalData.nextLevel === "aal2"
      ) {
        return NextResponse.redirect(
          `${origin}/mfa-verify?returnTo=${encodeURIComponent(next)}`
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
