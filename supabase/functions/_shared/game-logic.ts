/**
 * Game Logic — Pure calculation functions for Supabase Edge Functions.
 *
 * Ported from src/lib/tournament-engine.ts, src/lib/elo.ts,
 * src/lib/pennant-engine.ts. All functions are pure (no DB calls).
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

export interface BowlsEloInput {
  position: string;
  playerRating: number;
  opponentRating: number;
  result: 0 | 0.5 | 1;
  shotDifferential: number;
  endsWon: number;
  endsPlayed: number;
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

// ─── Score Validation ────────────────────────────────────────────────

const MAX_SCORE_PER_END = 9;
const MAX_ENDS = 30;

export function validateScores(
  scores: unknown
): { valid: boolean; parsed: number[]; error?: string } {
  if (!Array.isArray(scores)) return { valid: true, parsed: [] };
  if (scores.length > MAX_ENDS) {
    return { valid: false, parsed: [], error: `Cannot exceed ${MAX_ENDS} ends` };
  }
  const parsed: number[] = [];
  for (const s of scores) {
    const n = Number(s);
    if (
      !Number.isFinite(n) ||
      n < 0 ||
      n > MAX_SCORE_PER_END ||
      !Number.isInteger(n)
    ) {
      return {
        valid: false,
        parsed: [],
        error: `Scores must be integers between 0 and ${MAX_SCORE_PER_END}`,
      };
    }
    parsed.push(n);
  }
  return { valid: true, parsed };
}

// ─── Bowls Result Calculation ────────────────────────────────────────

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

// ─── Match Result ────────────────────────────────────────────────────

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

// ─── ELO Calculations ───────────────────────────────────────────────

const K_FACTOR = 32;

export function calculateElo(
  winnerRating: number,
  loserRating: number
): { newWinnerRating: number; newLoserRating: number } {
  const expectedWinner =
    1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser =
    1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  const newWinnerRating =
    Math.round((winnerRating + K_FACTOR * (1 - expectedWinner)) * 100) / 100;
  const newLoserRating =
    Math.round((loserRating + K_FACTOR * (0 - expectedLoser)) * 100) / 100;

  return { newWinnerRating, newLoserRating };
}

const BOWLS_K_FACTORS: Record<string, number> = {
  skip: 40,
  vice: 36,
  second: 32,
  lead: 28,
  singles: 36,
};

export function calculateBowlsElo(input: BowlsEloInput): number {
  const { position, playerRating, opponentRating, result, shotDifferential } =
    input;
  const baseK = BOWLS_K_FACTORS[position] ?? 32;
  const marginMultiplier = Math.min(
    1 + Math.log(1 + Math.abs(shotDifferential)) / 10,
    1.5
  );
  const effectiveK = baseK * (result === 0.5 ? 1 : marginMultiplier);
  const expected =
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  return (
    Math.round((playerRating + effectiveK * (result - expected)) * 100) / 100
  );
}

export function getRatingTier(rating: number): string {
  if (rating >= 1800) return "expert";
  if (rating >= 1400) return "advanced";
  if (rating >= 1100) return "intermediate";
  return "beginner";
}

// ─── Standings ───────────────────────────────────────────────────────

export function sortStandings(standings: Standing[]): Standing[] {
  return [...standings].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.shotDifference !== a.shotDifference)
      return b.shotDifference - a.shotDifference;
    if (b.endsWon !== a.endsWon) return b.endsWon - a.endsWon;
    return b.pointsFor - a.pointsFor;
  });
}

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

export function generateSeededDraw(
  playerIds: string[],
  previousOpponents?: Record<string, string[]>
): DrawPairing[] {
  const n = playerIds.length;
  if (n < 2) return [];

  const pairings: DrawPairing[] = [];
  const paired = new Set<string>();
  const ordered = [...playerIds];

  // Convert to Sets for lookup (Edge Function receives JSON, not Map)
  const prevOppsMap = new Map<string, Set<string>>();
  if (previousOpponents) {
    for (const [key, opps] of Object.entries(previousOpponents)) {
      prevOppsMap.set(key, new Set(opps));
    }
  }

  if (prevOppsMap.size > 0) {
    for (let i = 0; i < ordered.length; i++) {
      if (paired.has(ordered[i])) continue;
      const pid = ordered[i];
      paired.add(pid);
      const prevOpps = prevOppsMap.get(pid) ?? new Set();

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
        pairings.push({
          player1Id: pid,
          player2Id: null,
          matchNumber: pairings.length + 1,
        });
      }
    }
  } else {
    const half = Math.floor(n / 2);
    for (let i = 0; i < half; i++) {
      pairings.push({
        player1Id: ordered[i],
        player2Id: ordered[n - 1 - i],
        matchNumber: i + 1,
      });
    }
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

// ─── Bracket Generation ─────────────────────────────────────────────

export function generateSingleEliminationBracket(
  seededPlayerIds: string[]
): BracketMatch[] {
  const n = seededPlayerIds.length;
  if (n < 2) return [];

  const totalRounds = Math.ceil(Math.log2(n));
  const bracketSize = Math.pow(2, totalRounds);
  const matches: BracketMatch[] = [];

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

  const round1 = matches.filter((m) => m.round === 1);
  const round2 = matches.filter((m) => m.round === 2);
  for (const m of round1) {
    if (m.winnerId && round2.length > 0) {
      const nextMatchIdx = Math.ceil(m.matchNumber / 2) - 1;
      if (nextMatchIdx < round2.length) {
        const slot = m.matchNumber % 2 === 1 ? "player1Id" : "player2Id";
        round2[nextMatchIdx][slot] = m.winnerId;
      }
    }
  }

  return matches;
}

// ─── Pennant Standings ───────────────────────────────────────────────

const PENNANT_POINTS = { win: 2, draw: 1, loss: 0 } as const;

interface PennantTeamInput {
  id: string;
  name: string;
  club_id: string | null;
}

interface PennantFixtureInput {
  id: string;
  round: number;
  home_team_id: string;
  away_team_id: string;
}

interface PennantFixtureResultInput {
  fixture_id: string;
  home_rink_wins: number;
  away_rink_wins: number;
  home_shot_total: number;
  away_shot_total: number;
  winner_team_id: string | null;
}

export function calculateDivisionStandings(
  teams: PennantTeamInput[],
  fixtures: PennantFixtureInput[],
  results: PennantFixtureResultInput[]
): PennantStanding[] {
  const resultsMap = new Map<string, PennantFixtureResultInput>();
  for (const r of results) {
    resultsMap.set(r.fixture_id, r);
  }

  const standingsMap = new Map<string, PennantStanding>();
  for (const team of teams) {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      clubId: team.club_id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      shotsFor: 0,
      shotsAgainst: 0,
      shotDifference: 0,
      rinkWins: 0,
      rinkLosses: 0,
      points: 0,
      position: 0,
    });
  }

  for (const fixture of fixtures) {
    const result = resultsMap.get(fixture.id);
    if (!result) continue;

    const home = standingsMap.get(fixture.home_team_id);
    const away = standingsMap.get(fixture.away_team_id);
    if (!home || !away) continue;

    home.played++;
    away.played++;

    home.shotsFor += result.home_shot_total;
    home.shotsAgainst += result.away_shot_total;
    away.shotsFor += result.away_shot_total;
    away.shotsAgainst += result.home_shot_total;

    home.rinkWins += result.home_rink_wins;
    home.rinkLosses += result.away_rink_wins;
    away.rinkWins += result.away_rink_wins;
    away.rinkLosses += result.home_rink_wins;

    if (result.winner_team_id === fixture.home_team_id) {
      home.wins++;
      home.points += PENNANT_POINTS.win;
      away.losses++;
    } else if (result.winner_team_id === fixture.away_team_id) {
      away.wins++;
      away.points += PENNANT_POINTS.win;
      home.losses++;
    } else {
      home.draws++;
      home.points += PENNANT_POINTS.draw;
      away.draws++;
      away.points += PENNANT_POINTS.draw;
    }
  }

  const standings = Array.from(standingsMap.values());
  for (const s of standings) {
    s.shotDifference = s.shotsFor - s.shotsAgainst;
  }

  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.shotDifference !== a.shotDifference)
      return b.shotDifference - a.shotDifference;
    if (b.shotsFor !== a.shotsFor) return b.shotsFor - a.shotsFor;
    return b.rinkWins - a.rinkWins;
  });

  for (let i = 0; i < sorted.length; i++) {
    sorted[i].position = i + 1;
  }

  return sorted;
}
