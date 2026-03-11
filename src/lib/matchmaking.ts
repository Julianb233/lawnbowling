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
  matchQuality: MatchQuality;
}

export type MatchMode = "competitive" | "learning" | "auto";

export interface MatchQuality {
  skillBalance: number;
  sportFit: number;
  variety: number;
  overall: "great" | "good" | "fair";
}

export interface RecentMatch {
  opponent_id: string;
  played_at: string;
  count: number;
}

const ELO_K_FACTOR = 32;
const ELO_DEFAULT = 1200;

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

function skillLevelToElo(level: string): number {
  switch (level) {
    case "beginner": return 1000;
    case "intermediate": return 1200;
    case "advanced": return 1500;
    case "expert": return 1800;
    default: return ELO_DEFAULT;
  }
}

function getWeights(mode: MatchMode) {
  switch (mode) {
    case "competitive":
      return { skillProximity: 0.50, sportOverlap: 0.20, matchHistory: 0.10, waitTime: 0.05, favorites: 0.05, ratingConfidence: 0.05, recencyDiversity: 0.05 };
    case "learning":
      return { skillProximity: 0.20, sportOverlap: 0.25, matchHistory: 0.15, waitTime: 0.10, favorites: 0.10, ratingConfidence: 0.05, recencyDiversity: 0.15 };
    default:
      return { skillProximity: 0.35, sportOverlap: 0.20, matchHistory: 0.15, waitTime: 0.10, favorites: 0.08, ratingConfidence: 0.05, recencyDiversity: 0.07 };
  }
}

export interface ScoringContext {
  currentPlayer: Player;
  currentPlayerSkills: Map<string, PlayerSkillRating>;
  candidateSkills: Map<string, PlayerSkillRating>;
  matchHistoryMap: Map<string, number>;
  recentMatches: RecentMatch[];
  favoriteIds: Set<string>;
  candidate: Player;
  mode: MatchMode;
  sportFilter?: string;
}

function scoreSkillProximity(ctx: ScoringContext): number {
  const sports = ctx.sportFilter
    ? ctx.currentPlayer.sports.filter((s) => s === ctx.sportFilter && ctx.candidate.sports.includes(s))
    : ctx.currentPlayer.sports.filter((s) => ctx.candidate.sports.includes(s));
  if (sports.length === 0) return 0;
  let totalScore = 0;
  for (const sport of sports) {
    const myElo = ctx.currentPlayerSkills.get(sport)?.elo_rating ?? skillLevelToElo(ctx.currentPlayer.skill_level);
    const theirElo = ctx.candidateSkills.get(sport)?.elo_rating ?? skillLevelToElo(ctx.candidate.skill_level);
    const diff = Math.abs(myElo - theirElo);
    if (ctx.mode === "competitive") { totalScore += Math.max(0, 100 - (diff / 2.5)); }
    else if (ctx.mode === "learning") { totalScore += Math.max(0, 100 - (diff / 6)); }
    else { totalScore += Math.max(0, 100 - (diff / 4)); }
  }
  return totalScore / sports.length;
}

function scoreSportOverlap(ctx: ScoringContext): number {
  const mySports = new Set(ctx.currentPlayer.sports);
  const theirSports = ctx.candidate.sports;
  const overlap = theirSports.filter((s) => mySports.has(s)).length;
  const total = new Set([...ctx.currentPlayer.sports, ...theirSports]).size;
  if (total === 0) return 0;
  return (overlap / total) * 100;
}

function scoreMatchHistory(ctx: ScoringContext): number {
  const timesPlayed = ctx.matchHistoryMap.get(ctx.candidate.id) ?? 0;
  if (timesPlayed === 0) return 60;
  if (timesPlayed <= 3) return 80 + (timesPlayed * 6);
  return Math.max(20, 80 - (timesPlayed - 3) * 10);
}

function scoreWaitTime(ctx: ScoringContext): number {
  if (!ctx.candidate.checked_in_at) return 50;
  const waitMs = Date.now() - new Date(ctx.candidate.checked_in_at).getTime();
  const waitMinutes = waitMs / 60000;
  return Math.min(100, 30 + waitMinutes * 4.67);
}

function scoreFavorites(ctx: ScoringContext): number {
  return ctx.favoriteIds.has(ctx.candidate.id) ? 100 : 30;
}

function scoreRatingConfidence(ctx: ScoringContext): number {
  const sports = ctx.currentPlayer.sports.filter((s) => ctx.candidate.sports.includes(s));
  if (sports.length === 0) return 50;
  let totalConfidence = 0;
  for (const sport of sports) {
    const myGames = ctx.currentPlayerSkills.get(sport)?.games_played ?? 0;
    const theirGames = ctx.candidateSkills.get(sport)?.games_played ?? 0;
    const myConf = Math.min(95, 20 + myGames * 8);
    const theirConf = Math.min(95, 20 + theirGames * 8);
    totalConfidence += Math.sqrt(myConf * theirConf);
  }
  return totalConfidence / sports.length;
}

function scoreRecencyDiversity(ctx: ScoringContext): number {
  const recentMatch = ctx.recentMatches.find((m) => m.opponent_id === ctx.candidate.id);
  if (!recentMatch) return 90;
  const hoursAgo = (Date.now() - new Date(recentMatch.played_at).getTime()) / 3600000;
  if (hoursAgo < 1) return 10;
  if (hoursAgo < 3) return 30;
  if (hoursAgo < 24) return 60;
  if (hoursAgo < 72) return 75;
  return 90;
}

export function computeMatchScore(ctx: ScoringContext): { score: number; reasons: string[]; matchQuality: MatchQuality } {
  const weights = getWeights(ctx.mode);
  const skillScore = scoreSkillProximity(ctx);
  const sportScore = scoreSportOverlap(ctx);
  const historyScore = scoreMatchHistory(ctx);
  const waitScore = scoreWaitTime(ctx);
  const favScore = scoreFavorites(ctx);
  const confScore = scoreRatingConfidence(ctx);
  const diversityScore = scoreRecencyDiversity(ctx);

  const weightedScore =
    skillScore * weights.skillProximity +
    sportScore * weights.sportOverlap +
    historyScore * weights.matchHistory +
    waitScore * weights.waitTime +
    favScore * weights.favorites +
    confScore * weights.ratingConfidence +
    diversityScore * weights.recencyDiversity;

  const reasons: string[] = [];
  if (ctx.favoriteIds.has(ctx.candidate.id)) { reasons.push("Favorite player"); }
  if (skillScore >= 80) reasons.push("Great skill match");
  else if (skillScore >= 50) reasons.push("Similar skill level");
  else if (skillScore >= 20 && ctx.mode === "learning") reasons.push("Good learning match");

  const commonSports = ctx.currentPlayer.sports.filter((s) => ctx.candidate.sports.includes(s));
  if (commonSports.length > 1) reasons.push("Multiple shared sports");
  else if (commonSports.length === 1) reasons.push("Plays your sport");

  const timesPlayed = ctx.matchHistoryMap.get(ctx.candidate.id) ?? 0;
  if (timesPlayed === 0) reasons.push("New opponent");
  else if (timesPlayed <= 3) reasons.push("Played " + timesPlayed + "x before");
  else if (timesPlayed > 6) reasons.push("Frequent partner");

  if (waitScore >= 80) reasons.push("Waiting a while");
  if (confScore >= 70) reasons.push("Reliable rating");

  const recentMatch = ctx.recentMatches.find((m) => m.opponent_id === ctx.candidate.id);
  if (recentMatch == null && timesPlayed > 0) { reasons.push("Fresh matchup"); }

  const matchQuality: MatchQuality = {
    skillBalance: Math.round(skillScore),
    sportFit: Math.round(sportScore),
    variety: Math.round(diversityScore),
    overall: weightedScore >= 70 ? "great" : weightedScore >= 45 ? "good" : "fair",
  };

  return { score: Math.round(weightedScore * 10) / 10, reasons, matchQuality };
}

export function rankSuggestions(
  currentPlayer: Player,
  candidates: Player[],
  currentPlayerSkills: Map<string, PlayerSkillRating>,
  allCandidateSkills: Map<string, Map<string, PlayerSkillRating>>,
  matchHistoryMap: Map<string, number>,
  limit: number = 5,
  options: { recentMatches?: RecentMatch[]; favoriteIds?: Set<string>; mode?: MatchMode; sportFilter?: string } = {}
): MatchSuggestion[] {
  const { recentMatches = [], favoriteIds = new Set(), mode = "auto", sportFilter } = options;
  const suggestions: MatchSuggestion[] = [];

  for (const candidate of candidates) {
    if (candidate.id === currentPlayer.id) continue;
    const commonSports = sportFilter
      ? currentPlayer.sports.filter((s) => s === sportFilter && candidate.sports.includes(s))
      : currentPlayer.sports.filter((s) => candidate.sports.includes(s));
    if (commonSports.length === 0) continue;

    const candidateSkills = allCandidateSkills.get(candidate.id) ?? new Map();
    const ctx: ScoringContext = { currentPlayer, currentPlayerSkills, candidateSkills, matchHistoryMap, recentMatches, favoriteIds, candidate, mode, sportFilter };
    const { score, reasons, matchQuality } = computeMatchScore(ctx);

    let eloDiff: number | null = null;
    if (commonSports.length > 0) {
      let totalDiff = 0;
      for (const sport of commonSports) {
        const myElo = currentPlayerSkills.get(sport)?.elo_rating ?? skillLevelToElo(currentPlayer.skill_level);
        const theirElo = candidateSkills.get(sport)?.elo_rating ?? skillLevelToElo(candidate.skill_level);
        totalDiff += Math.abs(myElo - theirElo);
      }
      eloDiff = Math.round(totalDiff / commonSports.length);
    }

    suggestions.push({ player: candidate, score, reasons, commonSports, eloDiff, matchQuality });
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
}
