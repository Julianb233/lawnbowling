/**
 * Tournament Engine — Pure logic for results, draws, and progression.
 *
 * All functions are pure (no DB calls) so they can be unit-tested.
 * API routes call these functions with data fetched from the DB.
 */

// ─── Types ───────────────────────────────────────────────────────────

export type MatchFormat = "single" | "best_of_3" | "best_of_5";

export interface GameScore {
  player1Score: number;
  player2Score: number;
}

export interface MatchResult {
  winnerId: string | null;
  loserId: string | null;
  isDraw: boolean;
  gamesWon: { player1: number; player2: number };
  totalScore: { player1: number; player2: number };
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
  player2Id: string | null; // null = bye
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

// ─── Results Calculation ─────────────────────────────────────────────

/**
 * Determine the winner of a match given one or more game scores.
 * Supports single-game, best-of-3, and best-of-5 formats.
 */
export function calculateMatchResult(
  player1Id: string,
  player2Id: string,
  games: GameScore[],
  format: MatchFormat = "single"
): MatchResult {
  const gamesNeeded =
    format === "best_of_5" ? 3 : format === "best_of_3" ? 2 : 1;

  let p1GamesWon = 0;
  let p2GamesWon = 0;
  let p1Total = 0;
  let p2Total = 0;

  for (const game of games) {
    p1Total += game.player1Score;
    p2Total += game.player2Score;
    if (game.player1Score > game.player2Score) p1GamesWon++;
    else if (game.player2Score > game.player1Score) p2GamesWon++;
  }

  let winnerId: string | null = null;
  let loserId: string | null = null;
  let isDraw = false;

  if (p1GamesWon >= gamesNeeded) {
    winnerId = player1Id;
    loserId = player2Id;
  } else if (p2GamesWon >= gamesNeeded) {
    winnerId = player2Id;
    loserId = player1Id;
  } else if (format === "single" && games.length > 0) {
    // Single game with equal scores = draw
    isDraw = p1Total === p2Total;
    if (p1Total > p2Total) {
      winnerId = player1Id;
      loserId = player2Id;
    } else if (p2Total > p1Total) {
      winnerId = player2Id;
      loserId = player1Id;
    }
  }

  return {
    winnerId,
    loserId,
    isDraw,
    gamesWon: { player1: p1GamesWon, player2: p2GamesWon },
    totalScore: { player1: p1Total, player2: p2Total },
  };
}

/**
 * Calculate lawn bowls result from end-by-end scores.
 * Returns winner, totals, and ends-won counts.
 */
export function calculateBowlsResult(
  teamAScores: number[],
  teamBScores: number[]
): {
  totalA: number;
  totalB: number;
  endsWonA: number;
  endsWonB: number;
  winner: "team_a" | "team_b" | "draw" | null;
  margin: number;
} {
  if (teamAScores.length !== teamBScores.length) {
    throw new Error("Score arrays must have equal length");
  }

  const totalA = teamAScores.reduce((s, v) => s + v, 0);
  const totalB = teamBScores.reduce((s, v) => s + v, 0);

  let endsWonA = 0;
  let endsWonB = 0;
  for (let i = 0; i < teamAScores.length; i++) {
    if (teamAScores[i] > teamBScores[i]) endsWonA++;
    else if (teamBScores[i] > teamAScores[i]) endsWonB++;
  }

  let winner: "team_a" | "team_b" | "draw" | null = null;
  if (teamAScores.length > 0) {
    if (totalA > totalB) winner = "team_a";
    else if (totalB > totalA) winner = "team_b";
    else winner = "draw";
  }

  return {
    totalA,
    totalB,
    endsWonA,
    endsWonB,
    winner,
    margin: Math.abs(totalA - totalB),
  };
}

// ─── Standings / Tiebreakers ─────────────────────────────────────────

/**
 * Sort standings using standard lawn bowls tiebreakers:
 * 1. Wins (desc)
 * 2. Shot difference (desc)
 * 3. Ends won (desc)
 * 4. Points for (desc)
 */
export function sortStandings(standings: Standing[]): Standing[] {
  return [...standings].sort((a, b) => {
    // 1. Wins
    if (b.wins !== a.wins) return b.wins - a.wins;
    // 2. Shot difference
    if (b.shotDifference !== a.shotDifference)
      return b.shotDifference - a.shotDifference;
    // 3. Ends won
    if (b.endsWon !== a.endsWon) return b.endsWon - a.endsWon;
    // 4. Points for
    return b.pointsFor - a.pointsFor;
  });
}

/**
 * Build standings from a list of rink results across rounds.
 */
export function buildStandings(
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
): Standing[] {
  const map = new Map<string, Standing>();

  function getOrCreate(playerId: string): Standing {
    let s = map.get(playerId);
    if (!s) {
      s = {
        playerId,
        wins: 0,
        losses: 0,
        draws: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        shotDifference: 0,
        endsWon: 0,
        gamesPlayed: 0,
      };
      map.set(playerId, s);
    }
    return s;
  }

  for (const r of results) {
    if (!r.isFinalized) continue;

    for (const pid of r.teamAPlayerIds) {
      const s = getOrCreate(pid);
      s.gamesPlayed++;
      s.pointsFor += r.totalA;
      s.pointsAgainst += r.totalB;
      s.shotDifference += r.totalA - r.totalB;
      s.endsWon += r.endsWonA;
      if (r.winner === "team_a") s.wins++;
      else if (r.winner === "team_b") s.losses++;
      else if (r.winner === "draw") s.draws++;
    }

    for (const pid of r.teamBPlayerIds) {
      const s = getOrCreate(pid);
      s.gamesPlayed++;
      s.pointsFor += r.totalB;
      s.pointsAgainst += r.totalA;
      s.shotDifference += r.totalB - r.totalA;
      s.endsWon += r.endsWonB;
      if (r.winner === "team_b") s.wins++;
      else if (r.winner === "team_a") s.losses++;
      else if (r.winner === "draw") s.draws++;
    }
  }

  return sortStandings(Array.from(map.values()));
}

// ─── Draw Generation ─────────────────────────────────────────────────

/**
 * Generate a seeded draw for a round, avoiding repeat matchups.
 *
 * @param playerIds - Ordered by seed (best first)
 * @param previousOpponents - Map of playerId → set of recent opponent IDs
 * @returns Array of pairings. If odd count, last player gets a bye.
 */
export function generateSeededDraw(
  playerIds: string[],
  previousOpponents?: Map<string, Set<string>>
): DrawPairing[] {
  const n = playerIds.length;
  if (n < 2) return [];

  const pairings: DrawPairing[] = [];
  const paired = new Set<string>();

  // Snake seeding: #1 vs #N, #2 vs #N-1, etc.
  // Then try to avoid recent opponents by swapping if possible.
  const ordered = [...playerIds];

  if (previousOpponents && previousOpponents.size > 0) {
    // Greedy pairing: top seed picks least-recently-matched opponent
    for (let i = 0; i < ordered.length; i++) {
      if (paired.has(ordered[i])) continue;

      const pid = ordered[i];
      paired.add(pid);

      const prevOpps = previousOpponents.get(pid) ?? new Set();

      // Find best opponent: lowest seed not yet paired, not a recent opponent
      let bestIdx = -1;
      let fallbackIdx = -1;

      for (let j = ordered.length - 1; j > i; j--) {
        if (paired.has(ordered[j])) continue;
        if (fallbackIdx === -1) fallbackIdx = j;
        if (!prevOpps.has(ordered[j])) {
          bestIdx = j;
          break;
        }
      }

      const oppIdx = bestIdx !== -1 ? bestIdx : fallbackIdx;
      if (oppIdx !== -1) {
        paired.add(ordered[oppIdx]);
        pairings.push({
          player1Id: pid,
          player2Id: ordered[oppIdx],
          matchNumber: pairings.length + 1,
        });
      } else {
        // Odd player out - bye
        pairings.push({
          player1Id: pid,
          player2Id: null,
          matchNumber: pairings.length + 1,
        });
      }
    }
  } else {
    // Standard snake seeding: #1 vs #N, #2 vs #N-1, etc.
    const half = Math.floor(n / 2);
    for (let i = 0; i < half; i++) {
      pairings.push({
        player1Id: ordered[i],
        player2Id: ordered[n - 1 - i],
        matchNumber: i + 1,
      });
    }

    // Bye for odd count
    if (n % 2 !== 0) {
      pairings.push({
        player1Id: ordered[half],
        player2Id: null,
        matchNumber: half + 1,
      });
    }
  }

  return pairings;
}

/**
 * Handle bye: the player with the bye automatically wins with a default score.
 * Returns the player ID who should advance.
 */
export function handleBye(pairing: DrawPairing): string | null {
  if (pairing.player2Id === null) return pairing.player1Id;
  if (pairing.player1Id === null) return pairing.player2Id;
  return null; // Not a bye
}

// ─── Single Elimination Bracket ──────────────────────────────────────

/**
 * Generate a single-elimination bracket.
 * Handles byes by auto-advancing players without opponents.
 */
export function generateSingleEliminationBracket(
  seededPlayerIds: string[]
): BracketMatch[] {
  const n = seededPlayerIds.length;
  if (n < 2) return [];

  const totalRounds = Math.ceil(Math.log2(n));
  const bracketSize = Math.pow(2, totalRounds);
  const matches: BracketMatch[] = [];

  // First round: standard seeding (#1 vs #N, #2 vs #N-1)
  let matchNumber = 1;
  for (let i = 0; i < bracketSize / 2; i++) {
    const p1 = seededPlayerIds[i] ?? null;
    const p2 = seededPlayerIds[bracketSize - 1 - i] ?? null;

    const isBye = (p1 && !p2) || (!p1 && p2);

    matches.push({
      round: 1,
      matchNumber: matchNumber++,
      player1Id: p1,
      player2Id: p2,
      winnerId: isBye ? (p1 ?? p2) : null,
      loserId: null,
      status: isBye ? "completed" : "pending",
      bracket: "winners",
    });
  }

  // Subsequent rounds (empty placeholders)
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    for (let m = 0; m < matchesInRound; m++) {
      matches.push({
        round,
        matchNumber: m + 1,
        player1Id: null,
        player2Id: null,
        winnerId: null,
        loserId: null,
        status: "pending",
        bracket: "winners",
      });
    }
  }

  // Auto-advance bye winners to round 2
  const round1 = matches.filter((m) => m.round === 1);
  const round2 = matches.filter((m) => m.round === 2);
  for (const m of round1) {
    if (m.winnerId && round2.length > 0) {
      const nextMatchIdx = Math.ceil(m.matchNumber / 2) - 1;
      if (nextMatchIdx < round2.length) {
        const slot =
          m.matchNumber % 2 === 1 ? "player1Id" : "player2Id";
        round2[nextMatchIdx][slot] = m.winnerId;
      }
    }
  }

  return matches;
}

// ─── Double Elimination Bracket ──────────────────────────────────────

/**
 * Generate a double-elimination bracket.
 * Players must lose twice to be eliminated.
 * Produces winners bracket, losers bracket, and grand final.
 */
export function generateDoubleEliminationBracket(
  seededPlayerIds: string[]
): BracketMatch[] {
  const n = seededPlayerIds.length;
  if (n < 2) return [];

  const totalWinnersRounds = Math.ceil(Math.log2(n));
  const bracketSize = Math.pow(2, totalWinnersRounds);
  const matches: BracketMatch[] = [];

  // ── Winners bracket (same as single elimination) ──
  let matchNumber = 1;
  for (let i = 0; i < bracketSize / 2; i++) {
    const p1 = seededPlayerIds[i] ?? null;
    const p2 = seededPlayerIds[bracketSize - 1 - i] ?? null;
    const isBye = (p1 && !p2) || (!p1 && p2);

    matches.push({
      round: 1,
      matchNumber: matchNumber++,
      player1Id: p1,
      player2Id: p2,
      winnerId: isBye ? (p1 ?? p2) : null,
      loserId: null,
      status: isBye ? "completed" : "pending",
      bracket: "winners",
    });
  }

  for (let round = 2; round <= totalWinnersRounds; round++) {
    const matchesInRound = Math.pow(2, totalWinnersRounds - round);
    for (let m = 0; m < matchesInRound; m++) {
      matches.push({
        round,
        matchNumber: m + 1,
        player1Id: null,
        player2Id: null,
        winnerId: null,
        loserId: null,
        status: "pending",
        bracket: "winners",
      });
    }
  }

  // ── Losers bracket ──
  // Losers bracket has (2 * (totalWinnersRounds - 1)) rounds.
  // Odd rounds: losers from winners bracket drop in.
  // Even rounds: within-losers matchups.
  const losersRounds = 2 * (totalWinnersRounds - 1);
  for (let lr = 1; lr <= losersRounds; lr++) {
    // Number of matches decreases as losers are eliminated
    const matchesInRound = Math.pow(
      2,
      totalWinnersRounds - 1 - Math.ceil(lr / 2)
    );
    for (let m = 0; m < Math.max(matchesInRound, 1); m++) {
      matches.push({
        round: lr,
        matchNumber: m + 1,
        player1Id: null,
        player2Id: null,
        winnerId: null,
        loserId: null,
        status: "pending",
        bracket: "losers",
      });
    }
  }

  // ── Grand Final ──
  matches.push({
    round: 1,
    matchNumber: 1,
    player1Id: null, // Winners bracket champion
    player2Id: null, // Losers bracket champion
    winnerId: null,
    loserId: null,
    status: "pending",
    bracket: "grand_final",
  });

  // Auto-advance bye winners
  const winnersR1 = matches.filter(
    (m) => m.bracket === "winners" && m.round === 1
  );
  const winnersR2 = matches.filter(
    (m) => m.bracket === "winners" && m.round === 2
  );
  for (const m of winnersR1) {
    if (m.winnerId && winnersR2.length > 0) {
      const nextMatchIdx = Math.ceil(m.matchNumber / 2) - 1;
      if (nextMatchIdx < winnersR2.length) {
        const slot = m.matchNumber % 2 === 1 ? "player1Id" : "player2Id";
        winnersR2[nextMatchIdx][slot] = m.winnerId;
      }
    }
  }

  return matches;
}

// ─── Tournament Progression ──────────────────────────────────────────

/**
 * Given a completed match in single elimination, determine where
 * the winner should be placed in the next round.
 */
export function getNextMatchSlot(
  matchNumber: number,
  currentRound: number
): {
  nextRound: number;
  nextMatchNumber: number;
  slot: "player1Id" | "player2Id";
} {
  return {
    nextRound: currentRound + 1,
    nextMatchNumber: Math.ceil(matchNumber / 2),
    slot: matchNumber % 2 === 1 ? "player1Id" : "player2Id",
  };
}

/**
 * Check if a tournament is complete.
 * For single elimination: final match is completed.
 * For round robin: all matches are completed.
 * For double elimination: grand final is completed.
 */
export function isTournamentComplete(
  matches: Array<{ status: string; bracket?: string }>
): boolean {
  if (matches.length === 0) return false;
  return matches.every((m) => m.status === "completed");
}

/**
 * Determine the tournament champion from completed matches.
 * Single elimination: winner of the final match.
 * Round robin: player with most wins (using tiebreakers).
 * Double elimination: winner of grand final.
 */
export function determineTournamentWinner(
  matches: Array<{
    round: number;
    winnerId: string | null;
    bracket?: string;
  }>,
  format: "single_elimination" | "double_elimination" | "round_robin",
  standings?: Standing[]
): string | null {
  if (format === "round_robin") {
    if (!standings || standings.length === 0) return null;
    const sorted = sortStandings(standings);
    return sorted[0].playerId;
  }

  if (format === "double_elimination") {
    const grandFinal = matches.find((m) => m.bracket === "grand_final");
    return grandFinal?.winnerId ?? null;
  }

  // Single elimination: find the final (highest round) match winner
  const maxRound = Math.max(...matches.map((m) => m.round));
  const finalMatch = matches.find((m) => m.round === maxRound);
  return finalMatch?.winnerId ?? null;
}

/**
 * Handle a forfeit: the non-forfeiting player wins.
 */
export function handleForfeit(
  matchPlayer1Id: string | null,
  matchPlayer2Id: string | null,
  forfeitingPlayerId: string
): { winnerId: string | null; loserId: string } {
  const winnerId =
    forfeitingPlayerId === matchPlayer1Id
      ? matchPlayer2Id
      : forfeitingPlayerId === matchPlayer2Id
        ? matchPlayer1Id
        : null;

  return { winnerId, loserId: forfeitingPlayerId };
}

/**
 * Determine player seeding for the next round based on current standings.
 * Players are ordered by wins (desc), then shot difference (desc).
 */
export function seedPlayersForNextRound(
  standings: Standing[]
): string[] {
  return sortStandings(standings).map((s) => s.playerId);
}
