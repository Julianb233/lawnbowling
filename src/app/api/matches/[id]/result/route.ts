import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportMatchResult } from "@/lib/db/stats";
import { getPlayerByUserId } from "@/lib/db/players";
import { isAdmin } from "@/lib/auth/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: matchId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up the player record by auth user_id to get the player.id
    const player = await getPlayerByUserId(user.id);
    if (!player) {
      return NextResponse.json({ error: "Player profile not found" }, { status: 404 });
    }

    // Verify the player is a participant in this match or is an admin
    const { data: matchPlayer } = await supabase
      .from("match_players")
      .select("id")
      .eq("match_id", matchId)
      .eq("player_id", player.id)
      .limit(1)
      .maybeSingle();

    const userIsAdmin = await isAdmin(user.id);
    if (!matchPlayer && !userIsAdmin) {
      return NextResponse.json({ error: "You are not a participant in this match" }, { status: 403 });
    }

    const body = await request.json();
    const { winner_team, team1_score, team2_score } = body;

    const result = await reportMatchResult({
      match_id: matchId,
      winner_team: winner_team ?? null,
      team1_score: team1_score ?? null,
      team2_score: team2_score ?? null,
      reported_by: player.id,
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error("Report result error:", error);
    return NextResponse.json({ error: "Failed to report result" }, { status: 500 });
  }
}
