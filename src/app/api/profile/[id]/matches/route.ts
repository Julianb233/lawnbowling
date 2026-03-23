import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-error-handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: playerId } = await params;
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20", 10);

  try {
    const supabase = await createClient();

    // Get all finalized tournament scores where this player participated
    const { data: scores, error } = await supabase
      .from("tournament_scores")
      .select(
        "id, tournament_id, round, rink, team_a_players, team_b_players, total_a, total_b, winner, is_finalized, created_at"
      )
      .eq("is_finalized", true)
      .order("created_at", { ascending: false });

    if (error) {
      return apiError(error, "profile/[id]/matches", 500);
    }

    // Filter to scores where this player participated
    const playerScores = (scores ?? []).filter((s) => {
      const teamA = (s.team_a_players as { player_id: string }[]) ?? [];
      const teamB = (s.team_b_players as { player_id: string }[]) ?? [];
      return (
        teamA.some((p) => p.player_id === playerId) ||
        teamB.some((p) => p.player_id === playerId)
      );
    });

    // Get tournament details for the scores
    const tournamentIds = [
      ...new Set(playerScores.map((s) => s.tournament_id)),
    ];
    const { data: tournaments } = await supabase
      .from("tournaments")
      .select("id, name, sport, format")
      .in("id", tournamentIds.length > 0 ? tournamentIds : ["none"]);

    const tournamentMap = new Map(
      (tournaments ?? []).map((t) => [t.id, t])
    );

    // Build match history entries
    const matches = playerScores.slice(0, limit).map((s) => {
      const teamA = (s.team_a_players as { player_id: string; display_name: string }[]) ?? [];
      const teamB = (s.team_b_players as { player_id: string; display_name: string }[]) ?? [];
      const isTeamA = teamA.some((p) => p.player_id === playerId);
      const tournament = tournamentMap.get(s.tournament_id);

      const teammates = isTeamA
        ? teamA.filter((p) => p.player_id !== playerId)
        : teamB.filter((p) => p.player_id !== playerId);
      const opponents = isTeamA ? teamB : teamA;

      const playerScore = isTeamA ? s.total_a : s.total_b;
      const opponentScore = isTeamA ? s.total_b : s.total_a;

      let result: "win" | "loss" | "draw";
      if (s.winner === "draw") {
        result = "draw";
      } else if (
        (s.winner === "team_a" && isTeamA) ||
        (s.winner === "team_b" && !isTeamA)
      ) {
        result = "win";
      } else {
        result = "loss";
      }

      return {
        id: s.id,
        tournament_id: s.tournament_id,
        tournament_name: tournament?.name ?? "Unknown Tournament",
        tournament_format: tournament?.format ?? "unknown",
        round: s.round,
        rink: s.rink,
        date: s.created_at,
        player_score: playerScore,
        opponent_score: opponentScore,
        result,
        teammates: teammates.map((p) => ({
          id: p.player_id,
          name: p.display_name,
        })),
        opponents: opponents.map((p) => ({
          id: p.player_id,
          name: p.display_name,
        })),
      };
    });

    return NextResponse.json({
      matches,
      total: playerScores.length,
      has_more: playerScores.length > limit,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch match history",
      },
      { status: 500 }
    );
  }
}
