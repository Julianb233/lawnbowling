/**
 * Ralph Wiggum Chaos Test Suite — Gameplay Edge Cases
 *
 * "Me fail English? That's unpossible!" — Ralph Wiggum
 *
 * These tests exercise the dark corners of the gameplay loop:
 * bizarre inputs, boundary conditions, and real-world chaos
 * that players will inevitably produce on match day.
 *
 * Linear: AI-2438
 */

import { describe, it, expect, beforeEach } from "vitest";

// ── Engine Imports ──────────────────────────────────────────────────

import {
  generateBowlsDraw,
  generateMeadDraw,
  generateGavelDraw,
  DrawCompatibilityError,
  validateDrawCompatibility,
} from "@/lib/bowls-draw";

import {
  calculateMatchResult,
  calculateBowlsResult,
  sortStandings,
  buildStandings,
  generateSingleEliminationBracket,
  generateSeededDraw,
  handleBye,
  handleForfeit,
  getNextMatchSlot,
  type Standing,
  type GameScore,
} from "@/lib/tournament-engine";

import {
  generateRoundRobinFixtures,
  calculateDivisionStandings,
  sortPennantStandings,
  validateFixtureSchedule,
  PENNANT_POINTS,
} from "@/lib/pennant-engine";

import {
  calculateElo,
  calculateBowlsElo,
  getRatingTier,
} from "@/lib/elo";

import {
  computeMatchScore,
  calculateElo as calculateMatchmakingElo,
  type ScoringContext,
  type MatchMode,
} from "@/lib/matchmaking";

import {
  autoSelectTournament,
  determineKioskMode,
  findExistingCheckin,
  buildCheckinPayload,
  validateCheckinRequest,
  isValidCheckinSource,
} from "@/lib/checkin-utils";

import {
  calculateRatingUpdates,
  applyUpdates,
  resolvePlayerPositions,
} from "@/lib/bowls-ratings";

import type {
  BowlsCheckin,
  BowlsPosition,
  BowlsGameFormat,
  Player,
  Tournament,
  TournamentScore,
  BowlsPositionRating,
  PennantTeam,
} from "@/lib/types";

// ── Helpers ─────────────────────────────────────────────────────────

let _id = 0;

function uid(): string {
  return `rw-${++_id}`;
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

// ════════════════════════════════════════════════════════════════════
// RALPH WIGGUM CHAOS TESTS — Gameplay Edge Cases (18 tests)
// "I bent my wookie!" — Ralph Wiggum
// ════════════════════════════════════════════════════════════════════

describe("Ralph Wiggum Chaos: Gameplay Edge Cases", () => {
  beforeEach(() => {
    _id = 0;
  });

  // RW-GP-01: Zero players check in
  it("RW-GP-01: draw with 0 players produces empty result, not a crash", () => {
    const draw = generateBowlsDraw([], "fours");
    expect(draw.rinkCount).toBe(0);
    expect(draw.rinks).toHaveLength(0);
    expect(draw.unassigned).toHaveLength(0);
  });

  // RW-GP-02: Single player tries to play fours
  it("RW-GP-02: 1 player in fours gets no rinks, player is unassigned", () => {
    const checkins = makeCheckins(1);
    const draw = generateBowlsDraw(checkins, "fours");
    expect(draw.rinkCount).toBe(0);
    expect(draw.unassigned).toHaveLength(1);
    expect(draw.unassigned[0].player_id).toBe(checkins[0].player_id);
  });

  // RW-GP-03: All players pick the same position
  it("RW-GP-03: all 16 players request skip — draw still works with flexible reassignment", () => {
    const checkins = makeCheckins(16, () => ({
      preferred_position: "skip",
    }));

    const draw = generateBowlsDraw(checkins, "fours");
    expect(draw.rinkCount).toBe(2);
    expect(draw.rinks).toHaveLength(2);

    const assignedIds = new Set(draw.rinks.flat().map((a) => a.player_id));
    expect(assignedIds.size).toBe(16);
    expect(draw.unassigned).toHaveLength(0);
  });

  // RW-GP-04: Mismatched score array lengths
  it("RW-GP-04: mismatched end score arrays throw descriptive error", () => {
    expect(() => {
      calculateBowlsResult([3, 2, 1], [4, 5]);
    }).toThrow("Score arrays must have equal length");
  });

  // RW-GP-05: Empty score arrays (match never started)
  it("RW-GP-05: empty score arrays produce zeroed result with null winner", () => {
    const result = calculateBowlsResult([], []);
    expect(result.totalA).toBe(0);
    expect(result.totalB).toBe(0);
    expect(result.endsWonA).toBe(0);
    expect(result.endsWonB).toBe(0);
    expect(result.winner).toBeNull();
    expect(result.margin).toBe(0);
  });

  // RW-GP-06: Extreme ELO values — 100 vs 3000
  it("RW-GP-06: extreme ELO gap (100 vs 3000) still produces valid ratings", () => {
    const underdogWins = calculateBowlsElo({
      position: "skip",
      playerRating: 100,
      opponentRating: 3000,
      result: 1,
      shotDifferential: 30,
      endsWon: 14,
      endsPlayed: 14,
    });

    expect(Number.isFinite(underdogWins)).toBe(true);
    expect(underdogWins).toBeGreaterThan(100);

    const favoriteLoses = calculateBowlsElo({
      position: "skip",
      playerRating: 3000,
      opponentRating: 100,
      result: 0,
      shotDifferential: -30,
      endsWon: 0,
      endsPlayed: 14,
    });

    expect(Number.isFinite(favoriteLoses)).toBe(true);
    expect(favoriteLoses).toBeLessThan(3000);
  });

  // RW-GP-07: Draw result ELO — neither player should gain or lose excessively
  it("RW-GP-07: draw with equal ratings changes ELO minimally", () => {
    const drawResult = calculateBowlsElo({
      position: "vice",
      playerRating: 1200,
      opponentRating: 1200,
      result: 0.5,
      shotDifferential: 0,
      endsWon: 7,
      endsPlayed: 14,
    });

    expect(Math.abs(drawResult - 1200)).toBeLessThan(1);
  });

  // RW-GP-08: Invalid check-in data rejected
  it("RW-GP-08: check-in validation rejects missing fields and invalid positions", () => {
    expect(validateCheckinRequest({
      tournament_id: "t-1",
      preferred_position: "skip",
    })).toBe("player_id required");

    expect(validateCheckinRequest({
      player_id: "p-1",
      preferred_position: "skip",
    })).toBe("tournament_id required");

    expect(validateCheckinRequest({
      player_id: "p-1",
      tournament_id: "t-1",
      preferred_position: "goalkeeper",
    })).toContain("Invalid position");

    expect(validateCheckinRequest({
      player_id: "p-1",
      tournament_id: "t-1",
      preferred_position: "skip",
    })).toBeNull();
  });

  // RW-GP-09: Invalid checkin source rejected
  it("RW-GP-09: only valid checkin sources accepted (kiosk, manual, app)", () => {
    expect(isValidCheckinSource("kiosk")).toBe(true);
    expect(isValidCheckinSource("manual")).toBe(true);
    expect(isValidCheckinSource("app")).toBe(true);
    expect(isValidCheckinSource("telegram")).toBe(false);
    expect(isValidCheckinSource("")).toBe(false);
    expect(isValidCheckinSource("KIOSK")).toBe(false);
  });

  // RW-GP-10: Gavel draw rejects non-fours format
  it("RW-GP-10: Gavel draw throws on non-fours format", () => {
    const checkins = makeCheckins(12);
    expect(() => generateGavelDraw(checkins, "triples")).toThrow(
      "Gavel Draw is only available for fours format"
    );
  });

  // RW-GP-11: Mead draw rejects singles format
  it("RW-GP-11: Mead draw throws on singles format", () => {
    const checkins = makeCheckins(8);
    expect(() => generateMeadDraw(checkins, "singles")).toThrow(
      "Mead Draw is not available for singles format"
    );
  });

  // RW-GP-12: Rating updates with no finalized scores produce no updates
  it("RW-GP-12: rating engine skips non-finalized scores", () => {
    const scores: TournamentScore[] = [
      {
        id: "score-1",
        tournament_id: "t-1",
        rink: 1,
        round: 1,
        team_a_players: [{ player_id: "p1" }],
        team_b_players: [{ player_id: "p2" }],
        total_a: 20,
        total_b: 15,
        ends_won_a: 8,
        ends_won_b: 6,
        winner: "team_a",
        is_finalized: false,
        created_at: "2026-01-01T00:00:00Z",
      },
    ];

    const checkins: BowlsCheckin[] = [
      makeCheckin({ player_id: "p1", preferred_position: "skip" }),
      makeCheckin({ player_id: "p2", preferred_position: "skip" }),
    ];

    const updates = calculateRatingUpdates(scores, checkins, new Map());
    expect(updates).toHaveLength(0);
  });

  // RW-GP-13: Standings from all-draws season
  it("RW-GP-13: a season of all draws gives every player equal standings", () => {
    const results = Array.from({ length: 5 }, () => ({
      teamAPlayerIds: ["p-draw-a"],
      teamBPlayerIds: ["p-draw-b"],
      totalA: 20,
      totalB: 20,
      endsWonA: 7,
      endsWonB: 7,
      winner: "draw" as const,
      isFinalized: true,
    }));

    const standings = buildStandings(results);
    const pA = standings.find((s) => s.playerId === "p-draw-a")!;
    const pB = standings.find((s) => s.playerId === "p-draw-b")!;

    expect(pA.wins).toBe(0);
    expect(pA.losses).toBe(0);
    expect(pA.draws).toBe(5);
    expect(pA.shotDifference).toBe(0);
    expect(pB.draws).toBe(5);
    expect(pB.shotDifference).toBe(0);
    expect(pA.gamesPlayed).toBe(pB.gamesPlayed);
  });

  // RW-GP-14: Non-finalized results excluded from standings
  it("RW-GP-14: buildStandings ignores non-finalized results", () => {
    const results = [
      {
        teamAPlayerIds: ["p1"],
        teamBPlayerIds: ["p2"],
        totalA: 25,
        totalB: 10,
        endsWonA: 10,
        endsWonB: 4,
        winner: "team_a" as const,
        isFinalized: false,
      },
    ];

    const standings = buildStandings(results);
    expect(standings).toHaveLength(0);
  });

  // RW-GP-15: Single elimination bracket with 1 player
  it("RW-GP-15: single elimination with 1 player produces no matches", () => {
    const matches = generateSingleEliminationBracket(["p-solo"]);
    expect(matches).toHaveLength(0);
  });

  // RW-GP-16: Bye handling in seeded draw
  it("RW-GP-16: odd-player seeded draw has a bye, handleBye returns advancing player", () => {
    const pairings = generateSeededDraw(["p1", "p2", "p3"]);

    expect(pairings).toHaveLength(2);

    const byePairing = pairings.find((p) => p.player2Id === null);
    expect(byePairing).toBeDefined();

    const advancer = handleBye(byePairing!);
    expect(advancer).toBe(byePairing!.player1Id);
  });

  // RW-GP-17: Draw compatibility validation
  it("RW-GP-17: validateDrawCompatibility correctly reports unsupported player counts", () => {
    expect(validateDrawCompatibility(3, "fours", "random").compatible).toBe(true);
    expect(validateDrawCompatibility(3, "fours", "seeded").compatible).toBe(true);

    const meadSingles = validateDrawCompatibility(8, "singles", "mead");
    expect(meadSingles.compatible).toBe(false);

    const gavelTriples = validateDrawCompatibility(12, "triples", "gavel");
    expect(gavelTriples.compatible).toBe(false);
  });

  // RW-GP-18: Multiple tournaments — auto-select returns null
  it("RW-GP-18: multiple active tournaments means auto-select returns null", () => {
    const t1 = makeTournament({ id: "t-1" });
    const t2 = makeTournament({ id: "t-2" });

    const selected = autoSelectTournament([t1, t2]);
    expect(selected).toBeNull();
    expect(autoSelectTournament([])).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════════
// FULL MATCH-DAY INTEGRATION: Arrival -> Results in one flow
// ════════════════════════════════════════════════════════════════════

describe("Full Match-Day Integration", () => {
  beforeEach(() => {
    _id = 0;
  });

  it("complete match day: 16 players arrive -> check-in -> draw -> score -> ELO update -> standings", () => {
    // Step 1: Tournament exists, kiosk detects it
    const tournament = makeTournament({ id: "matchday-1" });
    const mode = determineKioskMode({
      modeParam: null,
      tournamentIdParam: null,
      activeTournaments: [tournament],
    });
    expect(mode).toBe("bowls");
    const selectedTournament = autoSelectTournament([tournament]);
    expect(selectedTournament).toBe("matchday-1");

    // Step 2: 16 players check in with positions
    const positions: BowlsPosition[] = ["skip", "vice", "second", "lead"];
    const checkins = makeCheckins(16, (i) => ({
      tournament_id: "matchday-1",
      preferred_position: positions[i % 4],
    }));
    expect(checkins).toHaveLength(16);

    for (const c of checkins) {
      const existing = findExistingCheckin(checkins, c.player_id);
      expect(existing).not.toBeNull();
    }

    // Step 3: Generate draw
    const draw = generateBowlsDraw(checkins, "fours");
    expect(draw.rinkCount).toBe(2);
    expect(draw.unassigned).toHaveLength(0);

    // Step 4: Play matches — simulate end-by-end scores
    const rink1Scores = {
      teamA: [3, 0, 4, 2, 1, 5, 0],
      teamB: [0, 3, 1, 0, 4, 0, 2],
    };
    const rink2Scores = {
      teamA: [1, 2, 0, 3, 2, 1, 0],
      teamB: [4, 1, 3, 0, 0, 2, 5],
    };

    const rink1Result = calculateBowlsResult(rink1Scores.teamA, rink1Scores.teamB);
    const rink2Result = calculateBowlsResult(rink2Scores.teamA, rink2Scores.teamB);

    expect(rink1Result.totalA).toBe(15);
    expect(rink1Result.totalB).toBe(10);
    expect(rink1Result.winner).toBe("team_a");

    expect(rink2Result.totalA).toBe(9);
    expect(rink2Result.totalB).toBe(15);
    expect(rink2Result.winner).toBe("team_b");

    // Step 5: Update ELO for all players
    const rink1Players = draw.rinks[0];
    const rink2Players = draw.rinks[1];

    const rink1Team1 = rink1Players.filter((a) => a.team === 1);
    for (const player of rink1Team1) {
      const newElo = calculateBowlsElo({
        position: player.position,
        playerRating: 1200,
        opponentRating: 1200,
        result: 1,
        shotDifferential: rink1Result.margin,
        endsWon: rink1Result.endsWonA,
        endsPlayed: rink1Result.endsWonA + rink1Result.endsWonB,
      });
      expect(newElo).toBeGreaterThan(1200);
    }

    const rink1Team2 = rink1Players.filter((a) => a.team === 2);
    for (const player of rink1Team2) {
      const newElo = calculateBowlsElo({
        position: player.position,
        playerRating: 1200,
        opponentRating: 1200,
        result: 0,
        shotDifferential: -rink1Result.margin,
        endsWon: rink1Result.endsWonB,
        endsPlayed: rink1Result.endsWonA + rink1Result.endsWonB,
      });
      expect(newElo).toBeLessThan(1200);
    }

    // Step 6: Build standings from results
    const standingsData = [
      {
        teamAPlayerIds: rink1Team1.map((a) => a.player_id),
        teamBPlayerIds: rink1Team2.map((a) => a.player_id),
        totalA: rink1Result.totalA,
        totalB: rink1Result.totalB,
        endsWonA: rink1Result.endsWonA,
        endsWonB: rink1Result.endsWonB,
        winner: rink1Result.winner!,
        isFinalized: true,
      },
      {
        teamAPlayerIds: rink2Players.filter((a) => a.team === 1).map((a) => a.player_id),
        teamBPlayerIds: rink2Players.filter((a) => a.team === 2).map((a) => a.player_id),
        totalA: rink2Result.totalA,
        totalB: rink2Result.totalB,
        endsWonA: rink2Result.endsWonA,
        endsWonB: rink2Result.endsWonB,
        winner: rink2Result.winner!,
        isFinalized: true,
      },
    ];

    const standings = buildStandings(standingsData);
    expect(standings).toHaveLength(16);

    const sorted = sortStandings(standings);
    expect(sorted[0].wins).toBe(1);
    expect(sorted[0].losses).toBe(0);

    // Step 7: Rating tiers updated
    const sampleNewRating = calculateBowlsElo({
      position: "skip",
      playerRating: 1200,
      opponentRating: 1200,
      result: 1,
      shotDifferential: 5,
      endsWon: 8,
      endsPlayed: 14,
    });
    const tier = getRatingTier(sampleNewRating);
    expect(["beginner", "intermediate", "advanced", "expert"]).toContain(tier);
  });
});
