import { describe, it, expect } from "vitest";
import {
  generateBowlsDraw,
  generateMeadDraw,
  generateGavelDraw,
  generateMultiRoundDraw,
  validateDrawCompatibility,
  DrawCompatibilityError,
} from "../lib/bowls-draw";
import type { BowlsCheckin, BowlsPosition, BowlsGameFormat } from "../lib/types";

// --- Helpers ---

function makePlayers(
  count: number,
  position: BowlsPosition | "any" = "any"
): BowlsCheckin[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `checkin-${i + 1}`,
    player_id: `player-${i + 1}`,
    tournament_id: "tourney-1",
    preferred_position: position === "any" ? "skip" : position,
    checkin_source: "app" as const,
    checked_in_at: new Date().toISOString(),
    player: {
      id: `player-${i + 1}`,
      display_name: `Player ${i + 1}`,
      avatar_url: null,
      skill_level: "intermediate" as const,
      sports: ["lawn_bowling"],
      is_available: true,
      checked_in_at: null,
      venue_id: null,
      role: "player" as const,
      insurance_status: "none" as const,
      preferred_position: position === "any" ? "skip" : position,
      years_playing: 2,
      experience_level: "social" as const,
      bio: null,
      home_club_name: null,
      bowling_formats: [],
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  }));
}

function makePlayersWithPositions(
  positions: BowlsPosition[]
): BowlsCheckin[] {
  return positions.map((pos, i) => ({
    id: `checkin-${i + 1}`,
    player_id: `player-${i + 1}`,
    tournament_id: "tourney-1",
    preferred_position: pos,
    checkin_source: "app" as const,
    checked_in_at: new Date().toISOString(),
    player: {
      id: `player-${i + 1}`,
      display_name: `Player ${i + 1}`,
      avatar_url: null,
      skill_level: "intermediate" as const,
      sports: ["lawn_bowling"],
      is_available: true,
      checked_in_at: null,
      venue_id: null,
      role: "player" as const,
      insurance_status: "none" as const,
      preferred_position: pos,
      years_playing: 2,
      experience_level: "social" as const,
      bio: null,
      home_club_name: null,
      bowling_formats: [],
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  }));
}

// --- Random Draw Tests ---

describe("Random Draw", () => {
  it("16 players, fours format: 2 rinks, 4 per team, all assigned", () => {
    const players = makePlayers(16);
    const result = generateBowlsDraw(players, "fours");

    expect(result.rinkCount).toBe(2);
    expect(result.rinks).toHaveLength(2);
    expect(result.unassigned).toHaveLength(0);
    expect(result.format).toBe("fours");

    // Each rink should have 8 players (4 per team x 2 teams)
    for (const rink of result.rinks) {
      expect(rink).toHaveLength(8);
      const team1 = rink.filter((a) => a.team === 1);
      const team2 = rink.filter((a) => a.team === 2);
      expect(team1).toHaveLength(4);
      expect(team2).toHaveLength(4);
    }
  });

  it("12 players, triples: 2 rinks, 3 per team", () => {
    const players = makePlayers(12);
    const result = generateBowlsDraw(players, "triples");

    expect(result.rinkCount).toBe(2);
    expect(result.rinks).toHaveLength(2);
    expect(result.unassigned).toHaveLength(0);

    for (const rink of result.rinks) {
      expect(rink).toHaveLength(6); // 3 per team x 2
      const team1 = rink.filter((a) => a.team === 1);
      const team2 = rink.filter((a) => a.team === 2);
      expect(team1).toHaveLength(3);
      expect(team2).toHaveLength(3);
    }
  });

  it("8 players, pairs: 2 rinks, 2 per team", () => {
    const players = makePlayers(8);
    const result = generateBowlsDraw(players, "pairs");

    expect(result.rinkCount).toBe(2);
    expect(result.rinks).toHaveLength(2);
    expect(result.unassigned).toHaveLength(0);

    for (const rink of result.rinks) {
      expect(rink).toHaveLength(4); // 2 per team x 2
    }
  });

  it("2 players, singles: 1 rink, 1v1", () => {
    const players = makePlayers(2);
    const result = generateBowlsDraw(players, "singles");

    expect(result.rinkCount).toBe(1);
    expect(result.rinks).toHaveLength(1);
    expect(result.unassigned).toHaveLength(0);
    expect(result.rinks[0]).toHaveLength(2);
    expect(result.rinks[0][0].team).toBe(1);
    expect(result.rinks[0][1].team).toBe(2);
  });

  it("odd number (17 players, fours): 2 rinks + 1 unassigned", () => {
    const players = makePlayers(17);
    const result = generateBowlsDraw(players, "fours");

    expect(result.rinkCount).toBe(2);
    expect(result.rinks).toHaveLength(2);
    expect(result.unassigned).toHaveLength(1);
  });

  it("3 players, fours: 0 rinks, all unassigned (not enough)", () => {
    const players = makePlayers(3);
    const result = generateBowlsDraw(players, "fours");

    expect(result.rinkCount).toBe(0);
    expect(result.rinks).toHaveLength(0);
    expect(result.unassigned).toHaveLength(3);
  });

  it("0 players: empty result", () => {
    const result = generateBowlsDraw([], "fours");

    expect(result.rinkCount).toBe(0);
    expect(result.rinks).toHaveLength(0);
    expect(result.unassigned).toHaveLength(0);
  });

  it("position pools: skips fill skip slots, leads fill lead slots", () => {
    // Create 8 players: 2 skips, 2 vices, 2 seconds, 2 leads
    const positions: BowlsPosition[] = [
      "skip", "skip", "vice", "vice", "second", "second", "lead", "lead",
    ];
    const players = makePlayersWithPositions(positions);
    const result = generateBowlsDraw(players, "fours");

    expect(result.rinkCount).toBe(1);
    expect(result.unassigned).toHaveLength(0);

    // The skip-preferred players should be assigned to skip positions
    const skipAssignments = result.rinks[0].filter((a) => a.position === "skip");
    expect(skipAssignments).toHaveLength(2);

    // All 4 positions should be represented per team
    const team1Positions = result.rinks[0]
      .filter((a) => a.team === 1)
      .map((a) => a.position);
    expect(team1Positions).toContain("skip");
    expect(team1Positions).toContain("vice");
    expect(team1Positions).toContain("second");
    expect(team1Positions).toContain("lead");
  });

  it("flexible players fill remaining slots after preferred positions", () => {
    // 8 players: 4 with position pref, 4 with a position that will overflow
    // All 8 prefer "skip" -> only 2 skip slots for 1 rink, rest become flexible
    const players = makePlayers(8, "skip");
    const result = generateBowlsDraw(players, "fours");

    expect(result.rinkCount).toBe(1);
    expect(result.unassigned).toHaveLength(0);
    // All 8 players assigned despite all wanting skip
    const allAssigned = result.rinks[0].map((a) => a.player_id);
    expect(allAssigned).toHaveLength(8);
  });

  it("no duplicate player IDs in output", () => {
    const players = makePlayers(16);
    const result = generateBowlsDraw(players, "fours");

    const allIds = result.rinks.flatMap((rink) =>
      rink.map((a) => a.player_id)
    );
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});

// --- Mead Draw Tests ---

describe("Mead Draw", () => {
  it("12 players, triples: multi-round rotation produces valid rounds", () => {
    const players = makePlayers(12);
    const result = generateMeadDraw(players, "triples");

    expect(result.style).toBe("mead");
    expect(result.totalRounds).toBeGreaterThan(1);
    expect(result.playerCount).toBe(12);
    expect(result.format).toBe("triples");

    for (const round of result.rounds) {
      expect(round.rinks.length).toBeGreaterThan(0);
      // Each rink should have 6 players (3 per team)
      for (const rink of round.rinks) {
        expect(rink).toHaveLength(6);
      }
    }
  });

  it("Mead rejects singles format", () => {
    const players = makePlayers(8);
    expect(() => generateMeadDraw(players, "singles")).toThrow(
      "Mead Draw is not available for singles format"
    );
  });

  it("Mead with unsupported player count throws DrawCompatibilityError", () => {
    const players = makePlayers(7); // 7 not in any Mead table
    expect(() => generateMeadDraw(players, "triples")).toThrow(
      DrawCompatibilityError
    );
  });

  it("Mead error includes supported counts and nearest count", () => {
    const players = makePlayers(10); // Not a supported triples count
    try {
      generateMeadDraw(players, "triples");
      expect.unreachable("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(DrawCompatibilityError);
      const err = e as DrawCompatibilityError;
      expect(err.supported_counts).toBeDefined();
      expect(err.supported_counts.length).toBeGreaterThan(0);
      expect(err.message).toContain("Nearest supported count");
      expect(err.message).toContain("Supported counts");
    }
  });

  it("each player appears exactly once per round in Mead draw", () => {
    const players = makePlayers(12);
    const result = generateMeadDraw(players, "triples");

    for (const round of result.rounds) {
      const playerIds = round.rinks.flatMap((rink) =>
        rink.map((a) => a.player_id)
      );
      // Add unassigned player IDs
      const unassignedIds = round.unassigned.map((u) => u.player_id);
      const allIds = [...playerIds, ...unassignedIds];

      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    }
  });
});

// --- Gavel Draw Tests ---

describe("Gavel Draw", () => {
  it("16 players, fours: multi-round Gavel rotation", () => {
    const players = makePlayers(16);
    const result = generateGavelDraw(players, "fours");

    expect(result.style).toBe("gavel");
    expect(result.totalRounds).toBeGreaterThan(1);
    expect(result.playerCount).toBe(16);
    expect(result.format).toBe("fours");

    for (const round of result.rounds) {
      expect(round.rinks.length).toBeGreaterThan(0);
      for (const rink of round.rinks) {
        expect(rink).toHaveLength(8); // 4 per team x 2
      }
    }
  });

  it("Gavel rejects non-fours format", () => {
    const players = makePlayers(12);
    expect(() => generateGavelDraw(players, "triples")).toThrow(
      "Gavel Draw is only available for fours format"
    );
  });

  it("Gavel with unsupported count throws DrawCompatibilityError", () => {
    const players = makePlayers(10); // Not a supported Gavel count
    expect(() => generateGavelDraw(players, "fours")).toThrow(
      DrawCompatibilityError
    );
  });
});

// --- Multi-Round & Validation ---

describe("Multi-Round & Validation", () => {
  it("generateMultiRoundDraw dispatches correctly to mead/gavel/random", () => {
    const players16 = makePlayers(16);

    // Random style -> 1 round
    const randomResult = generateMultiRoundDraw(players16, "fours", "random");
    expect(randomResult.style).toBe("random");
    expect(randomResult.totalRounds).toBe(1);

    // Seeded style -> 1 round
    const seededResult = generateMultiRoundDraw(players16, "fours", "seeded");
    expect(seededResult.style).toBe("seeded");
    expect(seededResult.totalRounds).toBe(1);

    // Mead style -> multi-round
    const meadResult = generateMultiRoundDraw(players16, "fours", "mead");
    expect(meadResult.style).toBe("mead");
    expect(meadResult.totalRounds).toBeGreaterThan(1);

    // Gavel style -> multi-round
    const gavelResult = generateMultiRoundDraw(players16, "fours", "gavel");
    expect(gavelResult.style).toBe("gavel");
    expect(gavelResult.totalRounds).toBeGreaterThan(1);
  });

  it("validateDrawCompatibility returns compatible=true for random/seeded", () => {
    const randomResult = validateDrawCompatibility(5, "fours", "random");
    expect(randomResult.compatible).toBe(true);

    const seededResult = validateDrawCompatibility(5, "fours", "seeded");
    expect(seededResult.compatible).toBe(true);
  });

  it("validateDrawCompatibility returns supported counts for mead", () => {
    const result = validateDrawCompatibility(12, "triples", "mead");
    expect(result.compatible).toBe(true);
    expect(result.supported_counts).toBeDefined();
    expect(result.supported_counts!).toContain(12);
    expect(result.min).toBeDefined();
    expect(result.max).toBeDefined();
  });

  it("validateDrawCompatibility returns incompatible for gavel+triples", () => {
    const result = validateDrawCompatibility(12, "triples", "gavel");
    expect(result.compatible).toBe(false);
    expect(result.supported_counts).toEqual([]);
  });
});

// --- Shuffle Fairness ---

describe("Shuffle Fairness", () => {
  it("random draw produces different assignments on multiple calls (non-deterministic)", () => {
    const players = makePlayers(16);
    const results = Array.from({ length: 10 }, () =>
      generateBowlsDraw(players, "fours")
    );

    // Get player_id order from rink 1 for each run
    const orderings = results.map((r) =>
      r.rinks[0].map((a) => a.player_id).join(",")
    );

    // At least 2 different orderings out of 10 runs (extremely likely with shuffle)
    const uniqueOrderings = new Set(orderings);
    expect(uniqueOrderings.size).toBeGreaterThan(1);
  });

  it("large pool (48 players, fours): 6 rinks, no orphans", () => {
    const players = makePlayers(48);
    const result = generateBowlsDraw(players, "fours");

    expect(result.rinkCount).toBe(6);
    expect(result.rinks).toHaveLength(6);
    expect(result.unassigned).toHaveLength(0);

    // Total assigned should be 48
    const totalAssigned = result.rinks.reduce(
      (sum, rink) => sum + rink.length,
      0
    );
    expect(totalAssigned).toBe(48);

    // No duplicate IDs
    const allIds = result.rinks.flatMap((rink) =>
      rink.map((a) => a.player_id)
    );
    expect(new Set(allIds).size).toBe(48);
  });
});
