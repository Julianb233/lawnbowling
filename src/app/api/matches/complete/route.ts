import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import { completeMatch } from "@/lib/db/courts";
import { apiError } from "@/lib/api-error-handler";
import { sendEmail } from "@/lib/email/send";
import { matchResultEmail } from "@/lib/email/templates/match-result";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { matchId } = await request.json();
    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 }
      );
    }

    const match = await completeMatch(matchId);

    // Notify all match participants (fire-and-forget)
    notifyMatchParticipants(supabase, matchId, match).catch(console.error);

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Complete match error:", error);
    return apiError(error, "POST /api/matches/complete", 500);
  }
}

async function notifyMatchParticipants(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  matchId: string,
  match: { sport?: string | null; ended_at?: string | null; court_id?: string | null } | null,
) {
  if (!match) return;

  // Get venue name via court
  let venueName: string | null = null;
  if (match.court_id) {
    const { data: court } = await supabase
      .from("courts")
      .select("venue:venues(name)")
      .eq("id", match.court_id)
      .single();
    const venue = (court as { venue?: { name?: string } } | null)?.venue;
    venueName = venue?.name ?? null;
  }

  // Get all player IDs in this match
  const { data: matchPlayers } = await supabase
    .from("match_players")
    .select("player_id")
    .eq("match_id", matchId);

  if (!matchPlayers?.length) return;

  const sport = match.sport ?? "lawn bowls";
  const completedAt = match.ended_at ?? new Date().toISOString();
  const { subject, html } = matchResultEmail("there", sport, venueName, completedAt);

  for (const mp of matchPlayers) {
    const { data: player } = await supabase
      .from("players")
      .select("user_id, display_name")
      .eq("id", mp.player_id)
      .single();
    if (!player) continue;

    const { data: authUser } = await supabase.auth.admin.getUserById(player.user_id);
    const email = authUser.user?.email;
    if (!email) continue;

    const playerName = player.display_name ?? email.split("@")[0];
    const { subject: subj, html: body } = matchResultEmail(playerName, sport, venueName, completedAt);
    await sendEmail({ to: email, subject: subj, html: body });
  }
}
