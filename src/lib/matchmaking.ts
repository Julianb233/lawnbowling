import type { Player } from "./types";

export interface PlayerSkillRating {
  player_id: string;
  sport: string;
  elo_rating: number;
  games_played: number;
}

export interface MatchSuggestion {
  player: Player;
  score: number;
  reasons: string[];
  commonSports: string[];
  eloDiff: number | null;
}

// ELO calculation constants
const ELO_K_FACTOR = 32;
const ELO_DEFAULT = 1200;

/**
 * Calculate new ELO ratings after a match.
 * Returns [winnerNewElo, loserNewElo].
 */
export function calculateElo(
  winnerElo: number,
  loserElo: number,
  kFactor: number = ELO_K_FACTOR
): [number, number] {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  const newWinnerElo = Math.round(winnerElo + kFactor * (1 - expectedWinner));
  const newLoserElo = Math.round(loserElo + kFactor * (0 - expectedLoser));

  return [newWinnerElo, Math.max(100, newLoserElo)];
}

/**
 * Map skill_level to a base ELO for players without per-sport ratings.
 */
function skillLevelToElo(level: string): number {
  switch (level) {
    case "beginner":
      return 1000;
    case "intermediate":
      return 1200;
    case "advanced":
      return 1500;
    default:
      return ELO_DEFAULT;
  }
}

// Scoring weights (sum to ~1.0 for normalization)
const WEIGHTS = {
  skillProximity: 0.40,
  sportOverlap: 0.25,
  matchHistory: 0.20,
  waitTime: 0.15,
};

interface ScoringContext {
  currentPlayer: Player;
  currentPlayerSkills: Map<string, PlayerSkillRating>;
  candidateSkills: Map<string, PlayerSkillRating>;
  matchHistoryMap: Map<string, number>; // player_id -> times played together
  candidate: Player;
}

/**
 * Score skill proximity (0-100). Closer ELO = higher score.
 * Uses per-sport ELO if available, falls back to skill_level mapping.
 */
function scoreSkillProximity(ctx: ScoringContext): number {
  const commonSports = ctx.currentPlayer.sports.filter((s) =>
    ctx.candidate.sports.includes(s)
  );

  if (commonSports.length === 0) return 0;

  let totalScore = 0;
  for (const sport of commonSports) {
    const myElo =
      ctx.currentPlayerSkills.get(sport)?.elo_rating ??
      skillLevelToElo(ctx.currentPlayer.skill_level);
    const theirElo =
      ctx.candidateSkills.get(sport)?.elo_rating ??
      skillLevelToElo(ctx.candidate.skill_level);

    const diff = Math.abs(myElo - theirElo);
    // 0 diff = 100, 400+ diff = 0
    totalScore += Math.max(0, 100 - (diff / 4));
  }

  return totalScore / commonSports.length;
}

/**
 * Score sport preference overlap (0-100).
 * More shared sports = higher score.
 */
function scoreSportOverlap(ctx: ScoringContext): number {
  const mySports = new Set(ctx.currentPlayer.sports);
  const theirSports = ctx.candidate.sports;
  const overlap = theirSports.filter((s) => mySports.has(s)).length;
  const total = new Set([...ctx.currentPlayer.sports, ...theirSports]).size;

  if (total === 0) return 0;
  return (overlap / total) * 100;
}

/**
 * Score match history (0-100).
 * Moderate history is best (played together but not too much -- variety is good).
 * 0 games = 60 (neutral/new pairing bonus), 1-3 games = 80-100, 4+ = decreasing.
 */
function scoreMatchHistory(ctx: ScoringContext): number {
  const timesPlayed = ctx.matchHistoryMap.get(ctx.candidate.id) ?? 0;

  if (timesPlayed === 0) return 60; // slight bonus for new pairings
  if (timesPlayed <= 3) return 80 + (timesPlayed * 6); // up to 98
  // Diminishing returns for frequent pairings
  return Math.max(20, 80 - (timesPlayed - 3) * 10);
}

/**
 * Score wait time (0-100).
 * Players who checked in longer ago get a boost (fairness).
 */
function scoreWaitTime(ctx: ScoringContext): number {
  if (!ctx.candidate.checked_in_at) return 50;

  const waitMs = Date.now() - new Date(ctx.candidate.checked_in_at).getTime();
  const waitMinutes = waitMs / 60000;

  // 0 min = 30, 5 min = 50, 15+ min = 100
  return Math.min(100, 30 + waitMinutes * 4.67);
}

/**
 * Compute the composite matchmaking score for a candidate.
 */
export function computeMatchScore(ctx: ScoringContext): {
  score: number;
  reasons: string[];
} {
  const skillScore = scoreSkillProximity(ctx);
  const sportScore = scoreSportOverlap(ctx);
  const historyScore = scoreMatchHistory(ctx);
  const waitScore = scoreWaitTime(ctx);

  const weightedScore =
    skillScore * WEIGHTS.skillProximity +
    sportScore * WEIGHTS.sportOverlap +
    historyScore * WEIGHTS.matchHistory +
    waitScore * WEIGHTS.waitTime;

  const reasons: string[] = [];

  if (skillScore >= 80) reasons.push("Great skill match");
  else if (skillScore >= 50) reasons.push("Similar skill level");

  const commonSports = ctx.currentPlayer.sports.filter((s) =>
    ctx.candidate.sports.includes(s)
  );
  if (commonSports.length > 1) reasons.push("Multiple shared sports");
  else if (commonSports.length === 1) reasons.push("Plays your sport");

  const timesPlayed = ctx.matchHistoryMap.get(ctx.candidate.id) ?? 0;
  if (timesPlayed === 0) reasons.push("New opponent");
  else if (timesPlayed <= 3) reasons.push(`Played ${timesPlayed}x before`);

  if (waitScore >= 80) reasons.push("Waiting a while");

  return { score: Math.round(weightedScore * 10) / 10, reasons };
}

/**
 * Rank candidates and return top N suggestions.
 */
export function rankSuggestions(
  currentPlayer: Player,
  candidates: Player[],
  currentPlayerSkills: Map<string, PlayerSkillRating>,
  allCandidateSkills: Map<string, Map<string, PlayerSkillRating>>,
  matchHistoryMap: Map<string, number>,
  limit: number = 3
): MatchSuggestion[] {
  const suggestions: MatchSuggestion[] = [];

  for (const candidate of candidates) {
    if (candidate.id === currentPlayer.id) continue;

    const commonSports = currentPlayer.sports.filter((s) =>
      candidate.sports.includes(s)
    );
    if (commonSports.length === 0) continue;

    const candidateSkills = allCandidateSkills.get(candidate.id) ?? new Map();

    const ctx: ScoringContext = {
      currentPlayer,
      currentPlayerSkills,
      candidateSkills,
      matchHistoryMap,
      candidate,
    };

    const { score, reasons } = computeMatchScore(ctx);

    // Calculate average ELO diff across common sports
    let eloDiff: number | null = null;
    if (commonSports.length > 0) {
      let totalDiff = 0;
      for (const sport of commonSports) {
        const myElo =
          currentPlayerSkills.get(sport)?.elo_rating ??
          skillLevelToElo(currentPlayer.skill_level);
        const theirElo =
          candidateSkills.get(sport)?.elo_rating ??
          skillLevelToElo(candidate.skill_level);
        totalDiff += Math.abs(myElo - theirElo);
      }
      eloDiff = Math.round(totalDiff / commonSports.length);
    }

    suggestions.push({
      player: candidate,
      score,
      reasons,
      commonSports,
      eloDiff,
    });
  }

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
