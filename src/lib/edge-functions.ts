/**
 * Client-side helper for invoking Supabase Edge Functions.
 *
 * Centralizes all calls to the `game-engine` Edge Function so that
 * game logic runs server-side (lower-end device friendly, tamper-proof).
 */

import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────

export interface BowlsResultResponse {
  totalA: number;
  totalB: number;
  endsWonA: number;
  endsWonB: number;
  winner: "team_a" | "team_b" | "draw" | null;
  margin: number;
}

export interface MatchResultResponse {
  winnerId: string | null;
  loserId: string | null;
  isDraw: boolean;
  gamesWon: { player1: number; player2: number };
  totalScore: { player1: number; player2: number };
}

export interface EloResponse {
  newWinnerRating: number;
  newLoserRating: number;
}

export interface BowlsEloResponse {
  newRating: number;
  tier: string;
}

export interface Standing {
  playerId: string;
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
  shotDifference: number;
  endsWon: number;
  gamesPlayed: number;
}

export interface DrawPairing {
  player1Id: string;
  player2Id: string | null;
  matchNumber: number;
}

export interface BracketMatch {
  round: number;
  matchNumber: number;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  loserId: string | null;
  status: "pending" | "in_progress" | "completed";
  bracket: "winners" | "losers" | "grand_final";
}

export interface PennantStanding {
  teamId: string;
  teamName: string;
  clubId: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  shotsFor: number;
  shotsAgainst: number;
  shotDifference: number;
  rinkWins: number;
  rinkLosses: number;
  points: number;
  position: number;
}

export interface ValidateScoresResponse {
  teamAValid: boolean;
  teamAError: string | null;
  teamAParsed: number[];
  teamBValid: boolean;
  teamBError: string | null;
  teamBParsed: number[];
}

// ─── Core Invoke ─────────────────────────────────────────────────────

async function invokeGameEngine<T>(
  action: string,
  params: Record<string, unknown>
): Promise<T> {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke("game-engine", {
    body: { action, params },
  });

  if (error) {
    throw new Error(error.message ?? "Edge Function call failed");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.data as T;
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Calculate bowls result from end-by-end scores (server-side).
 */
export async function calculateBowlsResultRemote(
  teamAScores: number[],
  teamBScores: number[]
): Promise<BowlsResultResponse> {
  return invokeGameEngine<BowlsResultResponse>("calculate-bowls-result", {
    teamAScores,
    teamBScores,
  });
}

/**
 * Calculate match result from game scores (server-side).
 */
export async function calculateMatchResultRemote(
  player1Id: string,
  player2Id: string,
  games: Array<{ player1Score: number; player2Score: number }>,
  format?: "single" | "best_of_3" | "best_of_5"
): Promise<MatchResultResponse> {
  return invokeGameEngine<MatchResultResponse>("calculate-match-result", {
    player1Id,
    player2Id,
    games,
    format,
  });
}

/**
 * Calculate standard ELO rating changes (server-side).
 */
export async function calculateEloRemote(
  winnerRating: number,
  loserRating: number
): Promise<EloResponse> {
  return invokeGameEngine<EloResponse>("calculate-elo", {
    winnerRating,
    loserRating,
  });
}

/**
 * Calculate position-weighted bowls ELO (server-side).
 */
export async function calculateBowlsEloRemote(params: {
  position: string;
  playerRating: number;
  opponentRating: number;
  result: 0 | 0.5 | 1;
  shotDifferential: number;
  endsWon: number;
  endsPlayed: number;
}): Promise<BowlsEloResponse> {
  return invokeGameEngine<BowlsEloResponse>("calculate-bowls-elo", params);
}

/**
 * Build tournament standings from rink results (server-side).
 */
export async function buildStandingsRemote(
  results: Array<{
    teamAPlayerIds: string[];
    teamBPlayerIds: string[];
    totalA: number;
    totalB: number;
    endsWonA: number;
    endsWonB: number;
    winner: "team_a" | "team_b" | "draw" | null;
    isFinalized: boolean;
  }>
): Promise<Standing[]> {
  return invokeGameEngine<Standing[]>("build-standings", { results });
}

/**
 * Generate a seeded draw avoiding previous matchups (server-side).
 */
export async function generateDrawRemote(
  playerIds: string[],
  previousOpponents?: Record<string, string[]>
): Promise<DrawPairing[]> {
  return invokeGameEngine<DrawPairing[]>("generate-draw", {
    playerIds,
    previousOpponents,
  });
}

/**
 * Generate a single elimination bracket (server-side).
 */
export async function generateBracketRemote(
  seededPlayerIds: string[]
): Promise<BracketMatch[]> {
  return invokeGameEngine<BracketMatch[]>("generate-bracket", {
    seededPlayerIds,
  });
}

/**
 * Calculate pennant division standings (server-side).
 */
export async function calculateDivisionStandingsRemote(
  teams: Array<{ id: string; name: string; club_id: string | null }>,
  fixtures: Array<{
    id: string;
    round: number;
    home_team_id: string;
    away_team_id: string;
  }>,
  results: Array<{
    fixture_id: string;
    home_rink_wins: number;
    away_rink_wins: number;
    home_shot_total: number;
    away_shot_total: number;
    winner_team_id: string | null;
  }>
): Promise<PennantStanding[]> {
  return invokeGameEngine<PennantStanding[]>("calculate-division-standings", {
    teams,
    fixtures,
    results,
  });
}

/**
 * Validate scores without calculating results (server-side).
 */
export async function validateScoresRemote(
  teamAScores: unknown,
  teamBScores: unknown
): Promise<ValidateScoresResponse> {
  return invokeGameEngine<ValidateScoresResponse>("validate-scores", {
    teamAScores,
    teamBScores,
  });
}
