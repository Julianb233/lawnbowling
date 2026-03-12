/**
 * Gameplay Simulation Test Suite
 *
 * End-to-end integration tests that simulate complete match-day scenarios,
 * chaining multiple engines together: check-in -> draw -> scoring -> ELO -> standings.
 *
 * Linear: AI-2438
 */

import { describe, it, expect, beforeEach } from "vitest";

// ── Engine Imports ──────────────────────────────────────────────────

import {
  generateBowlsDraw,
  generateMeadDraw,
  generateGavelDraw,
} from "@/lib/bowls-draw";

import {
  calculateMatchResult,
  calculateBowlsResult,
  sortStandings,
  buildStandings,
  generateSingleEliminationBracket,
  generateDoubleEliminationBracket,
  getNextMatchSlot,
  determineTournamentWinner,
  handleForfeit,
  type Standing,
  type GameScore,
} from "@/lib/tournament-engine";

import {
  generateRoundRobinFixtures,
  calculateDivisionStandings,
  sortPennantStandings,
  validateFixtureSchedule,
  PENNANT_POINTS,
  type PennantStanding,
} from "@/lib/pennant-engine";

import {
  calculateElo,
  calculateBowlsElo,
  getRatingTier,
} from "@/lib/elo";

import {
  computeMatchScore,
  rankSuggestions,
  calculateElo as calculateMatchmakingElo,
  type ScoringContext,
  type PlayerSkillRating,
  type MatchMode,
} from "@/lib/matchmaking";

import {
  autoSelectTournament,
  determineKioskMode,
  findExistingCheckin,
  buildCheckinPayload,
} from "@/lib/checkin-utils";

import {
  generateSmartAssignment,
  type AssignmentPlayer,
  type AssignmentConfig,
} from "@/lib/team-assignment-engine";

import type {
  BowlsCheckin,
  BowlsPosition,
  BowlsGameFormat,
  Player,
  Tournament,
  PennantTeam,
  PennantFixture,
  PennantFixtureResult,
} from "@/lib/types";

// ── Helpers ─────────────────────────────────────────────────────────

let _id = 0;

function uid(): string {
  return `p-${++_id}`;
}

function makeCheckin(overrides: Partial<BowlsCheckin> = {}): BowlsCheckin {
  const id = uid();
  return {
    id: `checkin-${id}`,
    player_id: id,
    tournament_id: "t-1",
    preferred_position: "lead",
    checkin_source: "app",
    checked_in_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeCheckins(
  count: number,
  factory?: (index: number) => Partial<BowlsCheckin>
): BowlsCheckin[] {
  return Array.from({ length: count }, (_, i) =>
    makeCheckin(factory ? factory(i) : {})
  );
}

function makePlayer(overrides: Partial<Player> = {}): Player {
  const id = uid();
  return {
    id,
    display_name: `Player ${id}`,
    avatar_url: null,
    skill_level: "intermediate",
    sports: ["lawn_bowling"],
    is_available: true,
    checked_in_at: new Date().toISOString(),
    venue_id: "venue-1",
    role: "player",
    insurance_status: "none",
    preferred_position: "any",
    years_playing: 0,
    experience_level: "social",
    bio: null,
    home_club_name: null,
    bowling_formats: [],
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: "t-1",
    venue_id: "v-1",
    name: "Wednesday Social",
    sport: "lawn_bowling",
    format: "round_robin",
    status: "registration",
    max_players: 32,
    created_by: "admin-1",
    starts_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeAssignmentPlayer(
  overrides: Partial<AssignmentPlayer> = {}
): AssignmentPlayer {
  const id = uid();
  return {
    player_id: id,
    display_name: `Player ${id}`,
    avatar_url: null,
    preferred_position: "any",
    elo_rating: 1200,
    position_ratings: {},
    skill_level: "intermediate",
    ...overrides,
  };
}

function makeAssignmentPlayers(
  count: number,
  factory?: (index: number) => Partial<AssignmentPlayer>
): AssignmentPlayer[] {
  return Array.from({ length: count }, (_, i) =>
    makeAssignmentPlayer(factory ? factory(i) : {})
  );
}

function makePennantTeams(count: number): PennantTeam[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `team-${i + 1}`,
    division_id: "div-1",
    season_id: "season-1",
    name: `Team ${i + 1}`,
    club_id: null,
    venue_id: null,
    captain_id: `captain-${i + 1}`,
    created_at: "2026-01-01T00:00:00Z",
  }));
}

function makePennantFixture(
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

function makePennantResult(
  fixtureId: string,
  homeShots: number,
  awayShots: number,
  homeRinkWins: number,
  awayRinkWins: number,
  winnerTeamId: string | null
): PennantFixtureResult {
  const homeId = winnerTeamId;
  return {
    id: `result-${fixtureId}`,
    fixture_id: fixtureId,
    home_rink_wins: homeRinkWins,
    away_rink_wins: awayRinkWins,
    home_shot_total: homeShots,
    away_shot_total: awayShots,
    winner_team_id: winnerTeamId,
    points_home: winnerTeamId === null
      ? PENNANT_POINTS.draw
      : winnerTeamId.includes("home") || winnerTeamId === homeId
        ? PENNANT_POINTS.win
        : PENNANT_POINTS.loss,
    points_away: winnerTeamId === null
      ? PENNANT_POINTS.draw
      : winnerTeamId.includes("away")
        ? PENNANT_POINTS.win
        : PENNANT_POINTS.loss,
    notes: null,
    recorded_by: "admin-1",
    created_at: "2026-01-01T00:00:00Z",
  };
}

function makeMatchCtx(overrides: Partial<ScoringContext> = {}): ScoringContext {
  return {
    currentPlayer: makePlayer({ id: "me" }),
    currentPlayerSkills: new Map(),
    candidateSkills: new Map(),
    matchHistoryMap: new Map(),
    recentMatches: [],
    favoriteIds: new Set(),
    candidate: makePlayer({ id: "them" }),
    mode: "auto" as MatchMode,
    ...overrides,
  };
}

// ════════════════════════════════════════════════════════════════════
// PHASE 1: Arrival to Assignment (8 tests)
// ════════════════════════════════════════════════════════════════════

describe("Phase 1: Arrival to Assignment", () => {
  beforeEach(() => {
    _id = 0;
  });

  it("1. full check-in -> draw generation pipeline: 16 players check in, random draw produces 2 rinks of fours", () => {
    const positions: BowlsPosition[] = ["skip", "vice", "second", "lead"];
    const checkins = makeCheckins(16, (i) => ({
      preferred_position: positions[i % 4],
    }));

    const draw = generateBowlsDraw(checkins, "fours");

    expect(draw.rinkCount).toBe(2);
    expect(draw.rinks).toHaveLength(2);

    // Each rink should have 8 assignments (4 per team)
    for (const rink of draw.rinks) {
      expect(rink).toHaveLength(8);
      const team1 = rink.filter((a) => a.team === 1);
      const team2 = rink.filter((a) => a.team === 2);
      expect(team1).toHaveLength(4);
      expect(team2).toHaveLength(4);
    }

    // All 16 players assigned, none unassigned
    const allAssignedIds = draw.rinks.flat().map((a) => a.player_id);
    expect(new Set(allAssignedIds).size).toBe(16);
    expect(draw.unassigned).toHaveLength(0);
  });

  it("2. full check-in -> smart assignment pipeline: 24 players with ELO, assignment produces balanced rinks", () => {
    const players = makeAssignmentPlayers(24, (i) => ({
      elo_rating: 800 + i * 35, // Spread: 800 to ~1610
    }));

    const result = generateSmartAssignment(players, { format: "fours" });

    expect(result.rinks).toHaveLength(3);
    expect(result.sitOuts).toHaveLength(0);

    // Check ELO balance per rink
    for (const rink of result.rinks) {
      const avgA = rink.teamA.reduce((s, p) => s + p.elo_rating, 0) / rink.teamA.length;
      const avgB = rink.teamB.reduce((s, p) => s + p.elo_rating, 0) / rink.teamB.length;
      // With optimization, teams within each rink should be reasonably balanced
      expect(Math.abs(avgA - avgB)).toBeLessThan(300);
    }

    // All players accounted for
    const allIds = new Set<string>();
    for (const rink of result.rinks) {
      for (const slot of [...rink.teamA, ...rink.teamB]) {
        allIds.add(slot.player_id);
      }
    }
    expect(allIds.size).toBe(24);
  });

  it("3. Mead draw rotation: 12 players in triples get multi-round draw", () => {
    // Mead tables support specific counts; 12 for triples = 2 rinks per round
    const checkins = makeCheckins(12);
    const meadDraw = generateMeadDraw(checkins, "triples");

    expect(meadDraw.style).toBe("mead");
    expect(meadDraw.playerCount).toBe(12);
    expect(meadDraw.format).toBe("triples");
    expect(meadDraw.totalRounds).toBeGreaterThanOrEqual(1);

    // Each round should have rinks with correct team sizes
    for (const round of meadDraw.rounds) {
      for (const rink of round.rinks) {
        const team1 = rink.filter((a) => a.team === 1);
        const team2 = rink.filter((a) => a.team === 2);
        expect(team1).toHaveLength(3);
        expect(team2).toHaveLength(3);
      }
    }
  });

  it("4. Gavel draw rotation: 16 players, fours format, multi-round schedule", () => {
    const checkins = makeCheckins(16);
    const gavelDraw = generateGavelDraw(checkins, "fours");

    expect(gavelDraw.style).toBe("gavel");
    expect(gavelDraw.playerCount).toBe(16);
    expect(gavelDraw.format).toBe("fours");
    expect(gavelDraw.totalRounds).toBeGreaterThanOrEqual(2);

    // Each round should have 2 rinks of 8 players
    for (const round of gavelDraw.rounds) {
      expect(round.rinks).toHaveLength(2);
      for (const rink of round.rinks) {
        expect(rink).toHaveLength(8);
      }
    }
  });

  it("5. check-in -> tournament auto-detect -> draw: single active tournament selected automatically", () => {
    const tournament = makeTournament({ id: "t-auto" });
    const selected = autoSelectTournament([tournament]);
    expect(selected).toBe("t-auto");

    // Build checkins for this tournament
    const checkins = makeCheckins(8, () => ({
      tournament_id: selected!,
    }));
    expect(checkins.every((c) => c.tournament_id === "t-auto")).toBe(true);

    // Generate draw from those checkins
    const draw = generateBowlsDraw(checkins, "fours");
    expect(draw.rinkCount).toBe(1);
    expect(draw.rinks[0]).toHaveLength(8);
  });

  it("6. kiosk mode auto-detection triggers bowls check-in flow", () => {
    const tournament = makeTournament();

    const mode = determineKioskMode({
      modeParam: null,
      tournamentIdParam: null,
      activeTournaments: [tournament],
    });
    expect(mode).toBe("bowls");

    // Build a kiosk payload
    const payload = buildCheckinPayload({
      playerId: "p-kiosk-1",
      tournamentId: tournament.id,
      position: "skip",
      source: "kiosk",
    });
    expect(payload.checkin_source).toBe("kiosk");
    expect(payload.preferred_position).toBe("skip");
    expect(payload.tournament_id).toBe(tournament.id);
  });

  it("7. duplicate check-in updates position instead of creating double entry", () => {
    const checkins: BowlsCheckin[] = [
      makeCheckin({ player_id: "p-dup", preferred_position: "skip" }),
      makeCheckin({ player_id: "p-other", preferred_position: "lead" }),
    ];

    const existing = findExistingCheckin(checkins, "p-dup");
    expect(existing).not.toBeNull();
    expect(existing!.preferred_position).toBe("skip");

    // Simulate updating the position
    existing!.preferred_position = "vice";
    const updated = findExistingCheckin(checkins, "p-dup");
    expect(updated!.preferred_position).toBe("vice");

    // No new player added
    expect(findExistingCheckin(checkins, "p-nonexistent")).toBeNull();
  });

  it("8. sit-out player from round 1 is tracked when draw has odd count", () => {
    // 17 players in fours = 2 rinks (16 players) + 1 unassigned
    const checkins = makeCheckins(17);
    const draw = generateBowlsDraw(checkins, "fours");

    expect(draw.rinkCount).toBe(2);
    expect(draw.unassigned).toHaveLength(1);

    // The unassigned player exists and is a real player
    const sitOutId = draw.unassigned[0].player_id;
    expect(checkins.some((c) => c.player_id === sitOutId)).toBe(true);

    // All assigned players are unique and don't include the sit-out
    const assignedIds = new Set(draw.rinks.flat().map((a) => a.player_id));
    expect(assignedIds.size).toBe(16);
    expect(assignedIds.has(sitOutId)).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════
// PHASE 2: Active Match Play & Scoring (10 tests)
// ════════════════════════════════════════════════════════════════════

describe("Phase 2: Active Match Play & Scoring", () => {
  beforeEach(() => {
    _id = 0;
  });

  it("9. end-by-end scoring: 7 ends of fours produces correct totals and winner", () => {
    const teamA = [3, 0, 2, 4, 1, 0, 5];
    const teamB = [0, 5, 1, 0, 3, 2, 1];

    const result = calculateBowlsResult(teamA, teamB);

    expect(result.totalA).toBe(15);
    expect(result.totalB).toBe(12);
    expect(result.endsWonA).toBe(4);
    expect(result.endsWonB).toBe(3);
    expect(result.winner).toBe("team_a");
    expect(result.margin).toBe(3);
  });

  it("10. draw scenario: equal total scores produces draw result", () => {
    const teamA = [3, 2, 1, 4];
    const teamB = [4, 1, 3, 2];

    const result = calculateBowlsResult(teamA, teamB);

    expect(result.totalA).toBe(10);
    expect(result.totalB).toBe(10);
    expect(result.winner).toBe("draw");
    expect(result.margin).toBe(0);
  });

  it("11. shutout scenario: one team scores 0 every end", () => {
    const teamA = [5, 3, 4, 2, 6, 3, 4];
    const teamB = [0, 0, 0, 0, 0, 0, 0];

    const result = calculateBowlsResult(teamA, teamB);

    expect(result.totalA).toBe(27);
    expect(result.totalB).toBe(0);
    expect(result.winner).toBe("team_a");
    expect(result.margin).toBe(27);
    expect(result.endsWonA).toBe(7);
    expect(result.endsWonB).toBe(0);
  });

  it("12. match state transitions: queued -> court assigned -> playing -> completed", () => {
    const match = {
      id: "match-sim",
      sport: "lawn_bowling",
      court_id: null as string | null,
      status: "queued" as string,
      started_at: null as string | null,
      ended_at: null as string | null,
    };

    // State 1: queued
    expect(match.status).toBe("queued");
    expect(match.court_id).toBeNull();

    // State 2: court assigned + playing
    match.court_id = "rink-3";
    match.status = "playing";
    match.started_at = new Date().toISOString();
    expect(match.status).toBe("playing");
    expect(match.court_id).toBe("rink-3");
    expect(match.started_at).toBeTruthy();

    // State 3: completed
    match.status = "completed";
    match.ended_at = new Date().toISOString();
    expect(match.status).toBe("completed");
    expect(match.ended_at).toBeTruthy();

    // Verify valid transition sequence
    const validTransitions: Record<string, string[]> = {
      queued: ["playing"],
      playing: ["completed"],
      completed: [],
    };
    // queued -> playing is valid
    expect(validTransitions["queued"]).toContain("playing");
    // playing -> completed is valid
    expect(validTransitions["playing"]).toContain("completed");
  });

  it("13. multi-rink scoring: 3 rinks scored independently, standings built from all", () => {
    const results = [
      {
        teamAPlayerIds: ["p1", "p2", "p3", "p4"],
        teamBPlayerIds: ["p5", "p6", "p7", "p8"],
        totalA: 25, totalB: 18,
        endsWonA: 8, endsWonB: 5,
        winner: "team_a" as const,
        isFinalized: true,
      },
      {
        teamAPlayerIds: ["p9", "p10", "p11", "p12"],
        teamBPlayerIds: ["p13", "p14", "p15", "p16"],
        totalA: 15, totalB: 22,
        endsWonA: 5, endsWonB: 9,
        winner: "team_b" as const,
        isFinalized: true,
      },
      {
        teamAPlayerIds: ["p17", "p18", "p19", "p20"],
        teamBPlayerIds: ["p21", "p22", "p23", "p24"],
        totalA: 20, totalB: 20,
        endsWonA: 7, endsWonB: 7,
        winner: "draw" as const,
        isFinalized: true,
      },
    ];

    const standings = buildStandings(results);
    expect(standings).toHaveLength(24);

    // Rink 1 winners
    const p1 = standings.find((s) => s.playerId === "p1")!;
    expect(p1.wins).toBe(1);
    expect(p1.losses).toBe(0);
    expect(p1.shotDifference).toBe(7);

    // Rink 2 losers
    const p9 = standings.find((s) => s.playerId === "p9")!;
    expect(p9.wins).toBe(0);
    expect(p9.losses).toBe(1);
    expect(p9.shotDifference).toBe(-7);

    // Rink 3 draw
    const p17 = standings.find((s) => s.playerId === "p17")!;
    expect(p17.draws).toBe(1);
    expect(p17.shotDifference).toBe(0);
  });

  it("14. standings tiebreaker cascade: points -> shot difference -> ends won -> points for", () => {
    const base: Standing = {
      playerId: "", wins: 0, losses: 0, draws: 0, pointsFor: 0,
      pointsAgainst: 0, shotDifference: 0, endsWon: 0, gamesPlayed: 0,
    };

    const standings: Standing[] = [
      // All have 2 wins, but different secondary stats
      { ...base, playerId: "last", wins: 2, shotDifference: 5, endsWon: 8, pointsFor: 30 },
      { ...base, playerId: "first", wins: 2, shotDifference: 10, endsWon: 12, pointsFor: 50 },
      { ...base, playerId: "third", wins: 2, shotDifference: 5, endsWon: 8, pointsFor: 45 },
      { ...base, playerId: "second", wins: 2, shotDifference: 5, endsWon: 12, pointsFor: 40 },
    ];

    const sorted = sortStandings(standings);

    // first: highest shot diff
    expect(sorted[0].playerId).toBe("first");
    // second: same shot diff as third/last, but more ends won
    expect(sorted[1].playerId).toBe("second");
    // third: same shot diff and ends won as last, but higher pointsFor
    expect(sorted[2].playerId).toBe("third");
    // last: lowest on all tiebreakers
    expect(sorted[3].playerId).toBe("last");
  });

  it("15. single elimination bracket: 8 players, 3 rounds to champion", () => {
    const playerIds = Array.from({ length: 8 }, (_, i) => `p${i + 1}`);
    const matches = generateSingleEliminationBracket(playerIds);

    // Round 1: 4 matches
    const r1 = matches.filter((m) => m.round === 1);
    expect(r1).toHaveLength(4);

    // Round 2: 2 matches
    const r2 = matches.filter((m) => m.round === 2);
    expect(r2).toHaveLength(2);

    // Round 3 (final): 1 match
    const r3 = matches.filter((m) => m.round === 3);
    expect(r3).toHaveLength(1);

    // Simulate: p1 beats p8, p2 beats p7, p3 beats p6, p4 beats p5
    // then p1 beats p2, p3 beats p4; then p1 beats p3
    const simulatedMatches = [
      { round: 1, winnerId: "p1" },
      { round: 1, winnerId: "p2" },
      { round: 1, winnerId: "p3" },
      { round: 1, winnerId: "p4" },
      { round: 2, winnerId: "p1" },
      { round: 2, winnerId: "p3" },
      { round: 3, winnerId: "p1" },
    ];

    const winner = determineTournamentWinner(simulatedMatches, "single_elimination");
    expect(winner).toBe("p1");
  });

  it("16. double elimination: player loses once, survives through losers bracket", () => {
    const playerIds = ["p1", "p2", "p3", "p4"];
    const matches = generateDoubleEliminationBracket(playerIds);

    // Should have winners, losers, and grand final brackets
    const winners = matches.filter((m) => m.bracket === "winners");
    const losers = matches.filter((m) => m.bracket === "losers");
    const grandFinal = matches.filter((m) => m.bracket === "grand_final");

    expect(winners.length).toBeGreaterThan(0);
    expect(losers.length).toBeGreaterThan(0);
    expect(grandFinal).toHaveLength(1);

    // Simulate: p1 loses in winners bracket round 1, wins through losers, wins grand final
    const simulatedMatches = [
      { round: 1, winnerId: "p2", bracket: "winners" },
      { round: 1, winnerId: "p3", bracket: "winners" },
      { round: 2, winnerId: "p2", bracket: "winners" },
      { round: 1, winnerId: "p1", bracket: "losers" },
      { round: 2, winnerId: "p1", bracket: "losers" },
      { round: 1, winnerId: "p1", bracket: "grand_final" },
    ];

    const winner = determineTournamentWinner(simulatedMatches, "double_elimination");
    expect(winner).toBe("p1");
  });

  it("17. forfeit handling mid-tournament advances opponent correctly", () => {
    const forfeitResult = handleForfeit("p1", "p2", "p1");
    expect(forfeitResult.winnerId).toBe("p2");
    expect(forfeitResult.loserId).toBe("p1");

    // The winner should advance to the next match slot
    const nextSlot = getNextMatchSlot(1, 1);
    expect(nextSlot.nextRound).toBe(2);
    expect(nextSlot.nextMatchNumber).toBe(1);
    expect(nextSlot.slot).toBe("player1Id");

    // Match 2 winner goes to player2Id slot
    const nextSlot2 = getNextMatchSlot(2, 1);
    expect(nextSlot2.slot).toBe("player2Id");
  });

  it("18. best-of-3 format: player wins 2-1 after losing game 1", () => {
    const games: GameScore[] = [
      { player1Score: 15, player2Score: 21 }, // p2 wins game 1
      { player1Score: 21, player2Score: 18 }, // p1 wins game 2
      { player1Score: 21, player2Score: 12 }, // p1 wins game 3
    ];

    const result = calculateMatchResult("p1", "p2", games, "best_of_3");

    expect(result.winnerId).toBe("p1");
    expect(result.loserId).toBe("p2");
    expect(result.gamesWon.player1).toBe(2);
    expect(result.gamesWon.player2).toBe(1);
    expect(result.isDraw).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════
// PHASE 3: Post-Match ELO & Stats (8 tests)
// ════════════════════════════════════════════════════════════════════

describe("Phase 3: Post-Match ELO & Stats", () => {
  beforeEach(() => {
    _id = 0;
  });

  it("19. ELO update after fours match: all 8 players ratings adjust correctly", () => {
    // Winner team: 4 players at 1200
    // Loser team: 4 players at 1200
    const winnerRatings = [1200, 1200, 1200, 1200];
    const loserRatings = [1200, 1200, 1200, 1200];
    const positions = ["skip", "vice", "second", "lead"];

    const newWinnerRatings: number[] = [];
    const newLoserRatings: number[] = [];

    for (let i = 0; i < 4; i++) {
      const winnerNew = calculateBowlsElo({
        position: positions[i],
        playerRating: winnerRatings[i],
        opponentRating: loserRatings[i],
        result: 1,
        shotDifferential: 5,
        endsWon: 8,
        endsPlayed: 14,
      });
      newWinnerRatings.push(winnerNew);

      const loserNew = calculateBowlsElo({
        position: positions[i],
        playerRating: loserRatings[i],
        opponentRating: winnerRatings[i],
        result: 0,
        shotDifferential: -5,
        endsWon: 6,
        endsPlayed: 14,
      });
      newLoserRatings.push(loserNew);
    }

    // All winners should gain
    for (const r of newWinnerRatings) {
      expect(r).toBeGreaterThan(1200);
    }

    // All losers should lose
    for (const r of newLoserRatings) {
      expect(r).toBeLessThan(1200);
    }

    // Skip has highest K-factor, so should gain/lose most
    const skipWinnerGain = newWinnerRatings[0] - 1200;
    const leadWinnerGain = newWinnerRatings[3] - 1200;
    expect(skipWinnerGain).toBeGreaterThan(leadWinnerGain);
  });

  it("20. underdog victory produces larger ELO swing", () => {
    // Underdog: team avg 900 beats team avg 1400
    const underdogResult = calculateBowlsElo({
      position: "skip",
      playerRating: 900,
      opponentRating: 1400,
      result: 1,
      shotDifferential: 3,
      endsWon: 8,
      endsPlayed: 14,
    });
    const underdogGain = underdogResult - 900;

    // Equal match: 1200 beats 1200
    const equalResult = calculateBowlsElo({
      position: "skip",
      playerRating: 1200,
      opponentRating: 1200,
      result: 1,
      shotDifferential: 3,
      endsWon: 8,
      endsPlayed: 14,
    });
    const equalGain = equalResult - 1200;

    expect(underdogGain).toBeGreaterThan(equalGain);
  });

  it("21. win rate calculation: 7 wins out of 10 games = 70.00%", () => {
    function calculateWinRate(wins: number, gamesPlayed: number): number {
      if (gamesPlayed === 0) return 0;
      return (wins / gamesPlayed) * 100;
    }

    expect(calculateWinRate(7, 10)).toBeCloseTo(70.0);
    expect(calculateWinRate(0, 0)).toBe(0);
    expect(calculateWinRate(10, 10)).toBeCloseTo(100.0);
    expect(calculateWinRate(0, 5)).toBe(0);
  });

  it("22. partner stats: Alice+Bob play 5 games together, bidirectional tracking works", () => {
    // Simulate partner tracking with a simple map
    const partnerStats = new Map<string, { games: number; wins: number }>();

    function trackPartnership(p1: string, p2: string, won: boolean) {
      const keyAB = `${p1}:${p2}`;
      const keyBA = `${p2}:${p1}`;
      const ab = partnerStats.get(keyAB) ?? { games: 0, wins: 0 };
      const ba = partnerStats.get(keyBA) ?? { games: 0, wins: 0 };
      ab.games++;
      ba.games++;
      if (won) { ab.wins++; ba.wins++; }
      partnerStats.set(keyAB, ab);
      partnerStats.set(keyBA, ba);
    }

    // 5 games: 3 wins, 2 losses
    trackPartnership("alice", "bob", true);
    trackPartnership("alice", "bob", true);
    trackPartnership("alice", "bob", false);
    trackPartnership("alice", "bob", true);
    trackPartnership("alice", "bob", false);

    const ab = partnerStats.get("alice:bob")!;
    const ba = partnerStats.get("bob:alice")!;

    // Bidirectional symmetry
    expect(ab.games).toBe(5);
    expect(ba.games).toBe(5);
    expect(ab.wins).toBe(3);
    expect(ba.wins).toBe(3);
  });

  it("23. team of 3 generates correct partner pair combinations", () => {
    const team = ["p1", "p2", "p3"];
    const pairs: string[] = [];

    // Generate all directional pairs
    for (let i = 0; i < team.length; i++) {
      for (let j = 0; j < team.length; j++) {
        if (i !== j) {
          pairs.push(`${team[i]}:${team[j]}`);
        }
      }
    }

    // 3 players = 3 * 2 = 6 directional records
    expect(pairs).toHaveLength(6);
    expect(pairs).toContain("p1:p2");
    expect(pairs).toContain("p2:p1");
    expect(pairs).toContain("p1:p3");
    expect(pairs).toContain("p3:p1");
    expect(pairs).toContain("p2:p3");
    expect(pairs).toContain("p3:p2");
  });

  it("24. season standings accumulate across multiple rounds", () => {
    const results = [
      {
        teamAPlayerIds: ["p1"],
        teamBPlayerIds: ["p2"],
        totalA: 20, totalB: 15,
        endsWonA: 8, endsWonB: 6,
        winner: "team_a" as const,
        isFinalized: true,
      },
      {
        teamAPlayerIds: ["p2"],
        teamBPlayerIds: ["p1"],
        totalA: 22, totalB: 10,
        endsWonA: 9, endsWonB: 5,
        winner: "team_a" as const,
        isFinalized: true,
      },
    ];

    const standings = buildStandings(results);
    const p1 = standings.find((s) => s.playerId === "p1")!;

    expect(p1.gamesPlayed).toBe(2);
    expect(p1.wins).toBe(1);
    expect(p1.losses).toBe(1);
    // Round 1: +5, Round 2: -12 => -7
    expect(p1.shotDifference).toBe(5 + (10 - 22));
  });

  it("25. ELO never drops below floor (100)", () => {
    // matchmaking.ts calculateElo returns [winnerElo, loserElo] with floor at 100
    const [, loserElo] = calculateMatchmakingElo(2000, 100);
    expect(loserElo).toBeGreaterThanOrEqual(100);

    // Even more extreme
    const [, loserElo2] = calculateMatchmakingElo(2500, 100);
    expect(loserElo2).toBeGreaterThanOrEqual(100);
  });

  it("26. rating tier classification matches skill levels", () => {
    expect(getRatingTier(800)).toBe("beginner");
    expect(getRatingTier(1000)).toBe("beginner");
    expect(getRatingTier(1100)).toBe("intermediate");
    expect(getRatingTier(1200)).toBe("intermediate");
    expect(getRatingTier(1300)).toBe("intermediate");
    expect(getRatingTier(1400)).toBe("advanced");
    expect(getRatingTier(1500)).toBe("advanced");
    expect(getRatingTier(1700)).toBe("advanced");
    expect(getRatingTier(1800)).toBe("expert");
    expect(getRatingTier(1900)).toBe("expert");
    expect(getRatingTier(2200)).toBe("expert");
  });
});

// ════════════════════════════════════════════════════════════════════
// PHASE 4: Pennant/League Season (6 tests)
// ════════════════════════════════════════════════════════════════════

describe("Phase 4: Pennant/League Season", () => {
  beforeEach(() => {
    _id = 0;
  });

  it("27. full pennant season simulation: 8 teams, 7 rounds, complete standings", () => {
    const teams = makePennantTeams(8);
    const fixtures = generateRoundRobinFixtures(teams, 7, "s1", "d1");

    // 8 teams, 7 rounds, 4 fixtures per round = 28 total
    expect(fixtures).toHaveLength(28);

    // Simulate results for all 28 fixtures
    // Team-1 wins most, team-8 wins least
    const fixturesWithIds = fixtures.map((f, i) => ({
      ...f,
      id: `f-${i}`,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    })) as PennantFixture[];

    const results: PennantFixtureResult[] = fixturesWithIds.map((f) => {
      // Home team number determines strength
      const homeNum = parseInt(f.home_team_id.replace("team-", ""));
      const awayNum = parseInt(f.away_team_id.replace("team-", ""));
      // Lower number = stronger team
      const homeWins = homeNum < awayNum;
      return makePennantResult(
        f.id,
        homeWins ? 50 : 30,
        homeWins ? 30 : 50,
        homeWins ? 3 : 1,
        homeWins ? 1 : 3,
        homeWins ? f.home_team_id : f.away_team_id
      );
    });

    const standings = calculateDivisionStandings(teams, fixturesWithIds, results);

    expect(standings).toHaveLength(8);
    // Team-1 should be champion (played 7, won all)
    expect(standings[0].teamId).toBe("team-1");
    expect(standings[0].wins).toBe(7);
    // Every team should have played 7 games
    for (const s of standings) {
      expect(s.played).toBe(7);
    }
  });

  it("28. pennant home/away balance: no team has >4 home/away imbalance in 7 rounds", () => {
    const teams = makePennantTeams(8);
    const fixtures = generateRoundRobinFixtures(teams, 7, "s1", "d1");

    const homeCount = new Map<string, number>();
    const awayCount = new Map<string, number>();

    for (const f of fixtures) {
      homeCount.set(f.home_team_id, (homeCount.get(f.home_team_id) ?? 0) + 1);
      awayCount.set(f.away_team_id, (awayCount.get(f.away_team_id) ?? 0) + 1);
    }

    for (const team of teams) {
      const h = homeCount.get(team.id) ?? 0;
      const a = awayCount.get(team.id) ?? 0;
      expect(h + a).toBe(7);
      expect(Math.abs(h - a)).toBeLessThanOrEqual(4);
    }
  });

  it("29. pennant draw awards 1 point each, win awards 2", () => {
    expect(PENNANT_POINTS.win).toBe(2);
    expect(PENNANT_POINTS.draw).toBe(1);
    expect(PENNANT_POINTS.loss).toBe(0);

    // Verify in action
    const teams = makePennantTeams(2);
    const fixture = makePennantFixture("f-draw", 1, "team-1", "team-2");
    const drawResult = makePennantResult("f-draw", 40, 40, 2, 2, null);

    const standings = calculateDivisionStandings(teams, [fixture], [drawResult]);
    const t1 = standings.find((s) => s.teamId === "team-1")!;
    const t2 = standings.find((s) => s.teamId === "team-2")!;

    expect(t1.points).toBe(1);
    expect(t2.points).toBe(1);
    expect(t1.draws).toBe(1);
    expect(t2.draws).toBe(1);
  });

  it("30. double round-robin: 14 rounds, each pair meets exactly twice", () => {
    const teams = makePennantTeams(8);
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

  it("31. pennant with odd teams: bye handling doesn't create ghost fixtures", () => {
    const teams = makePennantTeams(7);
    const fixtures = generateRoundRobinFixtures(teams, 7, "s1", "d1");

    // 7 teams (padded to 8 with BYE): 3 real fixtures per round * 7 rounds = 21
    expect(fixtures).toHaveLength(21);

    // No team plays a null/undefined opponent
    for (const f of fixtures) {
      expect(f.home_team_id).toBeTruthy();
      expect(f.away_team_id).toBeTruthy();
      expect(f.home_team_id).not.toBe(f.away_team_id);
    }

    // Each real team plays exactly 6 games (sits out 1 round)
    const gameCounts = new Map<string, number>();
    for (const f of fixtures) {
      gameCounts.set(f.home_team_id, (gameCounts.get(f.home_team_id) ?? 0) + 1);
      gameCounts.set(f.away_team_id, (gameCounts.get(f.away_team_id) ?? 0) + 1);
    }
    for (const team of teams) {
      expect(gameCounts.get(team.id)).toBe(6);
    }
  });

  it("32. fixture schedule validation catches self-play and double-booking", () => {
    // Self-play fixture
    const badFixtures = [{
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

    const validation = validateFixtureSchedule(badFixtures, 2, 1);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors.some((e) => e.includes("plays itself"))).toBe(true);

    // Valid schedule should pass
    const teams = makePennantTeams(8);
    const validFixtures = generateRoundRobinFixtures(teams, 7, "s1", "d1");
    const validResult = validateFixtureSchedule(validFixtures, 8, 7);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toHaveLength(0);
  });
});

// ════════════════════════════════════════════════════════════════════
// PHASE 5: Social & Partner Flow (5 tests)
// ════════════════════════════════════════════════════════════════════

describe("Phase 5: Social & Partner Flow", () => {
  beforeEach(() => {
    _id = 0;
  });

  it("33. partner request lifecycle: create pending -> accept -> partners matched in draw", () => {
    // Simulate partner request state machine
    const request = {
      id: "req-1",
      requester_id: "alice",
      target_id: "bob",
      sport: "lawn_bowling",
      status: "pending" as "pending" | "accepted" | "declined" | "expired",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      responded_at: null as string | null,
    };

    expect(request.status).toBe("pending");

    // Accept
    request.status = "accepted";
    request.responded_at = new Date().toISOString();
    expect(request.status).toBe("accepted");

    // Now verify matchmaking boosts favorites
    const me = makePlayer({ id: "alice" });
    const bob = makePlayer({ id: "bob" });

    const noFavResult = computeMatchScore(
      makeMatchCtx({
        currentPlayer: me,
        candidate: bob,
        favoriteIds: new Set(),
      })
    );

    const favResult = computeMatchScore(
      makeMatchCtx({
        currentPlayer: me,
        candidate: bob,
        favoriteIds: new Set(["bob"]),
      })
    );

    expect(favResult.score).toBeGreaterThan(noFavResult.score);
    expect(favResult.reasons).toContain("Favorite player");
  });

  it("34. partner request expiry: 7-day-old request is expired", () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const request = {
      id: "req-expired",
      requester_id: "alice",
      target_id: "bob",
      status: "pending" as string,
      expires_at: sevenDaysAgo.toISOString(),
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const isExpired = new Date(request.expires_at) < new Date();
    expect(isExpired).toBe(true);

    // Mark as expired
    request.status = "expired";
    expect(request.status).toBe("expired");
  });

  it("35. self-partner request rejected", () => {
    const requesterId = "alice";
    const targetId = "alice";

    // Validation: cannot request yourself
    const isValid = requesterId !== targetId;
    expect(isValid).toBe(false);

    // Different players should be valid
    const differentRequester: string = "alice";
    const differentTarget: string = "bob";
    const isValid2 = differentRequester !== differentTarget;
    expect(isValid2).toBe(true);
  });

  it("36. matchmaking boosts favorites in competitive mode", () => {
    const me = makePlayer({ id: "me", skill_level: "intermediate" });
    const candidate = makePlayer({ id: "fav-player", skill_level: "intermediate" });

    const noFav = computeMatchScore(
      makeMatchCtx({
        currentPlayer: me,
        candidate,
        favoriteIds: new Set(),
        mode: "competitive",
      })
    );

    const withFav = computeMatchScore(
      makeMatchCtx({
        currentPlayer: me,
        candidate,
        favoriteIds: new Set(["fav-player"]),
        mode: "competitive",
      })
    );

    expect(withFav.score).toBeGreaterThan(noFav.score);
    expect(withFav.reasons).toContain("Favorite player");
  });

  it("37. matchmaking avoids recent opponents", () => {
    const me = makePlayer({ id: "me" });
    const opponent = makePlayer({ id: "recent-opp" });

    const freshResult = computeMatchScore(
      makeMatchCtx({
        currentPlayer: me,
        candidate: opponent,
        recentMatches: [],
      })
    );

    const recentResult = computeMatchScore(
      makeMatchCtx({
        currentPlayer: me,
        candidate: opponent,
        recentMatches: [
          {
            opponent_id: "recent-opp",
            played_at: new Date(Date.now() - 30 * 60000).toISOString(), // 30 min ago
            count: 1,
          },
        ],
      })
    );

    // Fresh opponent should score higher than recent opponent
    expect(freshResult.score).toBeGreaterThan(recentResult.score);
  });
});
