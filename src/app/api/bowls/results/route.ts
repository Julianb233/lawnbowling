import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/bowls/results?tournament_id=xxx&round=1
 * Calculate and return results for a tournament round or all rounds.
 * Auto-calculates: total shots, ends won, winner per rink, round summary.
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
      return NextResponse.json({ error: error.message }, { status: 500 });
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

    // Build player standings across all rounds
    const playerStats = new Map<
      string,
      {
        player_id: string;
        display_name: string;
        games_played: number;
        wins: number;
        losses: number;
        draws: number;
        total_shots_for: number;
        total_shots_against: number;
        total_ends_won: number;
        positions_played: string[];
      }
    >();

    for (const score of scores) {
      // Process Team A players
      if (score.team_a_players) {
        for (const p of score.team_a_players) {
          const existing = playerStats.get(p.player_id) ?? {
            player_id: p.player_id,
            display_name: p.display_name,
            games_played: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            total_shots_for: 0,
            total_shots_against: 0,
            total_ends_won: 0,
            positions_played: [],
          };
          if (score.is_finalized) {
            existing.games_played++;
            existing.total_shots_for += score.total_a;
            existing.total_shots_against += score.total_b;
            existing.total_ends_won += score.ends_won_a;
            if (score.winner === "team_a") existing.wins++;
            else if (score.winner === "team_b") existing.losses++;
            else if (score.winner === "draw") existing.draws++;
          }
          playerStats.set(p.player_id, existing);
        }
      }

      // Process Team B players
      if (score.team_b_players) {
        for (const p of score.team_b_players) {
          const existing = playerStats.get(p.player_id) ?? {
            player_id: p.player_id,
            display_name: p.display_name,
            games_played: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            total_shots_for: 0,
            total_shots_against: 0,
            total_ends_won: 0,
            positions_played: [],
          };
          if (score.is_finalized) {
            existing.games_played++;
            existing.total_shots_for += score.total_b;
            existing.total_shots_against += score.total_a;
            existing.total_ends_won += score.ends_won_b;
            if (score.winner === "team_b") existing.wins++;
            else if (score.winner === "team_a") existing.losses++;
            else if (score.winner === "draw") existing.draws++;
          }
          playerStats.set(p.player_id, existing);
        }
      }
    }

    // Sort player standings: wins desc, then shot difference desc
    const playerStandings = Array.from(playerStats.values()).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const aDiff = a.total_shots_for - a.total_shots_against;
      const bDiff = b.total_shots_for - b.total_shots_against;
      return bDiff - aDiff;
    });

    // Check if all rounds are finalized
    const allRoundsFinalized = roundSummaries.every((r) => r.all_finalized);

    return NextResponse.json({
      rounds: roundSummaries,
      player_standings: playerStandings,
      tournament_complete: allRoundsFinalized,
      total_rounds: roundSummaries.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Results calculation failed" },
      { status: 500 }
    );
  }
}
