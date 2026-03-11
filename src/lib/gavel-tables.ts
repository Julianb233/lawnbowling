/**
 * Gavel Draw Rotation Tables
 *
 * Standard Gavel Draw tables for multi-round lawn bowling rotation.
 * The Gavel Draw uses an offset-based rotation that differs from the Mead Draw.
 *
 * Format is identical to Mead tables:
 * Each round is an array of rinks. Each rink is [team1[], team2[]]
 * Player numbers are 1-based indices mapped to shuffled player array.
 *
 * Gavel Draw supports fours format only (as per PRD scope).
 */

// Each round is an array of rinks. Each rink is [team1[], team2[]]
type RinkAssignment = [number[], number[]];
type Round = RinkAssignment[];
type GavelTable = Round[];

// Gavel tables: GAVEL_TABLE[playerCount] = rounds (fours only)
export const GAVEL_TABLE: Record<number, GavelTable> = {
  12: [
    // 12 players in fours = 1 rink + 4 sitting out per round (actually 1.5 rinks)
    // With 12 players in fours: 1 full rink (8 players), 4 bye per round
    [[[1,2,3,4],[5,6,7,8]]],       // 9,10,11,12 bye
    [[[1,6,9,12],[3,8,10,11]]],    // 2,4,5,7 bye
    [[[2,5,10,12],[4,7,9,11]]],    // 1,3,6,8 bye
    [[[1,7,10,11],[2,6,9,12]]],    // 3,4,5,8 bye
    [[[3,5,9,12],[4,8,10,11]]],    // 1,2,6,7 bye
    [[[1,5,11,8],[2,7,12,10]]],    // 3,4,6,9 bye
  ],

  16: [
    // 16 players = 2 rinks, 5 rounds
    [[[1,2,3,4],[5,6,7,8]], [[9,10,11,12],[13,14,15,16]]],
    [[[1,6,12,15],[4,7,9,16]], [[2,5,11,14],[3,8,10,13]]],
    [[[1,7,11,13],[2,8,12,16]], [[3,5,9,15],[4,6,10,14]]],
    [[[1,8,9,14],[3,6,12,13]], [[2,7,10,15],[4,5,11,16]]],
    [[[1,5,10,16],[2,6,9,13]], [[3,7,12,14],[4,8,11,15]]],
  ],

  20: [
    // 20 players = 2 rinks + 4 bye per round, 5 rounds
    [[[1,2,3,4],[5,6,7,8]], [[9,10,11,12],[13,14,15,16]]],    // 17,18,19,20 bye
    [[[1,6,11,20],[4,7,14,17]], [[2,5,12,19],[3,8,13,18]]],    // 9,10,15,16 bye
    [[[1,8,13,18],[3,5,10,19]], [[2,7,16,17],[4,6,15,20]]],    // 9,11,12,14 bye
    [[[1,7,15,19],[4,10,13,20]], [[3,6,16,17],[8,9,12,18]]],   // 2,5,11,14 bye
    [[[2,10,14,18],[3,9,15,20]], [[4,6,11,19],[5,8,16,17]]],   // 1,7,12,13 bye
  ],

  24: [
    // 24 players = 3 rinks, 7 rounds
    [[[1,2,3,4],[5,6,7,8]], [[9,10,11,12],[13,14,15,16]], [[17,18,19,20],[21,22,23,24]]],
    [[[1,6,15,20],[4,7,18,21]], [[2,5,16,19],[3,8,17,22]], [[9,14,23,24],[12,13,18,21]]],
    [[[1,8,13,24],[2,7,14,23]], [[3,6,11,22],[4,5,12,21]], [[9,16,19,18],[10,15,20,17]]],
    [[[1,14,17,22],[4,11,20,23]], [[2,13,18,21],[3,12,19,24]], [[5,10,15,24],[6,9,16,23]]],
    [[[1,12,19,22],[2,11,20,21]], [[5,8,15,18],[6,7,16,17]], [[3,10,13,24],[4,9,14,23]]],
    [[[1,10,17,24],[3,8,19,22]], [[2,9,18,23],[4,7,20,21]], [[5,14,11,16],[6,13,12,15]]],
    [[[1,7,11,16],[2,8,12,15]], [[3,5,9,24],[4,6,10,23]], [[13,18,19,20],[14,17,21,22]]],
  ],
};

/**
 * Get supported player counts for Gavel Draw (fours only)
 */
export function getGavelSupportedCounts(): number[] {
  return Object.keys(GAVEL_TABLE)
    .map(Number)
    .sort((a, b) => a - b);
}

/**
 * Get the Gavel table for a given player count.
 * Returns null if not supported.
 */
export function getGavelTable(playerCount: number): GavelTable | null {
  return GAVEL_TABLE[playerCount] ?? null;
}
