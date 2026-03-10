import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getTournament,
  getTournamentMatches,
  getTournamentStandings,
  getParticipants,
  generateRoundRobinBracket,
  generateSingleEliminationBracket,
} from "@/lib/db/tournaments";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const tournament = await getTournament(id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const [matches, standings, participants] = await Promise.all([
      getTournamentMatches(id),
      getTournamentStandings(id),
      getParticipants(id),
    ]);

    const isJoined = player
      ? participants.some((p) => p.player_id === player.id)
      : false;

    return NextResponse.json({
      tournament,
      matches,
      standings,
      participantCount: participants.length,
      isJoined,
      currentPlayerId: player?.id ?? null,
    });
  } catch (error) {
    console.error("Get tournament error:", error);
    return NextResponse.json({ error: "Failed to fetch tournament" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const tournament = await getTournament(id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.created_by !== player?.id) {
      return NextResponse.json({ error: "Only the creator can manage this tournament" }, { status: 403 });
    }

    const body = await request.json();

    if (body.action === "start") {
      if (tournament.status !== "registration") {
        return NextResponse.json({ error: "Tournament already started" }, { status: 400 });
      }

      if (tournament.format === "round_robin") {
        await generateRoundRobinBracket(id);
      } else {
        await generateSingleEliminationBracket(id);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Update tournament error:", error);
    return NextResponse.json({ error: "Failed to update tournament" }, { status: 500 });
  }
}
