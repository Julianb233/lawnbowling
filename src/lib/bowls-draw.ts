/**
 * Lawn Bowling Draw Engine
 *
 * Takes checked-in players with position preferences and forms balanced teams
 * across rinks for a given game format (fours, triples, pairs).
 *
 * Algorithm:
 * 1. Group players by preferred position
 * 2. Calculate how many rinks (games) we can fill
 * 3. Fill each position slot across rinks, pulling from the right pool
 * 4. Overflow players go into a "flexible" pool assigned where needed
 * 5. Shuffle within position groups for fairness
 */

import type {
  BowlsPosition,
  BowlsGameFormat,
  BowlsCheckin,
  BowlsTeamAssignment,
} from "./types";
import { getPositionsForFormat, BOWLS_FORMAT_LABELS } from "./types";

interface DrawResult {
  rinks: BowlsTeamAssignment[][];
  unassigned: BowlsCheckin[];
  rinkCount: number;
  format: BowlsGameFormat;
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
