import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildStandings, determineTournamentWinner } from "@/lib/tournament-engine";
import { apiError } from "@/lib/api-error-handler";

/**
 * GET /api/bowls/results?tournament_id=xxx&round=1
 * Calculate and return results for a tournament round or all rounds.
 * Auto-calculates: total shots, ends won, winner per rink, round summary.
 * Uses tournament engine for proper tiebreaker-based standings.
 */
export async function GET(req: NextRequest) {
  const tournamentId = req.nextUrl.searchParams.get("tournament_id");
  const round = req.nextUrl.searchParams.get("round");

  if (!tournamentId) {
    return NextResponse.json({ error: "tournament_id required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    let query = supabase
      .from("tournament_scores")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("round", { ascending: true })
      .order("rink", { ascending: true });

    if (round) {
      query = query.eq("round", parseInt(round, 10));
    }

    const { data: scores, error } = await query;

    if (error) {
      return apiError(error, "GET /api/bowls/results", 500);
    }

    if (!scores || scores.length === 0) {
      return NextResponse.json({
        rounds: [],
        player_standings: [],
        tournament_complete: false,
      });
    }

    // Group scores by round
    const roundMap = new Map<number, typeof scores>();
    for (const score of scores) {
      const existing = roundMap.get(score.round) ?? [];
      existing.push(score);
      roundMap.set(score.round, existing);
    }

    // Build round summaries
    const roundSummaries = [];
    for (const [roundNum, roundScores] of roundMap.entries()) {
      const allFinalized = roundScores.every((s: { is_finalized: boolean }) => s.is_finalized);
      const totalShots = roundScores.reduce(
        (sum: number, s: { total_a: number; total_b: number }) => sum + s.total_a + s.total_b,
        0
      );
      const totalEnds = roundScores.reduce(
        (sum: number, s: { team_a_scores: number[] }) => sum + s.team_a_scores.length,
        0
      );

      const rinkResults = roundScores.map(
        (s: {
          rink: number;
          total_a: number;
          total_b: number;
          ends_won_a: number;
          ends_won_b: number;
          winner: string | null;
          is_finalized: boolean;
          team_a_players: { player_id: string; display_name: string }[];
          team_b_players: { player_id: string; display_name: string }[];
          team_a_scores: number[];
          team_b_scores: number[];
        }) => ({
          rink: s.rink,
          total_a: s.total_a,
          total_b: s.total_b,
          ends_won_a: s.ends_won_a,
          ends_won_b: s.ends_won_b,
          winner: s.winner,
          is_finalized: s.is_finalized,
          margin: Math.abs(s.total_a - s.total_b),
          team_a_players: s.team_a_players,
          team_b_players: s.team_b_players,
          team_a_scores: s.team_a_scores,
          team_b_scores: s.team_b_scores,
        })
      );

      roundSummaries.push({
        round: roundNum,
        all_finalized: allFinalized,
        rink_count: roundScores.length,
        total_shots: totalShots,
        total_ends: totalEnds,
        rink_results: rinkResults,
      });
    }

    // Build player standings using the tournament engine (proper tiebreakers:
    // wins → shot difference → ends won → points for)
    const displayNameMap = new Map<string, string>();
    const engineResults = scores.map((score) => {
      const teamA = (score.team_a_players ?? []) as Array<{ player_id: string; display_name: string }>;
      const teamB = (score.team_b_players ?? []) as Array<{ player_id: string; display_name: string }>;
      for (const p of teamA) displayNameMap.set(p.player_id, p.display_name);
      for (const p of teamB) displayNameMap.set(p.player_id, p.display_name);
      return {
        teamAPlayerIds: teamA.map((p) => p.player_id),
        teamBPlayerIds: teamB.map((p) => p.player_id),
        totalA: score.total_a as number,
        totalB: score.total_b as number,
        endsWonA: score.ends_won_a as number,
        endsWonB: score.ends_won_b as number,
        winner: score.winner as "team_a" | "team_b" | "draw" | null,
        isFinalized: score.is_finalized as boolean,
      };
    });

    const standings = buildStandings(engineResults);

    const playerStandings = standings.map((s) => ({
      player_id: s.playerId,
      display_name: displayNameMap.get(s.playerId) ?? "Unknown",
      games_played: s.gamesPlayed,
      wins: s.wins,
      losses: s.losses,
      draws: s.draws,
      total_shots_for: s.pointsFor,
      total_shots_against: s.pointsAgainst,
      total_ends_won: s.endsWon,
    }));

    // Check if all rounds are finalized
    const allRoundsFinalized = roundSummaries.every((r) => r.all_finalized);

    // Determine tournament winner if complete
    const tournamentWinner = allRoundsFinalized
      ? determineTournamentWinner([], "round_robin", standings)
      : null;

    return NextResponse.json({
      rounds: roundSummaries,
      player_standings: playerStandings,
      tournament_complete: allRoundsFinalized,
      total_rounds: roundSummaries.length,
      tournament_winner: tournamentWinner,
    });
  } catch (err) {
    return apiError(err, "GET /api/bowls/results", 500);
  }
}
