/**
 * Lawn Bowling Draw Engine
 *
 * Takes checked-in players with position preferences and forms balanced teams
 * across rinks for a given game format (fours, triples, pairs).
 *
 * Supports multiple draw styles:
 * - random: Shuffle and assign (original algorithm)
 * - seeded: Position-based assignment (original algorithm)
 * - mead: Mead Draw rotation tables for balanced multi-round play
 * - gavel: Gavel Draw rotation tables (fours only)
 */

import type {
  BowlsPosition,
  BowlsGameFormat,
  BowlsCheckin,
  BowlsTeamAssignment,
} from "./types";
import { getPositionsForFormat, BOWLS_FORMAT_LABELS } from "./types";
import { getMeadTable, getMeadSupportedCounts } from "./mead-tables";
import type { MeadFormatKey } from "./mead-tables";
import { getGavelTable, getGavelSupportedCounts } from "./gavel-tables";

export type DrawStyle = "random" | "seeded" | "mead" | "gavel";

export const DRAW_STYLE_LABELS: Record<DrawStyle, string> = {
  random: "Random Draw",
  seeded: "Seeded Draw",
  mead: "Mead Draw",
  gavel: "Gavel Draw",
};

export interface DrawResult {
  rinks: BowlsTeamAssignment[][];
  unassigned: BowlsCheckin[];
  rinkCount: number;
  format: BowlsGameFormat;
}

export interface MultiRoundDrawResult {
  style: DrawStyle;
  rounds: {
    round: number;
    rinks: BowlsTeamAssignment[][];
    unassigned: BowlsCheckin[];
  }[];
  totalRounds: number;
  playerCount: number;
  format: BowlsGameFormat;
}

export class DrawCompatibilityError extends Error {
  public readonly incompatible = true;
  public readonly supported_counts: number[];
  public readonly min: number;
  public readonly max: number;

  constructor(playerCount: number, supported: number[]) {
    const nearest = supported.length > 0
      ? supported.reduce((prev, curr) =>
          Math.abs(curr - playerCount) < Math.abs(prev - playerCount) ? curr : prev
        )
      : 0;
    super(
      `Player count ${playerCount} is not supported. ` +
      `Nearest supported count: ${nearest}. ` +
      `Supported counts: ${supported.join(", ")}`
    );
    this.name = "DrawCompatibilityError";
    this.supported_counts = supported;
    this.min = supported.length > 0 ? Math.min(...supported) : 0;
    this.max = supported.length > 0 ? Math.max(...supported) : 0;
  }
}

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
 * Generate a tournament draw from checked-in players.
 */
export function generateBowlsDraw(
  checkins: BowlsCheckin[],
  format: BowlsGameFormat
): DrawResult {
  const formatInfo = BOWLS_FORMAT_LABELS[format];
  const positions = getPositionsForFormat(format);
  const playersPerRink = formatInfo.playersPerTeam * formatInfo.teams;

  // Singles is just 1v1 pairing
  if (format === "singles") {
    return generateSinglesDraw(checkins);
  }

  // Shuffle for fairness
  const shuffled = shuffle(checkins);

  // Group by preferred position
  const pools: Record<string, BowlsCheckin[]> = {};
  for (const pos of positions) {
    pools[pos] = [];
  }
  pools["flexible"] = [];

  for (const checkin of shuffled) {
    if (positions.includes(checkin.preferred_position)) {
      pools[checkin.preferred_position].push(checkin);
    } else {
      // Position not valid for this format — put in flexible pool
      pools["flexible"].push(checkin);
    }
  }

  // Calculate how many rinks we can fill
  // Each rink needs `playersPerRink` players total
  const totalPlayers = checkins.length;
  const rinkCount = Math.floor(totalPlayers / playersPerRink);

  if (rinkCount === 0) {
    return { rinks: [], unassigned: checkins, rinkCount: 0, format };
  }

  // Each position needs (rinkCount * 2) players (2 teams per rink)
  const slotsPerPosition = rinkCount * 2;

  // Build assignment pools — fill positions, overflow to flexible
  const assignmentPools: Record<string, BowlsCheckin[]> = {};
  for (const pos of positions) {
    const needed = slotsPerPosition;
    const available = pools[pos];
    assignmentPools[pos] = available.slice(0, needed);
    // Overflow goes to flexible
    if (available.length > needed) {
      pools["flexible"].push(...available.slice(needed));
    }
  }

  // Fill any under-staffed positions from flexible pool
  const flexible = shuffle(pools["flexible"]);
  let flexIdx = 0;
  for (const pos of positions) {
    while (assignmentPools[pos].length < slotsPerPosition && flexIdx < flexible.length) {
      assignmentPools[pos].push(flexible[flexIdx]);
      flexIdx++;
    }
  }

  // Build rinks
  const rinks: BowlsTeamAssignment[][] = [];
  const assignedIds = new Set<string>();

  for (let r = 0; r < rinkCount; r++) {
    const rink: BowlsTeamAssignment[] = [];

    for (const pos of positions) {
      // Team 1 player
      const t1Player = assignmentPools[pos][r * 2];
      // Team 2 player
      const t2Player = assignmentPools[pos][r * 2 + 1];

      if (t1Player) {
        rink.push({
          rink: r + 1,
          team: 1,
          player_id: t1Player.player_id,
          position: pos as BowlsPosition,
          player: t1Player.player,
        });
        assignedIds.add(t1Player.player_id);
      }

      if (t2Player) {
        rink.push({
          rink: r + 1,
          team: 2,
          player_id: t2Player.player_id,
          position: pos as BowlsPosition,
          player: t2Player.player,
        });
        assignedIds.add(t2Player.player_id);
      }
    }

    rinks.push(rink);
  }

  // Unassigned = anyone not placed
  const unassigned = checkins.filter((c) => !assignedIds.has(c.player_id));

  return { rinks, unassigned, rinkCount, format };
}

function generateSinglesDraw(checkins: BowlsCheckin[]): DrawResult {
  const shuffled = shuffle(checkins);
  const rinkCount = Math.floor(shuffled.length / 2);
  const rinks: BowlsTeamAssignment[][] = [];

  for (let r = 0; r < rinkCount; r++) {
    rinks.push([
      {
        rink: r + 1,
        team: 1,
        player_id: shuffled[r * 2].player_id,
        position: "skip" as BowlsPosition,
        player: shuffled[r * 2].player,
      },
      {
        rink: r + 1,
        team: 2,
        player_id: shuffled[r * 2 + 1].player_id,
        position: "skip" as BowlsPosition,
        player: shuffled[r * 2 + 1].player,
      },
    ]);
  }

  const unassigned = shuffled.length % 2 === 1 ? [shuffled[shuffled.length - 1]] : [];

  return { rinks, unassigned, rinkCount, format: "singles" };
}

/**
 * Map a rotation table round to BowlsTeamAssignment arrays.
 * Table entries use 1-based player indices; `players` is the shuffled array.
 */
function mapTableRound(
  tableRound: [number[], number[]][],
  players: BowlsCheckin[],
  allCheckins: BowlsCheckin[],
  format: BowlsGameFormat,
  roundNum: number
): { rinks: BowlsTeamAssignment[][]; unassigned: BowlsCheckin[] } {
  const positions = getPositionsForFormat(format);
  const rinks: BowlsTeamAssignment[][] = [];
  const assignedIds = new Set<string>();

  for (let rinkIdx = 0; rinkIdx < tableRound.length; rinkIdx++) {
    const [team1Indices, team2Indices] = tableRound[rinkIdx];
    const rink: BowlsTeamAssignment[] = [];

    for (let posIdx = 0; posIdx < team1Indices.length; posIdx++) {
      const playerIdx = team1Indices[posIdx] - 1; // Convert 1-based to 0-based
      const player = players[playerIdx];
      if (player) {
        const position = positions[posIdx] ?? "skip";
        rink.push({
          rink: rinkIdx + 1,
          team: 1,
          player_id: player.player_id,
          position: position as BowlsPosition,
          player: player.player,
        });
        assignedIds.add(player.player_id);
      }
    }

    for (let posIdx = 0; posIdx < team2Indices.length; posIdx++) {
      const playerIdx = team2Indices[posIdx] - 1;
      const player = players[playerIdx];
      if (player) {
        const position = positions[posIdx] ?? "skip";
        rink.push({
          rink: rinkIdx + 1,
          team: 2,
          player_id: player.player_id,
          position: position as BowlsPosition,
          player: player.player,
        });
        assignedIds.add(player.player_id);
      }
    }

    rinks.push(rink);
  }

  const unassigned = allCheckins.filter((c) => !assignedIds.has(c.player_id));

  return { rinks, unassigned };
}

/**
 * Generate a Mead Draw multi-round rotation.
 */
export function generateMeadDraw(
  checkins: BowlsCheckin[],
  format: BowlsGameFormat
): MultiRoundDrawResult {
  if (format === "singles") {
    throw new Error("Mead Draw is not available for singles format");
  }

  const meadFormat = format as MeadFormatKey;
  const supportedCounts = getMeadSupportedCounts(meadFormat);
  const table = getMeadTable(checkins.length, meadFormat);

  if (!table) {
    throw new DrawCompatibilityError(checkins.length, supportedCounts);
  }

  // Shuffle players for fairness — table indices map to shuffled positions
  const players = shuffle(checkins);

  const rounds = table.map((tableRound, idx) => {
    const { rinks, unassigned } = mapTableRound(tableRound, players, checkins, format, idx + 1);
    return {
      round: idx + 1,
      rinks,
      unassigned,
    };
  });

  return {
    style: "mead",
    rounds,
    totalRounds: rounds.length,
    playerCount: checkins.length,
    format,
  };
}

/**
 * Generate a Gavel Draw multi-round rotation (fours only).
 */
export function generateGavelDraw(
  checkins: BowlsCheckin[],
  format: BowlsGameFormat
): MultiRoundDrawResult {
  if (format !== "fours") {
    throw new Error("Gavel Draw is only available for fours format");
  }

  const supportedCounts = getGavelSupportedCounts();
  const table = getGavelTable(checkins.length);

  if (!table) {
    throw new DrawCompatibilityError(checkins.length, supportedCounts);
  }

  const players = shuffle(checkins);

  const rounds = table.map((tableRound, idx) => {
    const { rinks, unassigned } = mapTableRound(tableRound, players, checkins, format, idx + 1);
    return {
      round: idx + 1,
      rinks,
      unassigned,
    };
  });

  return {
    style: "gavel",
    rounds,
    totalRounds: rounds.length,
    playerCount: checkins.length,
    format,
  };
}

/**
 * Generate a multi-round draw using the specified style.
 * For "random" and "seeded" styles, wraps the single-round result.
 */
export function generateMultiRoundDraw(
  checkins: BowlsCheckin[],
  format: BowlsGameFormat,
  style: DrawStyle = "random"
): MultiRoundDrawResult {
  if (style === "mead") {
    return generateMeadDraw(checkins, format);
  }

  if (style === "gavel") {
    return generateGavelDraw(checkins, format);
  }

  // For random/seeded, wrap the single-round draw
  const singleDraw = generateBowlsDraw(checkins, format);
  return {
    style,
    rounds: [
      {
        round: 1,
        rinks: singleDraw.rinks,
        unassigned: singleDraw.unassigned,
      },
    ],
    totalRounds: 1,
    playerCount: checkins.length,
    format,
  };
}

/**
 * Validate whether a player count is compatible with the given draw style and format.
 */
export function validateDrawCompatibility(
  playerCount: number,
  format: BowlsGameFormat,
  style: DrawStyle
): { compatible: boolean; supported_counts?: number[]; min?: number; max?: number } {
  if (style === "random" || style === "seeded") {
    return { compatible: true };
  }

  if (style === "mead") {
    if (format === "singles") {
      return { compatible: false, supported_counts: [], min: 0, max: 0 };
    }
    const supported = getMeadSupportedCounts(format as MeadFormatKey);
    return {
      compatible: supported.includes(playerCount),
      supported_counts: supported,
      min: supported.length > 0 ? Math.min(...supported) : 0,
      max: supported.length > 0 ? Math.max(...supported) : 0,
    };
  }

  if (style === "gavel") {
    if (format !== "fours") {
      return { compatible: false, supported_counts: [], min: 0, max: 0 };
    }
    const supported = getGavelSupportedCounts();
    return {
      compatible: supported.includes(playerCount),
      supported_counts: supported,
      min: supported.length > 0 ? Math.min(...supported) : 0,
      max: supported.length > 0 ? Math.max(...supported) : 0,
    };
  }

  return { compatible: true };
}
