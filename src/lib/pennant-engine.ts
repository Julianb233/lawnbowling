/**
 * Pennant Engine -- Pure calculation module for season & pennant tracking.
 *
 * All functions are pure (no DB calls) so they can be unit-tested.
 * Provides:
 *   - generateRoundRobinFixtures: balanced home/away schedule using the circle method
 *   - calculateDivisionStandings: ladder sorted by points then shot difference
 */

import type {
  PennantTeam,
  PennantFixture,
  PennantFixtureResult,
} from "./types";

// ─── Pennant Standing ─────────────────────────────────────────────
// Extends the concept from tournament-engine Standing but team-scoped.

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

// ─── Points System ────────────────────────────────────────────────

export const PENNANT_POINTS = {
  win: 2,
  draw: 1,
  loss: 0,
} as const;

// ─── Round-Robin Fixture Generation (Circle Method) ───────────────

/**
 * Generate a balanced round-robin fixture schedule using the standard
 * circle method (also known as the polygon scheduling algorithm).
 *
 * For N teams:
 *   - If N is odd, add a BYE team to make it even.
 *   - In each round, fix team[0] and rotate the rest.
 *   - Produces N-1 rounds where every team plays every other team exactly once.
 *   - Alternates home/away assignment each round for balance.
 *
 * If `rounds` > N-1, cycles through the schedule again with swapped home/away.
 *
 * @param teams - Array of PennantTeam objects in the division
 * @param rounds - Total number of rounds to generate
 * @param seasonId - Season ID for the fixtures
 * @param divisionId - Division ID for the fixtures
 * @returns Array of PennantFixture objects (without IDs — caller assigns those)
 */
export function generateRoundRobinFixtures(
  teams: PennantTeam[],
  rounds: number,
  seasonId: string,
  divisionId: string
): Omit<PennantFixture, "id" | "created_at" | "updated_at">[] {
  if (teams.length < 2) return [];

  const n = teams.length;
  const isOdd = n % 2 === 1;

  // Create the team ID list. If odd, add a sentinel BYE team.
  const teamIds: (string | null)[] = teams.map((t) => t.id);
  if (isOdd) {
    teamIds.push(null); // BYE
  }

  const totalTeams = teamIds.length;
  const roundsInOneCycle = totalTeams - 1;

  // Build the rotation array (all except the fixed first element)
  const fixed = teamIds[0];
  const rotating = teamIds.slice(1);

  const fixtures: Omit<PennantFixture, "id" | "created_at" | "updated_at">[] = [];

  // Track home/away counts for balance
  const homeCount = new Map<string, number>();
  const awayCount = new Map<string, number>();
  for (const tid of teamIds) {
    if (tid !== null) {
      homeCount.set(tid, 0);
      awayCount.set(tid, 0);
    }
  }

  for (let round = 0; round < rounds; round++) {
    const cycleRound = round % roundsInOneCycle;

    // Rotate the array by cycleRound positions
    const rotated = [
      ...rotating.slice(cycleRound),
      ...rotating.slice(0, cycleRound),
    ];

    // Build pairs: fixed vs rotated[0], rotated[1] vs rotated[last], etc.
    const roundTeams: (string | null)[] = [fixed, ...rotated];
    const pairCount = totalTeams / 2;

    for (let p = 0; p < pairCount; p++) {
      const team1 = roundTeams[p];
      const team2 = roundTeams[totalTeams - 1 - p];

      // Skip BYE fixtures
      if (team1 === null || team2 === null) continue;

      // Decide home/away to balance: whichever team has fewer home games gets home.
      // Ties broken by alternating based on round parity.
      const t1Home = homeCount.get(team1) ?? 0;
      const t2Home = homeCount.get(team2) ?? 0;
      const t1Away = awayCount.get(team1) ?? 0;
      const t2Away = awayCount.get(team2) ?? 0;

      let homeTeamId: string;
      let awayTeamId: string;

      if (t1Home - t1Away < t2Home - t2Away) {
        // team1 has relatively fewer home games
        homeTeamId = team1;
        awayTeamId = team2;
      } else if (t2Home - t2Away < t1Home - t1Away) {
        // team2 has relatively fewer home games
        homeTeamId = team2;
        awayTeamId = team1;
      } else {
        // Tied — alternate based on round + pair index
        if ((round + p) % 2 === 0) {
          homeTeamId = team1;
          awayTeamId = team2;
        } else {
          homeTeamId = team2;
          awayTeamId = team1;
        }
      }

      homeCount.set(homeTeamId, (homeCount.get(homeTeamId) ?? 0) + 1);
      awayCount.set(awayTeamId, (awayCount.get(awayTeamId) ?? 0) + 1);

      fixtures.push({
        season_id: seasonId,
        division_id: divisionId,
        round: round + 1,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        scheduled_at: null,
        venue: null,
        tournament_id: null,
        status: "scheduled",
      });
    }
  }

  return fixtures;
}

// ─── Division Standings Calculation ───────────────────────────────

/**
 * Calculate the division standings ladder from fixtures and their results.
 *
 * Points system:
 *   - Win:  2 points
 *   - Draw: 1 point
 *   - Loss: 0 points
 *
 * Sort order:
 *   1. Points (descending)
 *   2. Shot difference (descending)
 *   3. Shots for (descending)
 *   4. Rink wins (descending)
 *
 * @param teams - All teams in the division
 * @param fixtures - All fixtures for this division
 * @param results - All recorded results, keyed by fixture_id
 * @returns Sorted array of PennantStanding
 */
export function calculateDivisionStandings(
  teams: PennantTeam[],
  fixtures: PennantFixture[],
  results: PennantFixtureResult[]
): PennantStanding[] {
  // Build a results map keyed by fixture_id
  const resultsMap = new Map<string, PennantFixtureResult>();
  for (const r of results) {
    resultsMap.set(r.fixture_id, r);
  }

  // Initialize standings for all teams
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

  // Process each completed fixture
  for (const fixture of fixtures) {
    const result = resultsMap.get(fixture.id);
    if (!result) continue;

    const home = standingsMap.get(fixture.home_team_id);
    const away = standingsMap.get(fixture.away_team_id);
    if (!home || !away) continue;

    // Increment played
    home.played++;
    away.played++;

    // Shots
    home.shotsFor += result.home_shot_total;
    home.shotsAgainst += result.away_shot_total;
    away.shotsFor += result.away_shot_total;
    away.shotsAgainst += result.home_shot_total;

    // Rink wins
    home.rinkWins += result.home_rink_wins;
    home.rinkLosses += result.away_rink_wins;
    away.rinkWins += result.away_rink_wins;
    away.rinkLosses += result.home_rink_wins;

    // Points: determine winner
    if (result.winner_team_id === fixture.home_team_id) {
      home.wins++;
      home.points += PENNANT_POINTS.win;
      away.losses++;
      away.points += PENNANT_POINTS.loss;
    } else if (result.winner_team_id === fixture.away_team_id) {
      away.wins++;
      away.points += PENNANT_POINTS.win;
      home.losses++;
      home.points += PENNANT_POINTS.loss;
    } else {
      // Draw (winner_team_id is null)
      home.draws++;
      home.points += PENNANT_POINTS.draw;
      away.draws++;
      away.points += PENNANT_POINTS.draw;
    }
  }

  // Calculate shot difference and sort
  const standings = Array.from(standingsMap.values());
  for (const s of standings) {
    s.shotDifference = s.shotsFor - s.shotsAgainst;
  }

  return sortPennantStandings(standings);
}

/**
 * Sort standings by:
 *   1. Points (desc)
 *   2. Shot difference (desc)
 *   3. Shots for (desc)
 *   4. Rink wins (desc)
 * Then assign position numbers.
 */
export function sortPennantStandings(standings: PennantStanding[]): PennantStanding[] {
  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.shotDifference !== a.shotDifference) return b.shotDifference - a.shotDifference;
    if (b.shotsFor !== a.shotsFor) return b.shotsFor - a.shotsFor;
    return b.rinkWins - a.rinkWins;
  });

  // Assign positions
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].position = i + 1;
  }

  return sorted;
}

// ─── Utility: Validate fixture schedule ───────────────────────────

/**
 * Validate that a generated schedule is correct:
 *   - Every pair of teams plays exactly the expected number of times
 *   - No team plays itself
 *   - Each round has the correct number of fixtures
 */
export function validateFixtureSchedule(
  fixtures: Omit<PennantFixture, "id" | "created_at" | "updated_at">[],
  teamCount: number,
  rounds: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check no team plays itself
  for (const f of fixtures) {
    if (f.home_team_id === f.away_team_id) {
      errors.push(`Round ${f.round}: team ${f.home_team_id} plays itself`);
    }
  }

  // Check matchup counts
  const matchupCounts = new Map<string, number>();
  for (const f of fixtures) {
    const key = [f.home_team_id, f.away_team_id].sort().join("-");
    matchupCounts.set(key, (matchupCounts.get(key) ?? 0) + 1);
  }

  // For round-robin: in (N-1) rounds, each pair plays once.
  // For multiple cycles, pairs play proportionally.
  const maxRoundsInOneCycle = teamCount % 2 === 0 ? teamCount - 1 : teamCount;
  const fullCycles = Math.floor(rounds / maxRoundsInOneCycle);
  const remainderRounds = rounds % maxRoundsInOneCycle;

  // Each pair should play fullCycles times, possibly +1 for remainder rounds
  for (const [key, count] of matchupCounts) {
    if (count < fullCycles || count > fullCycles + 1) {
      errors.push(`Matchup ${key} played ${count} times (expected ${fullCycles} or ${fullCycles + 1})`);
    }
  }

  // Check each round has correct number of fixtures
  const roundCounts = new Map<number, number>();
  for (const f of fixtures) {
    roundCounts.set(f.round, (roundCounts.get(f.round) ?? 0) + 1);
  }

  const expectedPerRound = Math.floor(teamCount / 2);
  for (const [round, count] of roundCounts) {
    if (count !== expectedPerRound) {
      errors.push(`Round ${round}: has ${count} fixtures, expected ${expectedPerRound}`);
    }
  }

  // Check no team plays twice in the same round
  for (let r = 1; r <= rounds; r++) {
    const roundFixtures = fixtures.filter((f) => f.round === r);
    const teamsInRound = new Set<string>();
    for (const f of roundFixtures) {
      if (teamsInRound.has(f.home_team_id)) {
        errors.push(`Round ${r}: team ${f.home_team_id} plays more than once`);
      }
      if (teamsInRound.has(f.away_team_id)) {
        errors.push(`Round ${r}: team ${f.away_team_id} plays more than once`);
      }
      teamsInRound.add(f.home_team_id);
      teamsInRound.add(f.away_team_id);
    }
  }

  return { valid: errors.length === 0, errors };
}
