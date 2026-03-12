import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  validateScores,
  calculateBowlsResult,
  calculateMatchResult,
  calculateElo,
  calculateBowlsElo,
  getRatingTier,
  buildStandings,
  generateSeededDraw,
  generateSingleEliminationBracket,
  calculateDivisionStandings,
} from "../_shared/game-logic.ts";

type ActionHandler = (params: Record<string, unknown>) => unknown;

const actions: Record<string, ActionHandler> = {
  /**
   * Validate and calculate bowls scores from end-by-end data.
   * Input: { teamAScores: number[], teamBScores: number[] }
   */
  "calculate-bowls-result": (params) => {
    const { teamAScores, teamBScores } = params as {
      teamAScores: unknown;
      teamBScores: unknown;
    };

    const valA = validateScores(teamAScores);
    if (!valA.valid) throw new Error(valA.error);

    const valB = validateScores(teamBScores);
    if (!valB.valid) throw new Error(valB.error);

    if (valA.parsed.length !== valB.parsed.length) {
      throw new Error(
        "team_a_scores and team_b_scores must have the same length"
      );
    }

    return calculateBowlsResult(valA.parsed, valB.parsed);
  },

  /**
   * Determine match winner from game scores.
   * Input: { player1Id, player2Id, games: GameScore[], format? }
   */
  "calculate-match-result": (params) => {
    const { player1Id, player2Id, games, format } = params as {
      player1Id: string;
      player2Id: string;
      games: Array<{ player1Score: number; player2Score: number }>;
      format?: "single" | "best_of_3" | "best_of_5";
    };
    if (!player1Id || !player2Id) throw new Error("player1Id and player2Id required");
    if (!Array.isArray(games) || games.length === 0) throw new Error("games array required");
    return calculateMatchResult(player1Id, player2Id, games, format);
  },

  /**
   * Calculate standard ELO rating changes.
   * Input: { winnerRating, loserRating }
   */
  "calculate-elo": (params) => {
    const { winnerRating, loserRating } = params as {
      winnerRating: number;
      loserRating: number;
    };
    if (typeof winnerRating !== "number" || typeof loserRating !== "number") {
      throw new Error("winnerRating and loserRating must be numbers");
    }
    return calculateElo(winnerRating, loserRating);
  },

  /**
   * Calculate position-weighted bowls ELO.
   * Input: BowlsEloInput
   */
  "calculate-bowls-elo": (params) => {
    const { position, playerRating, opponentRating, result, shotDifferential, endsWon, endsPlayed } =
      params as {
        position: string;
        playerRating: number;
        opponentRating: number;
        result: 0 | 0.5 | 1;
        shotDifferential: number;
        endsWon: number;
        endsPlayed: number;
      };
    if (!position || typeof playerRating !== "number") {
      throw new Error("position and playerRating required");
    }
    const newRating = calculateBowlsElo({
      position,
      playerRating,
      opponentRating,
      result,
      shotDifferential,
      endsWon,
      endsPlayed,
    });
    return { newRating, tier: getRatingTier(newRating) };
  },

  /**
   * Build tournament standings from rink results.
   * Input: { results: Array<{ teamAPlayerIds, teamBPlayerIds, totalA, totalB, ... }> }
   */
  "build-standings": (params) => {
    const { results } = params as {
      results: Array<{
        teamAPlayerIds: string[];
        teamBPlayerIds: string[];
        totalA: number;
        totalB: number;
        endsWonA: number;
        endsWonB: number;
        winner: "team_a" | "team_b" | "draw" | null;
        isFinalized: boolean;
      }>;
    };
    if (!Array.isArray(results)) throw new Error("results array required");
    return buildStandings(results);
  },

  /**
   * Generate a seeded draw avoiding previous matchups.
   * Input: { playerIds: string[], previousOpponents?: Record<string, string[]> }
   */
  "generate-draw": (params) => {
    const { playerIds, previousOpponents } = params as {
      playerIds: string[];
      previousOpponents?: Record<string, string[]>;
    };
    if (!Array.isArray(playerIds) || playerIds.length < 2) {
      throw new Error("playerIds array with at least 2 players required");
    }
    return generateSeededDraw(playerIds, previousOpponents);
  },

  /**
   * Generate a single elimination bracket.
   * Input: { seededPlayerIds: string[] }
   */
  "generate-bracket": (params) => {
    const { seededPlayerIds } = params as { seededPlayerIds: string[] };
    if (!Array.isArray(seededPlayerIds) || seededPlayerIds.length < 2) {
      throw new Error("seededPlayerIds array with at least 2 players required");
    }
    return generateSingleEliminationBracket(seededPlayerIds);
  },

  /**
   * Calculate pennant division standings.
   * Input: { teams, fixtures, results }
   */
  "calculate-division-standings": (params) => {
    const { teams, fixtures, results } = params as {
      teams: Array<{ id: string; name: string; club_id: string | null }>;
      fixtures: Array<{
        id: string;
        round: number;
        home_team_id: string;
        away_team_id: string;
      }>;
      results: Array<{
        fixture_id: string;
        home_rink_wins: number;
        away_rink_wins: number;
        home_shot_total: number;
        away_shot_total: number;
        winner_team_id: string | null;
      }>;
    };
    if (!Array.isArray(teams)) throw new Error("teams array required");
    if (!Array.isArray(fixtures)) throw new Error("fixtures array required");
    if (!Array.isArray(results)) throw new Error("results array required");
    return calculateDivisionStandings(teams, fixtures, results);
  },

  /**
   * Validate scores only (no calculation).
   * Input: { teamAScores, teamBScores }
   */
  "validate-scores": (params) => {
    const { teamAScores, teamBScores } = params as {
      teamAScores: unknown;
      teamBScores: unknown;
    };
    const valA = validateScores(teamAScores);
    const valB = validateScores(teamBScores);
    return {
      teamAValid: valA.valid,
      teamAError: valA.error ?? null,
      teamAParsed: valA.parsed,
      teamBValid: valB.valid,
      teamBError: valB.error ?? null,
      teamBParsed: valB.parsed,
    };
  },
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { action, params } = body as {
      action: string;
      params: Record<string, unknown>;
    };

    if (!action) {
      return new Response(
        JSON.stringify({
          error: "action required",
          availableActions: Object.keys(actions),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const handler = actions[action];
    if (!handler) {
      return new Response(
        JSON.stringify({
          error: `Unknown action: ${action}`,
          availableActions: Object.keys(actions),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = handler(params ?? {});

    return new Response(JSON.stringify({ data: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
