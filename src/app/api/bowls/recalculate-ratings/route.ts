import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateRatingUpdates, applyUpdates } from "@/lib/bowls-ratings";
import type {
  TournamentScore,
  BowlsCheckin,
  BowlsPositionRating,
  BowlsRatingPosition,
} from "@/lib/types";

/**
 * POST /api/bowls/recalculate-ratings
 *
 * Recalculates bowls position ratings for a specific tournament.
 * Called when tournament scores are finalized or by admins manually.
 *
 * Body: { tournament_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tournament_id } = body as { tournament_id: string };

    if (!tournament_id) {
      return NextResponse.json(
        { error: "tournament_id is required" },
        { status: 400 }
      );
    }

    // Fetch finalized scores for this tournament
    const { data: scores, error: scoresError } = await supabase
      .from("tournament_scores")
      .select("*")
      .eq("tournament_id", tournament_id)
      .eq("is_finalized", true)
      .order("round", { ascending: true });

    if (scoresError) throw scoresError;
    if (!scores || scores.length === 0) {
      return NextResponse.json(
        { error: "No finalized scores found for this tournament" },
        { status: 404 }
      );
    }

    const typedScores = scores as TournamentScore[];

    // Fetch checkins for position resolution
    const { data: checkins, error: checkinError } = await supabase
      .from("bowls_checkins")
      .select("*")
      .eq("tournament_id", tournament_id);

    if (checkinError) throw checkinError;
    const typedCheckins = (checkins ?? []) as BowlsCheckin[];

    // Collect all unique player IDs from scores
    const playerIds = new Set<string>();
    for (const score of typedScores) {
      for (const p of score.team_a_players) playerIds.add(p.player_id);
      for (const p of score.team_b_players) playerIds.add(p.player_id);
    }

    // Current season
    const season = new Date().getFullYear().toString();

    // Fetch existing ratings for these players
    const { data: existingRatingsData, error: ratingsError } = await supabase
      .from("bowls_position_ratings")
      .select("*")
      .in("player_id", Array.from(playerIds))
      .eq("season", season);

    if (ratingsError) throw ratingsError;

    const existingRatings = new Map<string, BowlsPositionRating>();
    for (const r of (existingRatingsData ?? []) as BowlsPositionRating[]) {
      existingRatings.set(`${r.player_id}:${r.position}`, r);
    }

    // Calculate updates
    const updates = calculateRatingUpdates(typedScores, typedCheckins, existingRatings);
    const newRatings = applyUpdates(updates, existingRatings, season);

    // Upsert ratings
    for (const rating of newRatings) {
      const { error: upsertError } = await supabase
        .from("bowls_position_ratings")
        .upsert(
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

      if (upsertError) {
        console.error("Rating upsert error:", upsertError);
      }
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
      const { error: historyError } = await supabase
        .from("bowls_rating_history")
        .insert(historyRows);

      if (historyError) {
        console.error("Rating history insert error:", historyError);
      }
    }

    return NextResponse.json({
      success: true,
      players_updated: newRatings.length,
      ratings: newRatings,
    });
  } catch (error) {
    console.error("Recalculate ratings error:", error);
    return NextResponse.json(
      { error: "Failed to recalculate ratings" },
      { status: 500 }
    );
  }
}
