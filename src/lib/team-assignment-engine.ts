/**
 * Smart Team Assignment Engine
 *
 * Groups checked-in players into balanced teams for lawn bowling draws.
 * Uses weighted multi-factor scoring:
 *   - Skill Balance (40%): Minimize ELO variance between teams within each rink
 *   - Position Preference (30%): Respect preferred positions (skip/vice/second/lead)
 *   - Variety (20%): Avoid repeat pairings using match history
 *   - Social (10%): Respect partner_requests / favorite preferences
 *
 * Supports all formats: Fours, Triples, Pairs, Singles
 * Handles odd numbers with sit-out rotation.
 */

import type {
  BowlsPosition,
  BowlsGameFormat,
  BowlsCheckin,
  BowlsTeamAssignment,
  BowlsPositionRating,
  Player,
} from "./types";
import { getPositionsForFormat, BOWLS_FORMAT_LABELS } from "./types";

// ── Types ──────────────────────────────────────────────────────────

export interface AssignmentPlayer {
  player_id: string;
  display_name: string;
  avatar_url: string | null;
  preferred_position: BowlsPosition | "any";
  elo_rating: number;
  position_ratings: Record<string, number>;
  skill_level: string;
  player?: Player;
}

export interface PartnerPreference {
  requester_id: string;
  target_id: string;
}

export interface MatchHistoryRecord {
  player_a_id: string;
  player_b_id: string;
  times_together: number;
}

export interface AssignmentConfig {
  format: BowlsGameFormat;
  weights?: {
    skill: number;
    position: number;
    variety: number;
    social: number;
  };
  lockedAssignments?: LockedAssignment[];
  matchHistory?: MatchHistoryRecord[];
  partnerPreferences?: PartnerPreference[];
}

export interface LockedAssignment {
  player_id: string;
  rink: number;
  team: 1 | 2;
  position: BowlsPosition;
}

export interface RinkAssignment {
  rink: number;
  teamA: TeamSlot[];
  teamB: TeamSlot[];
  rinkScore: number;
}

export interface TeamSlot {
  player_id: string;
  display_name: string;
  avatar_url: string | null;
  position: BowlsPosition;
  elo_rating: number;
  preferred_position: BowlsPosition | "any";
  isLocked: boolean;
  player?: Player;
}

export interface AssignmentResult {
  rinks: RinkAssignment[];
  sitOuts: AssignmentPlayer[];
  format: BowlsGameFormat;
  totalScore: number;
  scoreBreakdown: {
    skill: number;
    position: number;
    variety: number;
    social: number;
  };
  /** BowlsTeamAssignment[] for backward-compat with draw system */
  flatAssignments: BowlsTeamAssignment[];
}

// ── Defaults ──────────────────────────────────────────────────────

const DEFAULT_WEIGHTS = {
  skill: 0.4,
  position: 0.3,
  variety: 0.2,
  social: 0.1,
};

const DEFAULT_ELO = 1200;

// ── Engine ─────────────────────────────────────────────────────────

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a lookup of pair -> times_together from match history records.
 */
function buildHistoryMap(
  history: MatchHistoryRecord[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const rec of history) {
    const key1 = `${rec.player_a_id}:${rec.player_b_id}`;
    const key2 = `${rec.player_b_id}:${rec.player_a_id}`;
    map.set(key1, (map.get(key1) ?? 0) + rec.times_together);
    map.set(key2, (map.get(key2) ?? 0) + rec.times_together);
  }
  return map;
}

/**
 * Build a lookup of player -> set of preferred partner ids.
 */
function buildPartnerMap(
  prefs: PartnerPreference[]
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const p of prefs) {
    if (!map.has(p.requester_id)) map.set(p.requester_id, new Set());
    map.get(p.requester_id)!.add(p.target_id);
    // Bidirectional
    if (!map.has(p.target_id)) map.set(p.target_id, new Set());
    map.get(p.target_id)!.add(p.requester_id);
  }
  return map;
}

/**
 * Calculate the average ELO for a list of team slots.
 */
function teamElo(team: TeamSlot[]): number {
  if (team.length === 0) return DEFAULT_ELO;
  return team.reduce((sum, s) => sum + s.elo_rating, 0) / team.length;
}

/**
 * Score a single rink assignment across all factors.
 * Returns a score from 0-100 (higher = better).
 */
function scoreRink(
  rink: RinkAssignment,
  historyMap: Map<string, number>,
  partnerMap: Map<string, Set<string>>,
  weights: typeof DEFAULT_WEIGHTS
): { total: number; skill: number; position: number; variety: number; social: number } {
  const allSlots = [...rink.teamA, ...rink.teamB];

  // 1. Skill balance: smaller ELO difference between teams = better
  const eloDiff = Math.abs(teamElo(rink.teamA) - teamElo(rink.teamB));
  // 0 diff = 100, 400+ diff = 0
  const skillScore = Math.max(0, 100 - (eloDiff / 4));

  // 2. Position preference: % of players in their preferred position
  let posMatches = 0;
  let posTotal = 0;
  for (const slot of allSlots) {
    posTotal++;
    if (slot.preferred_position === "any" || slot.position === slot.preferred_position) {
      posMatches++;
    }
  }
  const positionScore = posTotal > 0 ? (posMatches / posTotal) * 100 : 100;

  // 3. Variety: penalize teammates who have played together many times
  let varietyPenalty = 0;
  let varietyPairs = 0;
  // Check within each team
  for (const team of [rink.teamA, rink.teamB]) {
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        const key = `${team[i].player_id}:${team[j].player_id}`;
        const times = historyMap.get(key) ?? 0;
        varietyPenalty += Math.min(times * 5, 50); // cap at 50 per pair
        varietyPairs++;
      }
    }
  }
  const varietyScore = varietyPairs > 0
    ? Math.max(0, 100 - (varietyPenalty / varietyPairs))
    : 100;

  // 4. Social: bonus for partner preferences being on the same team
  let socialHits = 0;
  let socialTotal = 0;
  for (const team of [rink.teamA, rink.teamB]) {
    const ids = team.map((s) => s.player_id);
    for (const slot of team) {
      const wantedPartners = partnerMap.get(slot.player_id);
      if (wantedPartners && wantedPartners.size > 0) {
        socialTotal++;
        for (const partner of wantedPartners) {
          if (ids.includes(partner)) {
            socialHits++;
            break;
          }
        }
      }
    }
  }
  const socialScore = socialTotal > 0 ? (socialHits / socialTotal) * 100 : 50;

  const total =
    skillScore * weights.skill +
    positionScore * weights.position +
    varietyScore * weights.variety +
    socialScore * weights.social;

  return { total, skill: skillScore, position: positionScore, variety: varietyScore, social: socialScore };
}

/**
 * Assign positions to players within a team based on preference and ELO.
 * Higher-ELO players get higher-order positions (skip first).
 */
function assignPositions(
  players: AssignmentPlayer[],
  positions: BowlsPosition[]
): TeamSlot[] {
  if (positions.length === 0) {
    // Singles — no position assignment needed
    return players.map((p) => ({
      player_id: p.player_id,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      position: "skip" as BowlsPosition,
      elo_rating: p.elo_rating,
      preferred_position: p.preferred_position,
      isLocked: false,
      player: p.player,
    }));
  }

  // Sort positions by order (skip=4, vice=3, second=2, lead=1) — descending
  const orderedPositions = [...positions].sort((a, b) => {
    const order: Record<BowlsPosition, number> = { skip: 4, vice: 3, second: 2, lead: 1 };
    return order[b] - order[a];
  });

  const available = [...players];
  const slots: TeamSlot[] = [];

  // First pass: assign players who prefer specific positions
  for (const pos of orderedPositions) {
    const idx = available.findIndex(
      (p) => p.preferred_position === pos
    );
    if (idx !== -1) {
      const p = available.splice(idx, 1)[0];
      slots.push({
        player_id: p.player_id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        position: pos,
        elo_rating: p.elo_rating,
        preferred_position: p.preferred_position,
        isLocked: false,
        player: p.player,
      });
    }
  }

  // Second pass: fill remaining by ELO (higher ELO -> higher position)
  const remainingPositions = orderedPositions.filter(
    (pos) => !slots.find((s) => s.position === pos)
  );
  const sorted = available.sort((a, b) => b.elo_rating - a.elo_rating);

  for (let i = 0; i < remainingPositions.length && i < sorted.length; i++) {
    const p = sorted[i];
    slots.push({
      player_id: p.player_id,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      position: remainingPositions[i],
      elo_rating: p.elo_rating,
      preferred_position: p.preferred_position,
      isLocked: false,
      player: p.player,
    });
  }

  return slots;
}

/**
 * Main entry: generate smart team assignments.
 *
 * Uses a stochastic optimization approach:
 * 1. Generate initial assignment based on position preferences
 * 2. Run N iterations of random swaps, keeping improvements
 * 3. Return the best-scoring assignment
 */
export function generateSmartAssignment(
  players: AssignmentPlayer[],
  config: AssignmentConfig
): AssignmentResult {
  const { format } = config;
  const weights = config.weights ?? DEFAULT_WEIGHTS;
  const formatInfo = BOWLS_FORMAT_LABELS[format];
  const positions = getPositionsForFormat(format);
  const playersPerRink = formatInfo.playersPerTeam * formatInfo.teams;
  const historyMap = buildHistoryMap(config.matchHistory ?? []);
  const partnerMap = buildPartnerMap(config.partnerPreferences ?? []);

  // Handle locked assignments
  const lockedIds = new Set((config.lockedAssignments ?? []).map((l) => l.player_id));
  const unlocked = players.filter((p) => !lockedIds.has(p.player_id));

  // Determine sit-outs
  const totalPlayable = Math.floor(unlocked.length / playersPerRink) * playersPerRink;
  const sitOutCount = unlocked.length - totalPlayable;

  // Select sit-outs (lowest ELO or random — we'll shuffle and take from end)
  const shuffledUnlocked = shuffle(unlocked);
  const sitOuts = shuffledUnlocked.slice(totalPlayable);
  const activePlayers = shuffledUnlocked.slice(0, totalPlayable);

  if (activePlayers.length < playersPerRink) {
    // Not enough players for even one rink
    return {
      rinks: [],
      sitOuts: players,
      format,
      totalScore: 0,
      scoreBreakdown: { skill: 0, position: 0, variety: 0, social: 0 },
      flatAssignments: [],
    };
  }

  const rinkCount = activePlayers.length / playersPerRink;

  // Generate initial assignment
  let bestRinks = buildInitialAssignment(
    activePlayers,
    rinkCount,
    formatInfo.playersPerTeam,
    positions,
    config.lockedAssignments ?? []
  );

  let bestScore = scoreAllRinks(bestRinks, historyMap, partnerMap, weights);

  // Stochastic optimization: try swaps for N iterations
  // Scale iterations with pool size — more players need more optimization passes
  const ITERATIONS = Math.min(2000, Math.max(500, rinkCount * 100));
  for (let i = 0; i < ITERATIONS; i++) {
    const candidate = tryRandomSwap(bestRinks, lockedIds, positions);
    if (!candidate) continue;

    const candidateScore = scoreAllRinks(candidate, historyMap, partnerMap, weights);
    if (candidateScore.total > bestScore.total) {
      bestRinks = candidate;
      bestScore = candidateScore;
    }
  }

  // Convert to flat assignments
  const flatAssignments: BowlsTeamAssignment[] = [];
  for (const rink of bestRinks) {
    for (const slot of rink.teamA) {
      flatAssignments.push({
        rink: rink.rink,
        team: 1,
        player_id: slot.player_id,
        position: slot.position,
        player: slot.player,
      });
    }
    for (const slot of rink.teamB) {
      flatAssignments.push({
        rink: rink.rink,
        team: 2,
        player_id: slot.player_id,
        position: slot.position,
        player: slot.player,
      });
    }
  }

  return {
    rinks: bestRinks,
    sitOuts,
    format,
    totalScore: Math.round(bestScore.total * 10) / 10,
    scoreBreakdown: {
      skill: Math.round(bestScore.skill * 10) / 10,
      position: Math.round(bestScore.position * 10) / 10,
      variety: Math.round(bestScore.variety * 10) / 10,
      social: Math.round(bestScore.social * 10) / 10,
    },
    flatAssignments,
  };
}

/**
 * Build the initial assignment by grouping players into rinks and
 * assigning positions based on preference and ELO.
 */
function buildInitialAssignment(
  players: AssignmentPlayer[],
  rinkCount: number,
  playersPerTeam: number,
  positions: BowlsPosition[],
  locked: LockedAssignment[]
): RinkAssignment[] {
  const playersPerRink = playersPerTeam * 2;
  const rinks: RinkAssignment[] = [];

  // Group by preferred position for better distribution
  const byPosition: Record<string, AssignmentPlayer[]> = { any: [] };
  for (const pos of positions) byPosition[pos] = [];
  for (const p of players) {
    const key = positions.includes(p.preferred_position as BowlsPosition)
      ? p.preferred_position
      : "any";
    byPosition[key].push(p);
  }

  // Distribute across rinks round-robin style
  const rinkPlayers: AssignmentPlayer[][] = Array.from(
    { length: rinkCount },
    () => []
  );

  // First distribute position-specific players evenly across rinks
  for (const pos of positions) {
    const pool = shuffle(byPosition[pos]);
    for (let i = 0; i < pool.length; i++) {
      rinkPlayers[i % rinkCount].push(pool[i]);
    }
  }

  // Then fill with flexible players
  const flexPool = shuffle(byPosition["any"]);
  let flexIdx = 0;
  for (let r = 0; r < rinkCount; r++) {
    while (rinkPlayers[r].length < playersPerRink && flexIdx < flexPool.length) {
      rinkPlayers[r].push(flexPool[flexIdx++]);
    }
  }

  // Build rink assignments
  for (let r = 0; r < rinkCount; r++) {
    const rinkGroup = rinkPlayers[r];
    // Sort by ELO descending, split alternating to balance teams
    const sorted = [...rinkGroup].sort((a, b) => b.elo_rating - a.elo_rating);
    const teamAPlayers: AssignmentPlayer[] = [];
    const teamBPlayers: AssignmentPlayer[] = [];

    for (let i = 0; i < sorted.length; i++) {
      if (i % 2 === 0) teamAPlayers.push(sorted[i]);
      else teamBPlayers.push(sorted[i]);
    }

    const teamA = assignPositions(teamAPlayers, positions);
    const teamB = assignPositions(teamBPlayers, positions);

    // Apply locked assignments
    for (const lock of locked) {
      if (lock.rink === r + 1) {
        const team = lock.team === 1 ? teamA : teamB;
        const slot = team.find((s) => s.player_id === lock.player_id);
        if (slot) {
          slot.position = lock.position;
          slot.isLocked = true;
        }
      }
    }

    rinks.push({
      rink: r + 1,
      teamA,
      teamB,
      rinkScore: 0,
    });
  }

  return rinks;
}

/**
 * Score all rinks and return aggregate scores.
 */
function scoreAllRinks(
  rinks: RinkAssignment[],
  historyMap: Map<string, number>,
  partnerMap: Map<string, Set<string>>,
  weights: typeof DEFAULT_WEIGHTS
): { total: number; skill: number; position: number; variety: number; social: number } {
  if (rinks.length === 0) {
    return { total: 0, skill: 0, position: 0, variety: 0, social: 0 };
  }

  let totalSkill = 0;
  let totalPosition = 0;
  let totalVariety = 0;
  let totalSocial = 0;

  for (const rink of rinks) {
    const scores = scoreRink(rink, historyMap, partnerMap, weights);
    rink.rinkScore = Math.round(scores.total * 10) / 10;
    totalSkill += scores.skill;
    totalPosition += scores.position;
    totalVariety += scores.variety;
    totalSocial += scores.social;
  }

  const n = rinks.length;
  const avgSkill = totalSkill / n;
  const avgPosition = totalPosition / n;
  const avgVariety = totalVariety / n;
  const avgSocial = totalSocial / n;

  const total =
    avgSkill * weights.skill +
    avgPosition * weights.position +
    avgVariety * weights.variety +
    avgSocial * weights.social;

  return { total, skill: avgSkill, position: avgPosition, variety: avgVariety, social: avgSocial };
}

/**
 * Try a random swap between two players across different rinks or teams.
 * Returns new rink array if swap is valid, null otherwise.
 */
function tryRandomSwap(
  rinks: RinkAssignment[],
  lockedIds: Set<string>,
  positions: BowlsPosition[]
): RinkAssignment[] | null {
  if (rinks.length === 0) return null;

  // Deep clone
  const cloned: RinkAssignment[] = rinks.map((r) => ({
    ...r,
    teamA: r.teamA.map((s) => ({ ...s })),
    teamB: r.teamB.map((s) => ({ ...s })),
  }));

  // Collect all slots
  const allSlots: { slot: TeamSlot; rinkIdx: number; team: "A" | "B"; slotIdx: number }[] = [];
  for (let ri = 0; ri < cloned.length; ri++) {
    for (let si = 0; si < cloned[ri].teamA.length; si++) {
      if (!lockedIds.has(cloned[ri].teamA[si].player_id)) {
        allSlots.push({ slot: cloned[ri].teamA[si], rinkIdx: ri, team: "A", slotIdx: si });
      }
    }
    for (let si = 0; si < cloned[ri].teamB.length; si++) {
      if (!lockedIds.has(cloned[ri].teamB[si].player_id)) {
        allSlots.push({ slot: cloned[ri].teamB[si], rinkIdx: ri, team: "B", slotIdx: si });
      }
    }
  }

  if (allSlots.length < 2) return null;

  // Pick two random different slots
  const i = Math.floor(Math.random() * allSlots.length);
  let j = Math.floor(Math.random() * (allSlots.length - 1));
  if (j >= i) j++;

  const s1 = allSlots[i];
  const s2 = allSlots[j];

  // Swap player data between the two slots
  const team1 = s1.team === "A" ? cloned[s1.rinkIdx].teamA : cloned[s1.rinkIdx].teamB;
  const team2 = s2.team === "A" ? cloned[s2.rinkIdx].teamA : cloned[s2.rinkIdx].teamB;

  const tmpPlayerId = team1[s1.slotIdx].player_id;
  const tmpName = team1[s1.slotIdx].display_name;
  const tmpAvatar = team1[s1.slotIdx].avatar_url;
  const tmpElo = team1[s1.slotIdx].elo_rating;
  const tmpPref = team1[s1.slotIdx].preferred_position;
  const tmpPlayer = team1[s1.slotIdx].player;

  team1[s1.slotIdx].player_id = team2[s2.slotIdx].player_id;
  team1[s1.slotIdx].display_name = team2[s2.slotIdx].display_name;
  team1[s1.slotIdx].avatar_url = team2[s2.slotIdx].avatar_url;
  team1[s1.slotIdx].elo_rating = team2[s2.slotIdx].elo_rating;
  team1[s1.slotIdx].preferred_position = team2[s2.slotIdx].preferred_position;
  team1[s1.slotIdx].player = team2[s2.slotIdx].player;

  team2[s2.slotIdx].player_id = tmpPlayerId;
  team2[s2.slotIdx].display_name = tmpName;
  team2[s2.slotIdx].avatar_url = tmpAvatar;
  team2[s2.slotIdx].elo_rating = tmpElo;
  team2[s2.slotIdx].preferred_position = tmpPref;
  team2[s2.slotIdx].player = tmpPlayer;

  return cloned;
}

/**
 * Perform a manual swap of two players by their IDs.
 * Returns the updated assignment result.
 */
export function swapPlayers(
  result: AssignmentResult,
  playerAId: string,
  playerBId: string,
  config: AssignmentConfig
): AssignmentResult {
  const weights = config.weights ?? DEFAULT_WEIGHTS;
  const historyMap = buildHistoryMap(config.matchHistory ?? []);
  const partnerMap = buildPartnerMap(config.partnerPreferences ?? []);

  // Deep clone rinks
  const rinks: RinkAssignment[] = result.rinks.map((r) => ({
    ...r,
    teamA: r.teamA.map((s) => ({ ...s })),
    teamB: r.teamB.map((s) => ({ ...s })),
  }));

  // Find both players
  let slotA: TeamSlot | null = null;
  let slotB: TeamSlot | null = null;

  for (const rink of rinks) {
    for (const slot of [...rink.teamA, ...rink.teamB]) {
      if (slot.player_id === playerAId) slotA = slot;
      if (slot.player_id === playerBId) slotB = slot;
    }
  }

  if (!slotA || !slotB) return result;
  if (slotA.isLocked || slotB.isLocked) return result;

  // Swap player data, keep position
  const tmpId = slotA.player_id;
  const tmpName = slotA.display_name;
  const tmpAvatar = slotA.avatar_url;
  const tmpElo = slotA.elo_rating;
  const tmpPref = slotA.preferred_position;
  const tmpPlayer = slotA.player;

  slotA.player_id = slotB.player_id;
  slotA.display_name = slotB.display_name;
  slotA.avatar_url = slotB.avatar_url;
  slotA.elo_rating = slotB.elo_rating;
  slotA.preferred_position = slotB.preferred_position;
  slotA.player = slotB.player;

  slotB.player_id = tmpId;
  slotB.display_name = tmpName;
  slotB.avatar_url = tmpAvatar;
  slotB.elo_rating = tmpElo;
  slotB.preferred_position = tmpPref;
  slotB.player = tmpPlayer;

  // Re-score
  const scores = scoreAllRinks(rinks, historyMap, partnerMap, weights);

  // Rebuild flat assignments
  const flatAssignments: BowlsTeamAssignment[] = [];
  for (const rink of rinks) {
    for (const slot of rink.teamA) {
      flatAssignments.push({
        rink: rink.rink,
        team: 1,
        player_id: slot.player_id,
        position: slot.position,
        player: slot.player,
      });
    }
    for (const slot of rink.teamB) {
      flatAssignments.push({
        rink: rink.rink,
        team: 2,
        player_id: slot.player_id,
        position: slot.position,
        player: slot.player,
      });
    }
  }

  return {
    rinks,
    sitOuts: result.sitOuts,
    format: result.format,
    totalScore: Math.round(scores.total * 10) / 10,
    scoreBreakdown: {
      skill: Math.round(scores.skill * 10) / 10,
      position: Math.round(scores.position * 10) / 10,
      variety: Math.round(scores.variety * 10) / 10,
      social: Math.round(scores.social * 10) / 10,
    },
    flatAssignments,
  };
}

// ── Fairness Report ──────────────────────────────────────────────────

export interface FairnessReport {
  /** Average ELO difference between teams across all rinks */
  avgEloDiff: number;
  /** Maximum ELO difference between teams in any single rink */
  maxEloDiff: number;
  /** Percentage of players in their preferred position */
  positionSatisfaction: number;
  /** Number of partner preferences honored (same team) */
  partnerPrefsHonored: number;
  /** Total partner preferences requested */
  partnerPrefsTotal: number;
  /** Number of players sitting out */
  sitOutCount: number;
  /** Overall fairness grade */
  grade: "A" | "B" | "C" | "D" | "F";
}

/**
 * Generate a fairness report for an assignment result.
 * Useful for displaying balance metrics in the UI.
 */
export function generateFairnessReport(
  result: AssignmentResult,
  partnerPreferences?: PartnerPreference[]
): FairnessReport {
  let totalEloDiff = 0;
  let maxEloDiff = 0;
  let posMatches = 0;
  let posTotal = 0;

  for (const rink of result.rinks) {
    const eloA = teamElo(rink.teamA);
    const eloB = teamElo(rink.teamB);
    const diff = Math.abs(eloA - eloB);
    totalEloDiff += diff;
    maxEloDiff = Math.max(maxEloDiff, diff);

    for (const slot of [...rink.teamA, ...rink.teamB]) {
      posTotal++;
      if (slot.preferred_position === "any" || slot.position === slot.preferred_position) {
        posMatches++;
      }
    }
  }

  const avgEloDiff = result.rinks.length > 0
    ? Math.round(totalEloDiff / result.rinks.length)
    : 0;

  // Check partner preferences
  let partnerPrefsHonored = 0;
  const partnerPrefsTotal = partnerPreferences?.length ?? 0;
  if (partnerPreferences) {
    for (const pref of partnerPreferences) {
      for (const rink of result.rinks) {
        const teamAIds = rink.teamA.map((s) => s.player_id);
        const teamBIds = rink.teamB.map((s) => s.player_id);
        if (
          (teamAIds.includes(pref.requester_id) && teamAIds.includes(pref.target_id)) ||
          (teamBIds.includes(pref.requester_id) && teamBIds.includes(pref.target_id))
        ) {
          partnerPrefsHonored++;
        }
      }
    }
  }

  const positionSatisfaction = posTotal > 0 ? Math.round((posMatches / posTotal) * 100) : 100;

  // Grade based on overall quality
  const score = result.totalScore;
  const grade: FairnessReport["grade"] =
    score >= 80 ? "A" :
    score >= 65 ? "B" :
    score >= 50 ? "C" :
    score >= 35 ? "D" : "F";

  return {
    avgEloDiff: Math.round(avgEloDiff),
    maxEloDiff: Math.round(maxEloDiff),
    positionSatisfaction,
    partnerPrefsHonored,
    partnerPrefsTotal,
    sitOutCount: result.sitOuts.length,
    grade,
  };
}

// ── Quick Assignment ─────────────────────────────────────────────────

/**
 * Simplified entry point for generating team assignments from a raw player list.
 * Converts basic player data into AssignmentPlayers and runs the engine.
 * Ideal for API routes that don't have full checkin/rating data.
 */
export function quickAssign(
  players: { id: string; name: string; elo?: number; preferred_position?: string; avatar_url?: string | null }[],
  format: BowlsGameFormat = "fours",
  options?: { partnerPreferences?: PartnerPreference[]; matchHistory?: MatchHistoryRecord[] }
): AssignmentResult {
  const assignmentPlayers: AssignmentPlayer[] = players.map((p) => ({
    player_id: p.id,
    display_name: p.name,
    avatar_url: p.avatar_url ?? null,
    preferred_position: (p.preferred_position as BowlsPosition | "any") ?? "any",
    elo_rating: p.elo ?? DEFAULT_ELO,
    position_ratings: {},
    skill_level: p.elo
      ? (p.elo < 1000 ? "beginner" : p.elo < 1400 ? "intermediate" : "advanced")
      : "intermediate",
  }));

  return generateSmartAssignment(assignmentPlayers, {
    format,
    partnerPreferences: options?.partnerPreferences,
    matchHistory: options?.matchHistory,
  });
}

/**
 * Convert BowlsCheckin[] + position ratings into AssignmentPlayer[].
 * Utility for the API layer.
 */
export function checkinsToAssignmentPlayers(
  checkins: BowlsCheckin[],
  positionRatings: BowlsPositionRating[]
): AssignmentPlayer[] {
  const ratingsMap = new Map<string, Record<string, number>>();
  let allElos: number[] = [];

  for (const rating of positionRatings) {
    if (!ratingsMap.has(rating.player_id)) ratingsMap.set(rating.player_id, {});
    ratingsMap.get(rating.player_id)![rating.position] = rating.elo_rating;
    allElos.push(rating.elo_rating);
  }

  return checkins.map((c) => {
    const posRatings = ratingsMap.get(c.player_id) ?? {};
    // Use the highest position ELO as overall, or default
    const eloValues = Object.values(posRatings);
    const elo = eloValues.length > 0
      ? Math.round(eloValues.reduce((a, b) => a + b, 0) / eloValues.length)
      : DEFAULT_ELO;

    return {
      player_id: c.player_id,
      display_name: c.player?.display_name ?? "Unknown",
      avatar_url: c.player?.avatar_url ?? null,
      preferred_position: c.preferred_position as BowlsPosition | "any",
      elo_rating: elo,
      position_ratings: posRatings,
      skill_level: c.player?.skill_level ?? "intermediate",
      player: c.player,
    };
  });
}
