import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateRatingUpdates, applyUpdates } from "@/lib/bowls-ratings";
import type { TournamentScore, BowlsCheckin, BowlsPositionRating } from "@/lib/types";
import { apiError } from "@/lib/api-error-handler";

const MAX_SCORE_PER_END = 9;
const MAX_ENDS = 30;

function validateScores(scores: unknown): { valid: boolean; parsed: number[]; error?: string } {
  if (!Array.isArray(scores)) return { valid: true, parsed: [] };
  if (scores.length > MAX_ENDS) {
    return { valid: false, parsed: [], error: `Cannot exceed ${MAX_ENDS} ends` };
  }
  const parsed: number[] = [];
  for (const s of scores) {
    const n = Number(s);
    if (!Number.isFinite(n) || n < 0 || n > MAX_SCORE_PER_END || !Number.isInteger(n)) {
      return { valid: false, parsed: [], error: `Scores must be integers between 0 and ${MAX_SCORE_PER_END}` };
    }
    parsed.push(n);
  }
  return { valid: true, parsed };
}

/**
 * GET /api/bowls/scores?tournament_id=xxx&round=1
 * Get all scores for a tournament round. Public endpoint for spectators.
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
    const roundNum = parseInt(round, 10);
    if (!Number.isFinite(roundNum) || roundNum < 1) {
      return NextResponse.json({ error: "Invalid round number" }, { status: 400 });
    }
    query = query.eq("round", roundNum);
  }

  const { data, error } = await query;

  if (error) {
    return apiError(error, "bowls/scores", 500);
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/bowls/scores
 * Create or update scores for a rink in a tournament round.
 * Requires authentication.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      expected_updated_at, // For optimistic concurrency control
    } = body;

    if (!tournament_id || !round || !rink) {
      return NextResponse.json(
        { error: "tournament_id, round, and rink are required" },
        { status: 400 }
      );
    }

    // Validate round and rink are positive integers
    if (!Number.isInteger(round) || round < 1 || !Number.isInteger(rink) || rink < 1) {
      return NextResponse.json(
        { error: "round and rink must be positive integers" },
        { status: 400 }
      );
    }

    // Validate scores
    const valA = validateScores(team_a_scores);
    if (!valA.valid) {
      return NextResponse.json({ error: valA.error }, { status: 400 });
    }
    const valB = validateScores(team_b_scores);
    if (!valB.valid) {
      return NextResponse.json({ error: valB.error }, { status: 400 });
    }

    const scoresA = valA.parsed;
    const scoresB = valB.parsed;

    // Ensure both arrays are the same length
    if (scoresA.length !== scoresB.length) {
      return NextResponse.json(
        { error: "team_a_scores and team_b_scores must have the same length" },
        { status: 400 }
      );
    }

    // Calculate totals
    const totalA = scoresA.reduce((sum, s) => sum + s, 0);
    const totalB = scoresB.reduce((sum, s) => sum + s, 0);

    // Calculate ends won
    let endsWonA = 0;
    let endsWonB = 0;
    for (let i = 0; i < scoresA.length; i++) {
      if (scoresA[i] > scoresB[i]) endsWonA++;
      else if (scoresB[i] > scoresA[i]) endsWonB++;
    }

    // Determine winner
    let winner: string | null = null;
    if (scoresA.length > 0) {
      if (totalA > totalB) winner = "team_a";
      else if (totalB > totalA) winner = "team_b";
      else winner = "draw";
    }

    // Check if score record already exists
    const { data: existing } = await supabase
      .from("tournament_scores")
      .select("id, is_finalized, updated_at")
      .eq("tournament_id", tournament_id)
      .eq("round", round)
      .eq("rink", rink)
      .maybeSingle();

    // Don't allow updates to finalized scores
    if (existing?.is_finalized) {
      return NextResponse.json(
        { error: "Cannot modify finalized scores" },
        { status: 403 }
      );
    }

    // Optimistic concurrency check
    if (existing && expected_updated_at) {
      const existingTime = new Date(existing.updated_at).getTime();
      const expectedTime = new Date(expected_updated_at).getTime();
      if (existingTime !== expectedTime) {
        return NextResponse.json(
          { error: "Score was modified by another user. Please refresh and try again.", conflict: true },
          { status: 409 }
        );
      }
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
      return apiError(error, "bowls/scores", 500);
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
 * PUT /api/bowls/scores
 * Unlock a specific finalized rink for score correction.
 * Only the tournament creator can unlock rinks.
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tournament_id, round, rink } = await req.json();

    if (!tournament_id || !round || !rink) {
      return NextResponse.json(
        { error: "tournament_id, round, and rink are required" },
        { status: 400 }
      );
    }

    // Verify user is the tournament creator
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("created_by")
      .eq("id", tournament_id)
      .single();

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Check if the authenticated user has a player record that matches the creator
    const { data: player } = await supabase
      .from("players")
      .select("id, display_name")
      .eq("id", user.id)
      .single();

    if (!player || player.id !== tournament.created_by) {
      return NextResponse.json(
        { error: "Only the tournament creator can unlock finalized scores" },
        { status: 403 }
      );
    }

    // Get the existing score record
    const { data: existing } = await supabase
      .from("tournament_scores")
      .select("id, is_finalized, correction_log")
      .eq("tournament_id", tournament_id)
      .eq("round", round)
      .eq("rink", rink)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Score record not found" }, { status: 404 });
    }

    if (!existing.is_finalized) {
      return NextResponse.json({ error: "This rink is not finalized" }, { status: 400 });
    }

    // Build correction log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      unlocked_by: player.display_name ?? player.id,
      rink,
    };
    const existingLog = (existing.correction_log as { timestamp: string; unlocked_by: string; rink: number }[]) ?? [];
    const updatedLog = [...existingLog, logEntry];

    // Unlock only this rink
    const { data, error } = await supabase
      .from("tournament_scores")
      .update({ is_finalized: false, correction_log: updatedLog })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return apiError(error, "bowls/scores", 500);
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unlock failed" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bowls/scores
 * Finalize all scores for a round. Requires authentication.
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tournament_id, round } = await req.json();

    if (!tournament_id || !round) {
      return NextResponse.json(
        { error: "tournament_id and round required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(round) || round < 1) {
      return NextResponse.json(
        { error: "round must be a positive integer" },
        { status: 400 }
      );
    }

    // Verify all rinks have scores before finalizing
    const { data: scores } = await supabase
      .from("tournament_scores")
      .select("id, team_a_scores, team_b_scores")
      .eq("tournament_id", tournament_id)
      .eq("round", round);

    if (!scores || scores.length === 0) {
      return NextResponse.json(
        { error: "No scores to finalize for this round" },
        { status: 400 }
      );
    }

    const emptyRinks = scores.filter(
      (s) => {
        const aScores = s.team_a_scores as number[];
        return !aScores || aScores.length === 0;
      }
    );
    if (emptyRinks.length > 0) {
      return NextResponse.json(
        { error: `${emptyRinks.length} rink(s) have no scores entered` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tournament_scores")
      .update({ is_finalized: true })
      .eq("tournament_id", tournament_id)
      .eq("round", round)
      .select();

    if (error) {
      return apiError(error, "bowls/scores", 500);
    }

    // REQ-11-05: Auto-trigger rating recalculation on finalization
    try {
      const { data: allScores } = await supabase
        .from("tournament_scores")
        .select("*")
        .eq("tournament_id", tournament_id)
        .eq("is_finalized", true)
        .order("round", { ascending: true });

      if (allScores && allScores.length > 0) {
        const typedScores = allScores as TournamentScore[];
        const { data: checkins } = await supabase
          .from("bowls_checkins")
          .select("*")
          .eq("tournament_id", tournament_id);

        const typedCheckins = (checkins ?? []) as BowlsCheckin[];
        const playerIds = new Set<string>();
        for (const s of typedScores) {
          for (const p of s.team_a_players) playerIds.add(p.player_id);
          for (const p of s.team_b_players) playerIds.add(p.player_id);
        }

        const season = new Date().getFullYear().toString();
        const { data: existingData } = await supabase
          .from("bowls_position_ratings")
          .select("*")
          .in("player_id", Array.from(playerIds))
          .eq("season", season);

        const existingRatings = new Map<string, BowlsPositionRating>();
        for (const r of (existingData ?? []) as BowlsPositionRating[]) {
          existingRatings.set(`${r.player_id}:${r.position}`, r);
        }

        const updates = calculateRatingUpdates(typedScores, typedCheckins, existingRatings);
        const newRatings = applyUpdates(updates, existingRatings, season);

        for (const rating of newRatings) {
          await supabase.from("bowls_position_ratings").upsert(
            {
              player_id: rating.player_id,
              position: rating.position,
              season: rating.season,
              elo_rating: rating.elo_rating,
              games_played: rating.games_played,
              wins: rating.wins,
              losses: rating.losses,
              draws: rating.draws,
              shot_differential: rating.shot_differential,
              ends_won: rating.ends_won,
              ends_played: rating.ends_played,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "player_id,position,season" }
          );
        }

        // Record rating history for sparklines
        const historyRows = newRatings.map((r) => ({
          player_id: r.player_id,
          position: r.position,
          season,
          elo_rating: r.elo_rating,
          tournament_id,
        }));
        if (historyRows.length > 0) {
          await supabase.from("bowls_rating_history").insert(historyRows);
        }
      }
    } catch (ratingErr) {
      console.error("Auto rating recalculation failed:", ratingErr);
      // Non-fatal — finalization still succeeded
    }

    return NextResponse.json({ finalized: data?.length ?? 0, scores: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Finalize failed" },
      { status: 500 }
    );
  }
}
