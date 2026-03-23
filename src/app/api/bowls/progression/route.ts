import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTournamentResultPost } from "@/lib/db/noticeboard";
import { calculateRatingUpdates, applyUpdates } from "@/lib/bowls-ratings";
import type { TournamentScore, BowlsCheckin, BowlsPositionRating } from "@/lib/types";
import { apiError } from "@/lib/api-error-handler";

/**
 * Tournament Progression State Machine
 *
 * States: registration -> checkin -> draw -> scoring -> results -> (next_round | complete)
 *
 * GET /api/bowls/progression?tournament_id=xxx
 *   Returns current state and available transitions.
 *
 * POST /api/bowls/progression
 *   Advance tournament state.
 *   Body: { tournament_id, action }
 *   Actions: "start_checkin" | "generate_draw" | "start_scoring" | "finalize_round" | "next_round" | "complete"
 */

type TournamentState =
  | "registration"
  | "checkin"
  | "draw"
  | "scoring"
  | "results"
  | "complete";

interface ProgressionInfo {
  tournament_id: string;
  current_state: TournamentState;
  current_round: number;
  total_rounds_played: number;
  available_actions: string[];
  checkin_count: number;
  all_scores_finalized: boolean;
  can_advance: boolean;
}

export async function GET(req: NextRequest) {
  const tournamentId = req.nextUrl.searchParams.get("tournament_id");

  if (!tournamentId) {
    return NextResponse.json({ error: "tournament_id required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const info = await getProgressionInfo(supabase, tournamentId);
    return NextResponse.json(info);
  } catch (err) {
    return apiError(err, "bowls-progression", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tournament_id, action } = await req.json();

    if (!tournament_id || !action) {
      return NextResponse.json(
        { error: "tournament_id and action required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current state
    const info = await getProgressionInfo(supabase, tournament_id);

    // Validate action is available
    if (!info.available_actions.includes(action)) {
      return NextResponse.json(
        {
          error: `Action "${action}" not available in state "${info.current_state}". Available: ${info.available_actions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Execute state transition
    let newStatus: string | undefined;
    let responseData: Record<string, unknown> = {};

    switch (action) {
      case "start_checkin": {
        newStatus = "checkin";
        break;
      }

      case "start_scoring": {
        newStatus = "scoring";
        break;
      }

      case "finalize_round": {
        // Finalize all scores for current round
        const { data: finalizedScores, error: finalizeErr } = await supabase
          .from("tournament_scores")
          .update({ is_finalized: true })
          .eq("tournament_id", tournament_id)
          .eq("round", info.current_round)
          .select();

        if (finalizeErr) {
          return apiError(finalizeErr, "bowls-progression", 500);
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

            const ratingUpdates = calculateRatingUpdates(typedScores, typedCheckins, existingRatings);
            const newRatings = applyUpdates(ratingUpdates, existingRatings, season);

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
        }

        newStatus = "results";
        responseData = { finalized_count: finalizedScores?.length ?? 0 };
        break;
      }

      case "next_round": {
        // Tournament stays in_progress, but we note the round increment
        // The next round draw will be generated via the draw API
        newStatus = "in_progress";
        responseData = { next_round: info.current_round + 1 };
        break;
      }

      case "complete": {
        newStatus = "completed";
        break;
      }

      default: {
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
      }
    }

    // Update tournament status if needed
    if (newStatus) {
      const updateData: Record<string, unknown> = { status: newStatus };

      const { error: updateErr } = await supabase
        .from("tournaments")
        .update(updateData)
        .eq("id", tournament_id);

      if (updateErr) {
        return apiError(updateErr, "bowls-progression", 500);
      }

      // Auto-post tournament results to noticeboard when completed (REQ-13-10)
      if (newStatus === "completed") {
        createTournamentResultPost(tournament_id).catch((err) => {
          console.error("Failed to auto-post tournament results:", err);
        });
      }
    }

    // Fetch updated progression info
    const updatedInfo = await getProgressionInfo(supabase, tournament_id);

    return NextResponse.json({
      ...updatedInfo,
      action_performed: action,
      ...responseData,
    });
  } catch (err) {
    return apiError(err, "bowls-progression", 500);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getProgressionInfo(supabase: any, tournamentId: string): Promise<ProgressionInfo> {
  // Get tournament
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, status, format")
    .eq("id", tournamentId)
    .single();

  if (!tournament) {
    throw new Error("Tournament not found");
  }

  // Get checkin count
  const { count: checkinCount } = await supabase
    .from("bowls_checkins")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournamentId);

  // Get scores info
  const { data: scores } = await supabase
    .from("tournament_scores")
    .select("round, is_finalized")
    .eq("tournament_id", tournamentId)
    .order("round", { ascending: false });

  const allScores = scores ?? [];
  const maxRound = allScores.length > 0
    ? Math.max(...allScores.map((s: { round: number }) => s.round))
    : 0;

  const currentRoundScores = allScores.filter(
    (s: { round: number }) => s.round === maxRound
  );
  const allCurrentFinalized =
    currentRoundScores.length > 0 &&
    currentRoundScores.every((s: { is_finalized: boolean }) => s.is_finalized);

  // Determine current logical state from DB status + scores
  const dbStatus = tournament.status;
  let currentState: TournamentState;

  if (dbStatus === "completed") {
    currentState = "complete";
  } else if (dbStatus === "registration") {
    currentState = "registration";
  } else if (dbStatus === "checkin") {
    currentState = "checkin";
  } else if (allCurrentFinalized && maxRound > 0) {
    currentState = "results";
  } else if (maxRound > 0 && !allCurrentFinalized) {
    currentState = "scoring";
  } else if (dbStatus === "in_progress" && maxRound === 0) {
    currentState = "draw";
  } else if (dbStatus === "scoring") {
    currentState = "scoring";
  } else if (dbStatus === "results") {
    currentState = "results";
  } else {
    currentState = "registration";
  }

  // Determine available actions
  const availableActions: string[] = [];

  switch (currentState) {
    case "registration":
      availableActions.push("start_checkin");
      break;
    case "checkin":
      if ((checkinCount ?? 0) >= 2) {
        availableActions.push("generate_draw");
      }
      break;
    case "draw":
      availableActions.push("start_scoring");
      break;
    case "scoring":
      if (currentRoundScores.length > 0) {
        availableActions.push("finalize_round");
      }
      break;
    case "results":
      availableActions.push("next_round");
      availableActions.push("complete");
      break;
  }

  return {
    tournament_id: tournamentId,
    current_state: currentState,
    current_round: maxRound || 1,
    total_rounds_played: maxRound,
    available_actions: availableActions,
    checkin_count: checkinCount ?? 0,
    all_scores_finalized: allCurrentFinalized,
    can_advance: availableActions.length > 0,
  };
}
