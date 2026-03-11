/**
 * Bowls Ratings — Pure calculation module for position-specific ELO ratings.
 *
 * All functions are pure (no DB calls) so they can be unit-tested.
 * API routes call these functions with data fetched from the DB.
 */

import { calculateBowlsElo } from "@/lib/elo";
import type {
  TournamentScore,
  BowlsCheckin,
  BowlsPositionRating,
  BowlsRatingPosition,
} from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────────

export interface PlayerScoreContext {
  playerId: string;
  position: BowlsRatingPosition;
  team: "a" | "b";
  score: TournamentScore;
}

export interface RatingUpdate {
  playerId: string;
  position: BowlsRatingPosition;
  newElo: number;
  won: boolean;
  drew: boolean;
  shotDifferential: number;
  endsWon: number;
  endsPlayed: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Resolve each player's position for a given tournament score.
 * Uses checkin data if available, otherwise falls back to "singles".
 */
export function resolvePlayerPositions(
  score: TournamentScore,
  checkins: BowlsCheckin[]
): PlayerScoreContext[] {
  const checkinMap = new Map<string, BowlsRatingPosition>();
  for (const c of checkins) {
    checkinMap.set(c.player_id, c.preferred_position as BowlsRatingPosition);
  }

  const contexts: PlayerScoreContext[] = [];

  for (const p of score.team_a_players) {
    contexts.push({
      playerId: p.player_id,
      position: checkinMap.get(p.player_id) ?? "singles",
      team: "a",
      score,
    });
  }
  for (const p of score.team_b_players) {
    contexts.push({
      playerId: p.player_id,
      position: checkinMap.get(p.player_id) ?? "singles",
      team: "b",
      score,
    });
  }

  return contexts;
}

/**
 * Compute the average ELO for a team in a score, given existing ratings.
 */
function getTeamAvgElo(
  teamPlayers: { player_id: string }[],
  ratingsMap: Map<string, number>
): number {
  if (teamPlayers.length === 0) return 1200;
  const total = teamPlayers.reduce(
    (sum, p) => sum + (ratingsMap.get(p.player_id) ?? 1200),
    0
  );
  return total / teamPlayers.length;
}

// ─── Main Calculation ────────────────────────────────────────────────

/**
 * Calculate rating updates for all players in a set of finalized tournament scores.
 *
 * @param scores - Finalized tournament scores
 * @param checkins - Bowls check-in data with position preferences
 * @param existingRatings - Current ratings keyed by `${playerId}:${position}`
 * @returns Array of rating updates to apply
 */
export function calculateRatingUpdates(
  scores: TournamentScore[],
  checkins: BowlsCheckin[],
  existingRatings: Map<string, BowlsPositionRating>
): RatingUpdate[] {
  const updates: RatingUpdate[] = [];

  // Build a mutable ELO map so ratings compound across rounds
  const eloMap = new Map<string, number>();
  for (const [key, rating] of existingRatings) {
    eloMap.set(key, rating.elo_rating);
  }

  // Process scores in round order
  const sortedScores = [...scores].sort((a, b) => a.round - b.round);

  for (const score of sortedScores) {
    if (!score.is_finalized) continue;

    const playerContexts = resolvePlayerPositions(score, checkins);

    // Build team-level ELO maps for opponent calculation
    const teamAAvgElo = getTeamAvgElo(
      score.team_a_players,
      new Map(
        playerContexts
          .filter((c) => c.team === "a")
          .map((c) => [c.playerId, eloMap.get(`${c.playerId}:${c.position}`) ?? 1200])
      )
    );
    const teamBAvgElo = getTeamAvgElo(
      score.team_b_players,
      new Map(
        playerContexts
          .filter((c) => c.team === "b")
          .map((c) => [c.playerId, eloMap.get(`${c.playerId}:${c.position}`) ?? 1200])
      )
    );

    for (const ctx of playerContexts) {
      const key = `${ctx.playerId}:${ctx.position}`;
      const currentElo = eloMap.get(key) ?? 1200;
      const isTeamA = ctx.team === "a";

      const opponentAvgElo = isTeamA ? teamBAvgElo : teamAAvgElo;

      // Determine result
      const isDraw = score.winner === "draw";
      const won = isTeamA
        ? score.winner === "team_a"
        : score.winner === "team_b";
      const result: 0 | 0.5 | 1 = isDraw ? 0.5 : won ? 1 : 0;

      // Shot differential from this player's perspective
      const shotDiff = isTeamA
        ? score.total_a - score.total_b
        : score.total_b - score.total_a;

      const endsWon = isTeamA ? score.ends_won_a : score.ends_won_b;
      const endsPlayed = score.ends_won_a + score.ends_won_b;

      const newElo = calculateBowlsElo({
        position: ctx.position,
        playerRating: currentElo,
        opponentRating: opponentAvgElo,
        result,
        shotDifferential: shotDiff,
        endsWon,
        endsPlayed,
      });

      // Update the running ELO so next rounds compound
      eloMap.set(key, newElo);

      updates.push({
        playerId: ctx.playerId,
        position: ctx.position,
        newElo,
        won,
        drew: isDraw,
        shotDifferential: shotDiff,
        endsWon,
        endsPlayed,
      });
    }
  }

  return updates;
}

/**
 * Apply rating updates to existing ratings, producing new BowlsPositionRating objects.
 */
export function applyUpdates(
  updates: RatingUpdate[],
  existingRatings: Map<string, BowlsPositionRating>,
  season: string
): BowlsPositionRating[] {
  // Group updates by player:position
  const grouped = new Map<string, RatingUpdate[]>();
  for (const update of updates) {
    const key = `${update.playerId}:${update.position}`;
    const arr = grouped.get(key) ?? [];
    arr.push(update);
    grouped.set(key, arr);
  }

  const results: BowlsPositionRating[] = [];

  for (const [key, playerUpdates] of grouped) {
    const existing = existingRatings.get(key);
    const lastUpdate = playerUpdates[playerUpdates.length - 1];

    // Aggregate stats
    const totalWins = playerUpdates.filter((u) => u.won).length;
    const totalDraws = playerUpdates.filter((u) => u.drew).length;
    const totalLosses = playerUpdates.filter((u) => !u.won && !u.drew).length;
    const totalShotDiff = playerUpdates.reduce((sum, u) => sum + u.shotDifferential, 0);
    const totalEndsWon = playerUpdates.reduce((sum, u) => sum + u.endsWon, 0);
    const totalEndsPlayed = playerUpdates.reduce((sum, u) => sum + u.endsPlayed, 0);

    const baseGames = existing?.games_played ?? 0;
    const baseWins = existing?.wins ?? 0;
    const baseLosses = existing?.losses ?? 0;
    const baseDraws = existing?.draws ?? 0;
    const baseShotDiff = existing?.shot_differential ?? 0;
    const baseEndsWon = existing?.ends_won ?? 0;
    const baseEndsPlayed = existing?.ends_played ?? 0;

    const newGamesPlayed = baseGames + playerUpdates.length;
    const newEndsPlayed = baseEndsPlayed + totalEndsPlayed;
    const newEndsWon = baseEndsWon + totalEndsWon;

    results.push({
      id: existing?.id ?? "",
      player_id: lastUpdate.playerId,
      position: lastUpdate.position,
      season,
      elo_rating: lastUpdate.newElo,
      games_played: newGamesPlayed,
      wins: baseWins + totalWins,
      losses: baseLosses + totalLosses,
      draws: baseDraws + totalDraws,
      shot_differential: baseShotDiff + totalShotDiff,
      ends_won: newEndsWon,
      ends_played: newEndsPlayed,
      ends_won_pct: newEndsPlayed > 0
        ? Math.round((newEndsWon / newEndsPlayed) * 1000) / 10
        : 0,
      updated_at: new Date().toISOString(),
    });
  }

  return results;
}
