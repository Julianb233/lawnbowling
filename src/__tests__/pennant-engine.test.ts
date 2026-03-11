import { describe, it, expect } from "vitest";
import {
  generateRoundRobinFixtures,
  calculateDivisionStandings,
  sortPennantStandings,
  validateFixtureSchedule,
  PENNANT_POINTS,
  type PennantStanding,
} from "@/lib/pennant-engine";
import type {
  PennantTeam,
  PennantFixture,
  PennantFixtureResult,
} from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────

function makeTeams(count: number): PennantTeam[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `team-${i + 1}`,
    division_id: "div-1",
    season_id: "season-1",
    name: `Team ${i + 1}`,
    club_id: null,
    venue_id: null,
    captain_id: `player-${i + 1}`,
    created_at: "2026-01-01T00:00:00Z",
  }));
}

function makeFixture(
  id: string,
  round: number,
  homeTeamId: string,
  awayTeamId: string
): PennantFixture {
  return {
    id,
    season_id: "season-1",
    division_id: "div-1",
    round,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    scheduled_at: null,
    venue: null,
    tournament_id: null,
    status: "completed",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

function makeResult(
  fixtureId: string,
  homeShots: number,
  awayShots: number,
  homeRinkWins: number,
  awayRinkWins: number,
  winnerTeamId: string | null
): PennantFixtureResult {
  return {
    id: `result-${fixtureId}`,
    fixture_id: fixtureId,
    home_rink_wins: homeRinkWins,
    away_rink_wins: awayRinkWins,
    home_shot_total: homeShots,
    away_shot_total: awayShots,
    winner_team_id: winnerTeamId,
    points_home: winnerTeamId === null ? 1 : winnerTeamId === "team-home" ? 2 : 0,
    points_away: winnerTeamId === null ? 1 : winnerTeamId === "team-away" ? 2 : 0,
    notes: null,
    recorded_by: "admin-1",
    created_at: "2026-01-01T00:00:00Z",
  };
}

// ─── generateRoundRobinFixtures ─────────────────────────────────

describe("generateRoundRobinFixtures", () => {
  it("returns empty array for fewer than 2 teams", () => {
    const teams = makeTeams(1);
    const fixtures = generateRoundRobinFixtures(teams, 7, "s1", "d1");
    expect(fixtures).toHaveLength(0);
  });

  it("generates correct number of fixtures for 4 teams over 3 rounds", () => {
    const teams = makeTeams(4);
    const fixtures = generateRoundRobinFixtures(teams, 3, "s1", "d1");
    // 4 teams -> 2 fixtures per round * 3 rounds = 6 fixtures
    expect(fixtures).toHaveLength(6);
  });

  it("generates correct number of fixtures for 8 teams over 7 rounds", () => {
    const teams = makeTeams(8);
    const fixtures = generateRoundRobinFixtures(teams, 7, "s1", "d1");
    // 8 teams -> 4 fixtures per round * 7 rounds = 28 fixtures
    expect(fixtures).toHaveLength(28);
  });

  it("ensures every team plays every other team exactly once in N-1 rounds (8 teams, 7 rounds)", () => {
    const teams = makeTeams(8);
    const fixtures = generateRoundRobinFixtures(teams, 7, "s1", "d1");

    // Check every pair appears exactly once
    const matchups = new Set<string>();
    for (const f of fixtures) {
      const key = [f.home_team_id, f.away_team_id].sort().join("-");
      expect(matchups.has(key)).toBe(false); // No duplicate matchups
      matchups.add(key);
    }

    // Total unique pairs for 8 teams = C(8,2) = 28
    expect(matchups.size).toBe(28);
  });

  it("ensures no team plays itself", () => {
    const teams = makeTeams(8);
    const fixtures = generateRoundRobinFixtures(teams, 7, "s1", "d1");
    for (const f of fixtures) {
      expect(f.home_team_id).not.toBe(f.away_team_id);
    }
  });

  it("ensures no team plays twice in the same round", () => {
    const teams = makeTeams(8);
    const fixtures = generateRoundRobinFixtures(teams, 7, "s1", "d1");

    for (let round = 1; round <= 7; round++) {
      const roundFixtures = fixtures.filter((f) => f.round === round);
      const teamsInRound = new Set<string>();
      for (const f of roundFixtures) {
        expect(teamsInRound.has(f.home_team_id)).toBe(false);
        expect(teamsInRound.has(f.away_team_id)).toBe(false);
        teamsInRound.add(f.home_team_id);
        teamsInRound.add(f.away_team_id);
      }
    }
  });

  it("handles odd number of teams (7 teams, 7 rounds)", () => {
    const teams = makeTeams(7);
    const fixtures = generateRoundRobinFixtures(teams, 7, "s1", "d1");
    // 7 teams (padded to 8) -> 3 fixtures per round (one team gets a bye) * 7 rounds = 21
    expect(fixtures).toHaveLength(21);

    // Each pair appears exactly once: C(7,2) = 21
    const matchups = new Set<string>();
    for (const f of fixtures) {
      const key = [f.home_team_id, f.away_team_id].sort().join("-");
      matchups.add(key);
    }
    expect(matchups.size).toBe(21);
  });

  it("handles 2 teams", () => {
    const teams = makeTeams(2);
    const fixtures = generateRoundRobinFixtures(teams, 1, "s1", "d1");
    expect(fixtures).toHaveLength(1);
    expect(fixtures[0].round).toBe(1);
  });

  it("generates double round-robin (14 rounds for 8 teams)", () => {
    const teams = makeTeams(8);
    const fixtures = generateRoundRobinFixtures(teams, 14, "s1", "d1");
    // 4 fixtures per round * 14 rounds = 56
    expect(fixtures).toHaveLength(56);

    // Each pair should appear exactly twice
    const matchupCounts = new Map<string, number>();
    for (const f of fixtures) {
      const key = [f.home_team_id, f.away_team_id].sort().join("-");
      matchupCounts.set(key, (matchupCounts.get(key) ?? 0) + 1);
    }
    for (const [, count] of matchupCounts) {
      expect(count).toBe(2);
    }
  });

  it("assigns correct season_id and division_id", () => {
    const teams = makeTeams(4);
    const fixtures = generateRoundRobinFixtures(teams, 3, "my-season", "my-division");
    for (const f of fixtures) {
      expect(f.season_id).toBe("my-season");
      expect(f.division_id).toBe("my-division");
    }
  });

  it("all fixtures start as scheduled status", () => {
    const teams = makeTeams(4);
    const fixtures = generateRoundRobinFixtures(teams, 3, "s1", "d1");
    for (const f of fixtures) {
      expect(f.status).toBe("scheduled");
    }
  });

  it("passes validation for 8 teams, 7 rounds", () => {
    const teams = makeTeams(8);
    const fixtures = generateRoundRobinFixtures(teams, 7, "s1", "d1");
    const validation = validateFixtureSchedule(fixtures, 8, 7);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("passes validation for 6 teams, 10 rounds", () => {
    const teams = makeTeams(6);
    const fixtures = generateRoundRobinFixtures(teams, 10, "s1", "d1");
    const validation = validateFixtureSchedule(fixtures, 6, 10);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("passes validation for 16 teams, 15 rounds", () => {
    const teams = makeTeams(16);
    const fixtures = generateRoundRobinFixtures(teams, 15, "s1", "d1");
    const validation = validateFixtureSchedule(fixtures, 16, 15);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("has reasonable home/away balance", () => {
    const teams = makeTeams(8);
    const fixtures = generateRoundRobinFixtures(teams, 14, "s1", "d1");

    const homeCount = new Map<string, number>();
    const awayCount = new Map<string, number>();
    for (const f of fixtures) {
      homeCount.set(f.home_team_id, (homeCount.get(f.home_team_id) ?? 0) + 1);
      awayCount.set(f.away_team_id, (awayCount.get(f.away_team_id) ?? 0) + 1);
    }

    // Each team should have close to equal home/away (7 each in 14 rounds)
    for (const team of teams) {
      const h = homeCount.get(team.id) ?? 0;
      const a = awayCount.get(team.id) ?? 0;
      expect(h + a).toBe(14); // total games
      // Allow some imbalance but should be close
      expect(Math.abs(h - a)).toBeLessThanOrEqual(3);
    }
  });
});

// ─── calculateDivisionStandings ─────────────────────────────────

describe("calculateDivisionStandings", () => {
  it("returns standings for all teams even with no results", () => {
    const teams = makeTeams(4);
    const standings = calculateDivisionStandings(teams, [], []);
    expect(standings).toHaveLength(4);
    for (const s of standings) {
      expect(s.played).toBe(0);
      expect(s.points).toBe(0);
    }
  });

  it("correctly awards 2 points for a win", () => {
    const teams = makeTeams(2);
    const fixture = makeFixture("f1", 1, "team-1", "team-2");
    const result = makeResult("f1", 50, 30, 3, 1, "team-1");

    const standings = calculateDivisionStandings(teams, [fixture], [result]);

    const team1 = standings.find((s) => s.teamId === "team-1")!;
    const team2 = standings.find((s) => s.teamId === "team-2")!;

    expect(team1.points).toBe(2);
    expect(team1.wins).toBe(1);
    expect(team1.losses).toBe(0);
    expect(team1.shotsFor).toBe(50);
    expect(team1.shotsAgainst).toBe(30);
    expect(team1.shotDifference).toBe(20);

    expect(team2.points).toBe(0);
    expect(team2.wins).toBe(0);
    expect(team2.losses).toBe(1);
    expect(team2.shotsFor).toBe(30);
    expect(team2.shotsAgainst).toBe(50);
    expect(team2.shotDifference).toBe(-20);
  });

  it("correctly awards 1 point each for a draw", () => {
    const teams = makeTeams(2);
    const fixture = makeFixture("f1", 1, "team-1", "team-2");
    const result = makeResult("f1", 40, 40, 2, 2, null); // draw

    const standings = calculateDivisionStandings(teams, [fixture], [result]);

    const team1 = standings.find((s) => s.teamId === "team-1")!;
    const team2 = standings.find((s) => s.teamId === "team-2")!;

    expect(team1.points).toBe(1);
    expect(team1.draws).toBe(1);
    expect(team2.points).toBe(1);
    expect(team2.draws).toBe(1);
  });

  it("sorts by points descending", () => {
    const teams = makeTeams(3);
    const fixtures = [
      makeFixture("f1", 1, "team-1", "team-2"),
      makeFixture("f2", 1, "team-3", "team-1"),
      makeFixture("f3", 2, "team-2", "team-3"),
    ];
    const results = [
      makeResult("f1", 50, 30, 3, 1, "team-1"), // team-1 wins
      makeResult("f2", 20, 60, 1, 3, "team-1"), // team-1 wins (as away)
      makeResult("f3", 45, 25, 3, 1, "team-2"), // team-2 wins
    ];

    const standings = calculateDivisionStandings(teams, fixtures, results);

    // team-1: 2 wins = 4 points
    // team-2: 1 win, 1 loss = 2 points
    // team-3: 0 wins, 2 losses = 0 points
    expect(standings[0].teamId).toBe("team-1");
    expect(standings[0].points).toBe(4);
    expect(standings[1].teamId).toBe("team-2");
    expect(standings[1].points).toBe(2);
    expect(standings[2].teamId).toBe("team-3");
    expect(standings[2].points).toBe(0);
  });

  it("uses shot difference as tiebreaker", () => {
    const teams = makeTeams(2);
    const fixtures = [
      makeFixture("f1", 1, "team-1", "team-2"),
      makeFixture("f2", 2, "team-2", "team-1"),
    ];
    const results = [
      makeResult("f1", 50, 30, 3, 1, "team-1"), // team-1 wins by 20
      makeResult("f2", 35, 30, 2, 2, "team-2"), // team-2 wins by 5
    ];

    const standings = calculateDivisionStandings(teams, fixtures, results);

    // Both have 2 points (1 win each)
    // team-1: SF=80, SA=65, SD=+15
    // team-2: SF=65, SA=80, SD=-15
    expect(standings[0].teamId).toBe("team-1");
    expect(standings[1].teamId).toBe("team-2");
  });

  it("assigns correct position numbers", () => {
    const teams = makeTeams(4);
    const standings = calculateDivisionStandings(teams, [], []);
    for (let i = 0; i < standings.length; i++) {
      expect(standings[i].position).toBe(i + 1);
    }
  });

  it("tracks rink wins and losses", () => {
    const teams = makeTeams(2);
    const fixture = makeFixture("f1", 1, "team-1", "team-2");
    const result = makeResult("f1", 50, 30, 3, 1, "team-1");

    const standings = calculateDivisionStandings(teams, [fixture], [result]);

    const team1 = standings.find((s) => s.teamId === "team-1")!;
    expect(team1.rinkWins).toBe(3);
    expect(team1.rinkLosses).toBe(1);

    const team2 = standings.find((s) => s.teamId === "team-2")!;
    expect(team2.rinkWins).toBe(1);
    expect(team2.rinkLosses).toBe(3);
  });

  it("ignores fixtures without results", () => {
    const teams = makeTeams(2);
    const fixtures = [
      makeFixture("f1", 1, "team-1", "team-2"),
      makeFixture("f2", 2, "team-2", "team-1"), // no result
    ];
    const results = [
      makeResult("f1", 50, 30, 3, 1, "team-1"),
    ];

    const standings = calculateDivisionStandings(teams, fixtures, results);
    const team1 = standings.find((s) => s.teamId === "team-1")!;
    expect(team1.played).toBe(1);
  });
});

// ─── sortPennantStandings ───────────────────────────────────────

describe("sortPennantStandings", () => {
  it("sorts by points first", () => {
    const standings: PennantStanding[] = [
      { teamId: "a", teamName: "A", clubId: null, played: 1, wins: 0, draws: 0, losses: 1, shotsFor: 50, shotsAgainst: 30, shotDifference: 20, rinkWins: 3, rinkLosses: 1, points: 0, position: 0 },
      { teamId: "b", teamName: "B", clubId: null, played: 1, wins: 1, draws: 0, losses: 0, shotsFor: 30, shotsAgainst: 50, shotDifference: -20, rinkWins: 1, rinkLosses: 3, points: 2, position: 0 },
    ];

    const sorted = sortPennantStandings(standings);
    expect(sorted[0].teamId).toBe("b");
    expect(sorted[1].teamId).toBe("a");
  });

  it("uses shot difference when points are equal", () => {
    const standings: PennantStanding[] = [
      { teamId: "a", teamName: "A", clubId: null, played: 2, wins: 1, draws: 0, losses: 1, shotsFor: 60, shotsAgainst: 70, shotDifference: -10, rinkWins: 3, rinkLosses: 3, points: 2, position: 0 },
      { teamId: "b", teamName: "B", clubId: null, played: 2, wins: 1, draws: 0, losses: 1, shotsFor: 80, shotsAgainst: 60, shotDifference: 20, rinkWins: 3, rinkLosses: 3, points: 2, position: 0 },
    ];

    const sorted = sortPennantStandings(standings);
    expect(sorted[0].teamId).toBe("b");
  });

  it("assigns sequential position numbers", () => {
    const standings: PennantStanding[] = [
      { teamId: "c", teamName: "C", clubId: null, played: 0, wins: 0, draws: 0, losses: 0, shotsFor: 0, shotsAgainst: 0, shotDifference: 0, rinkWins: 0, rinkLosses: 0, points: 0, position: 0 },
      { teamId: "a", teamName: "A", clubId: null, played: 0, wins: 0, draws: 0, losses: 0, shotsFor: 0, shotsAgainst: 0, shotDifference: 0, rinkWins: 0, rinkLosses: 0, points: 4, position: 0 },
      { teamId: "b", teamName: "B", clubId: null, played: 0, wins: 0, draws: 0, losses: 0, shotsFor: 0, shotsAgainst: 0, shotDifference: 0, rinkWins: 0, rinkLosses: 0, points: 2, position: 0 },
    ];

    const sorted = sortPennantStandings(standings);
    expect(sorted[0].position).toBe(1);
    expect(sorted[1].position).toBe(2);
    expect(sorted[2].position).toBe(3);
  });
});

// ─── PENNANT_POINTS ─────────────────────────────────────────────

describe("PENNANT_POINTS", () => {
  it("has correct point values", () => {
    expect(PENNANT_POINTS.win).toBe(2);
    expect(PENNANT_POINTS.draw).toBe(1);
    expect(PENNANT_POINTS.loss).toBe(0);
  });
});

// ─── validateFixtureSchedule ────────────────────────────────────

describe("validateFixtureSchedule", () => {
  it("detects a team playing itself", () => {
    const fixtures = [{
      season_id: "s1",
      division_id: "d1",
      round: 1,
      home_team_id: "team-1",
      away_team_id: "team-1",
      scheduled_at: null,
      venue: null,
      tournament_id: null,
      status: "scheduled" as const,
    }];
    const result = validateFixtureSchedule(fixtures, 2, 1);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
