import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/bowls/scores?tournament_id=xxx&round=1
 * Get all scores for a tournament round.
 */
export async function GET(req: NextRequest) {
  const tournamentId = req.nextUrl.searchParams.get("tournament_id");
  const round = req.nextUrl.searchParams.get("round");

  if (!tournamentId) {
    return NextResponse.json({ error: "tournament_id required" }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from("tournament_scores")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("rink", { ascending: true });

  if (round) {
    query = query.eq("round", parseInt(round, 10));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/bowls/scores
 * Create or update scores for a rink in a tournament round.
 * Body: {
 *   tournament_id: string,
 *   round: number,
 *   rink: number,
 *   team_a_players?: { player_id: string, display_name: string }[],
 *   team_b_players?: { player_id: string, display_name: string }[],
 *   team_a_scores: number[],
 *   team_b_scores: number[],
 *   is_finalized?: boolean,
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tournament_id,
      round,
      rink,
      team_a_players,
      team_b_players,
      team_a_scores,
      team_b_scores,
      is_finalized,
    } = body;

    if (!tournament_id || !round || !rink) {
      return NextResponse.json(
        { error: "tournament_id, round, and rink are required" },
        { status: 400 }
      );
    }

    // Ensure scores are arrays of numbers
    const scoresA: number[] = Array.isArray(team_a_scores)
      ? team_a_scores.map(Number)
      : [];
    const scoresB: number[] = Array.isArray(team_b_scores)
      ? team_b_scores.map(Number)
      : [];

    // Calculate totals
    const totalA = scoresA.reduce((sum, s) => sum + s, 0);
    const totalB = scoresB.reduce((sum, s) => sum + s, 0);

    // Calculate ends won
    const endsCount = Math.min(scoresA.length, scoresB.length);
    let endsWonA = 0;
    let endsWonB = 0;
    for (let i = 0; i < endsCount; i++) {
      if (scoresA[i] > scoresB[i]) endsWonA++;
      else if (scoresB[i] > scoresA[i]) endsWonB++;
    }

    // Determine winner (only if finalized or there are scores)
    let winner: string | null = null;
    if (scoresA.length > 0 || scoresB.length > 0) {
      if (totalA > totalB) winner = "team_a";
      else if (totalB > totalA) winner = "team_b";
      else winner = "draw";
    }

    const supabase = await createClient();

    // Check if score record already exists
    const { data: existing } = await supabase
      .from("tournament_scores")
      .select("id, is_finalized")
      .eq("tournament_id", tournament_id)
      .eq("round", round)
      .eq("rink", rink)
      .maybeSingle();

    // Don't allow updates to finalized scores
    if (existing?.is_finalized && !is_finalized) {
      return NextResponse.json(
        { error: "Cannot modify finalized scores" },
        { status: 403 }
      );
    }

    const scoreData = {
      tournament_id,
      round,
      rink,
      team_a_scores: scoresA,
      team_b_scores: scoresB,
      total_a: totalA,
      total_b: totalB,
      ends_won_a: endsWonA,
      ends_won_b: endsWonB,
      winner,
      is_finalized: is_finalized ?? false,
      ...(team_a_players !== undefined && { team_a_players }),
      ...(team_b_players !== undefined && { team_b_players }),
    };

    let data;
    let error;

    if (existing) {
      ({ data, error } = await supabase
        .from("tournament_scores")
        .update(scoreData)
        .eq("id", existing.id)
        .select()
        .single());
    } else {
      ({ data, error } = await supabase
        .from("tournament_scores")
        .insert(scoreData)
        .select()
        .single());
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Score update failed" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bowls/scores
 * Finalize all scores for a round.
 * Body: { tournament_id: string, round: number }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { tournament_id, round } = await req.json();

    if (!tournament_id || !round) {
      return NextResponse.json(
        { error: "tournament_id and round required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tournament_scores")
      .update({ is_finalized: true })
      .eq("tournament_id", tournament_id)
      .eq("round", round)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ finalized: data?.length ?? 0, scores: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Finalize failed" },
      { status: 500 }
    );
  }
}
