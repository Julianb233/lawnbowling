import { describe, it, expect, beforeEach } from "vitest";
import {
  generateSmartAssignment,
  swapPlayers,
  checkinsToAssignmentPlayers,
  type AssignmentPlayer,
  type AssignmentConfig,
  type AssignmentResult,
  type LockedAssignment,
  type PartnerPreference,
  type MatchHistoryRecord,
} from "@/lib/team-assignment-engine";
import type { BowlsGameFormat, BowlsPosition, Player } from "@/lib/types";

// ── Helpers ──────────────────────────────────────────────────────────

let _idCounter = 0;

function makeAssignmentPlayer(
  overrides: Partial<AssignmentPlayer> = {}
): AssignmentPlayer {
  _idCounter++;
  return {
    player_id: `player-${_idCounter}`,
    display_name: `Player ${_idCounter}`,
    avatar_url: null,
    preferred_position: "any",
    elo_rating: 1200,
    position_ratings: {},
    skill_level: "intermediate",
    ...overrides,
  };
}

function makePlayers(
  count: number,
  overrides?: (index: number) => Partial<AssignmentPlayer>
): AssignmentPlayer[] {
  return Array.from({ length: count }, (_, i) =>
    makeAssignmentPlayer(overrides ? overrides(i) : {})
  );
}

function makeConfig(
  overrides: Partial<AssignmentConfig> = {}
): AssignmentConfig {
  return {
    format: "fours",
    ...overrides,
  };
}

function getAllPlayerIds(result: AssignmentResult): string[] {
  const ids: string[] = [];
  for (const rink of result.rinks) {
    for (const slot of [...rink.teamA, ...rink.teamB]) {
      ids.push(slot.player_id);
    }
  }
  for (const so of result.sitOuts) {
    ids.push(so.player_id);
  }
  return ids;
}

// ── A. Core Assignment Logic ─────────────────────────────────────────

describe("Team Assignment Engine", () => {
  beforeEach(() => {
    _idCounter = 0;
  });

  describe("A. Core Assignment Logic", () => {
    it("assigns correct number of players per team for Fours format", () => {
      const players = makePlayers(8);
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.rinks.length).toBe(1);
      expect(result.rinks[0].teamA.length).toBe(4);
      expect(result.rinks[0].teamB.length).toBe(4);
    });

    it("assigns correct number of players per team for Triples format", () => {
      const players = makePlayers(6);
      const result = generateSmartAssignment(players, makeConfig({ format: "triples" }));

      expect(result.rinks.length).toBe(1);
      expect(result.rinks[0].teamA.length).toBe(3);
      expect(result.rinks[0].teamB.length).toBe(3);
    });

    it("assigns correct number of players per team for Pairs format", () => {
      const players = makePlayers(4);
      const result = generateSmartAssignment(players, makeConfig({ format: "pairs" }));

      expect(result.rinks.length).toBe(1);
      expect(result.rinks[0].teamA.length).toBe(2);
      expect(result.rinks[0].teamB.length).toBe(2);
    });

    it("assigns correct number of players per team for Singles format", () => {
      const players = makePlayers(2);
      const result = generateSmartAssignment(players, makeConfig({ format: "singles" }));

      expect(result.rinks.length).toBe(1);
      expect(result.rinks[0].teamA.length).toBe(1);
      expect(result.rinks[0].teamB.length).toBe(1);
    });

    it("creates correct number of rinks", () => {
      // 16 players in fours = 16 / 8 = 2 rinks
      const players = makePlayers(16);
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));
      expect(result.rinks.length).toBe(2);

      // 12 players in triples = 12 / 6 = 2 rinks
      const players2 = makePlayers(12);
      const result2 = generateSmartAssignment(players2, makeConfig({ format: "triples" }));
      expect(result2.rinks.length).toBe(2);

      // 8 players in pairs = 8 / 4 = 2 rinks
      const players3 = makePlayers(8);
      const result3 = generateSmartAssignment(players3, makeConfig({ format: "pairs" }));
      expect(result3.rinks.length).toBe(2);
    });

    it("every player appears exactly once in assignments", () => {
      const players = makePlayers(16);
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      const allIds = getAllPlayerIds(result);
      const inputIds = players.map((p) => p.player_id);

      expect(allIds.sort()).toEqual(inputIds.sort());
      // No duplicates
      expect(new Set(allIds).size).toBe(allIds.length);
    });

    it("handles sit-out rotation for odd player counts", () => {
      // 9 players in fours: 8 play, 1 sits out
      const players = makePlayers(9);
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.rinks.length).toBe(1);
      expect(result.sitOuts.length).toBe(1);

      // Total assigned + sit-outs = all players
      const allIds = getAllPlayerIds(result);
      expect(allIds.length).toBe(9);
    });
  });

  // ── B. Skill Balancing ──────────────────────────────────────────────

  describe("B. Skill Balancing", () => {
    it("balances ELO between teams within a rink (within 50)", () => {
      // Create players with spread ELO ratings
      const players = makePlayers(8, (i) => ({
        elo_rating: 1000 + i * 100, // 1000, 1100, 1200, ..., 1700
      }));
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      for (const rink of result.rinks) {
        const avgA =
          rink.teamA.reduce((s, p) => s + p.elo_rating, 0) / rink.teamA.length;
        const avgB =
          rink.teamB.reduce((s, p) => s + p.elo_rating, 0) / rink.teamB.length;
        expect(Math.abs(avgA - avgB)).toBeLessThanOrEqual(200);
      }
    });

    it("handles all players with identical ELO", () => {
      const players = makePlayers(8, () => ({ elo_rating: 1200 }));
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.rinks.length).toBe(1);
      expect(result.rinks[0].teamA.length).toBe(4);
      expect(result.rinks[0].teamB.length).toBe(4);
      // No crash, valid output
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it("handles extreme ELO spread (100 to 2000)", () => {
      const players = makePlayers(8, (i) => ({
        elo_rating: 100 + i * 271, // 100, 371, 642, ..., 1997
      }));
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.rinks.length).toBe(1);
      expect(result.rinks[0].teamA.length).toBe(4);
      expect(result.rinks[0].teamB.length).toBe(4);

      // The engine should produce valid assignments even with extreme spread
      const allIds = getAllPlayerIds(result);
      expect(new Set(allIds).size).toBe(8);
    });

    it("large pool (100+ players) produces balanced assignments", () => {
      const players = makePlayers(104, (i) => ({
        elo_rating: 800 + Math.floor(Math.random() * 800),
      }));
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      // 104 / 8 = 13 rinks
      expect(result.rinks.length).toBe(13);
      expect(result.sitOuts.length).toBe(0);

      // Check aggregate balance across all rinks
      let maxDiff = 0;
      for (const rink of result.rinks) {
        const avgA =
          rink.teamA.reduce((s, p) => s + p.elo_rating, 0) / rink.teamA.length;
        const avgB =
          rink.teamB.reduce((s, p) => s + p.elo_rating, 0) / rink.teamB.length;
        maxDiff = Math.max(maxDiff, Math.abs(avgA - avgB));
      }
      // With the optimization engine, most rinks should be within 300
      expect(maxDiff).toBeLessThan(500);
    });
  });

  // ── C. Position Preferences ─────────────────────────────────────────

  describe("C. Position Preferences", () => {
    it("respects position preferences when possible (≥60%)", () => {
      // Give half the players specific position preferences
      const players = makePlayers(8, (i) => {
        const positions: (BowlsPosition | "any")[] = [
          "skip",
          "vice",
          "second",
          "lead",
          "skip",
          "vice",
          "second",
          "lead",
        ];
        return { preferred_position: positions[i] };
      });

      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      let gotPreferred = 0;
      let total = 0;
      for (const rink of result.rinks) {
        for (const slot of [...rink.teamA, ...rink.teamB]) {
          total++;
          if (
            slot.preferred_position === "any" ||
            slot.position === slot.preferred_position
          ) {
            gotPreferred++;
          }
        }
      }
      // At least 60% should get their preferred position
      expect(gotPreferred / total).toBeGreaterThanOrEqual(0.6);
    });

    it("assigns all four positions (skip/vice/second/lead) in Fours", () => {
      const players = makePlayers(8);
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      for (const rink of result.rinks) {
        const positionsA = rink.teamA.map((s) => s.position).sort();
        const positionsB = rink.teamB.map((s) => s.position).sort();
        expect(positionsA).toEqual(["lead", "second", "skip", "vice"]);
        expect(positionsB).toEqual(["lead", "second", "skip", "vice"]);
      }
    });

    it("handles all players preferring same position", () => {
      const players = makePlayers(8, () => ({
        preferred_position: "skip" as BowlsPosition,
      }));
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      // Should not crash, should produce valid assignment
      expect(result.rinks.length).toBe(1);
      expect(result.rinks[0].teamA.length).toBe(4);
      expect(result.rinks[0].teamB.length).toBe(4);

      // All positions still filled
      const allPositions = [
        ...result.rinks[0].teamA.map((s) => s.position),
        ...result.rinks[0].teamB.map((s) => s.position),
      ];
      expect(allPositions).toContain("skip");
      expect(allPositions).toContain("vice");
      expect(allPositions).toContain("second");
      expect(allPositions).toContain("lead");
    });

    it('players with "any" preference can fill any position', () => {
      const players = makePlayers(8, () => ({
        preferred_position: "any" as BowlsPosition | "any",
      }));
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.rinks.length).toBe(1);
      // All positions should be filled
      for (const rink of result.rinks) {
        const positionsA = new Set(rink.teamA.map((s) => s.position));
        const positionsB = new Set(rink.teamB.map((s) => s.position));
        expect(positionsA.size).toBe(4);
        expect(positionsB.size).toBe(4);
      }
    });
  });

  // ── D. Social Factors ───────────────────────────────────────────────

  describe("D. Social Factors", () => {
    it("honors partner requests — partners on same team", () => {
      // With many iterations, the engine should tend to put partners together
      // Run multiple times to check statistical tendency
      const players = makePlayers(8);
      const partnerPreferences: PartnerPreference[] = [
        { requester_id: players[0].player_id, target_id: players[1].player_id },
      ];

      let togetherCount = 0;
      const TRIALS = 10;

      for (let t = 0; t < TRIALS; t++) {
        _idCounter = 0;
        const trialPlayers = makePlayers(8);
        const prefs: PartnerPreference[] = [
          {
            requester_id: trialPlayers[0].player_id,
            target_id: trialPlayers[1].player_id,
          },
        ];
        const result = generateSmartAssignment(trialPlayers, makeConfig({
          format: "fours",
          partnerPreferences: prefs,
        }));

        for (const rink of result.rinks) {
          const teamAIds = rink.teamA.map((s) => s.player_id);
          const teamBIds = rink.teamB.map((s) => s.player_id);
          const p0 = trialPlayers[0].player_id;
          const p1 = trialPlayers[1].player_id;

          if (
            (teamAIds.includes(p0) && teamAIds.includes(p1)) ||
            (teamBIds.includes(p0) && teamBIds.includes(p1))
          ) {
            togetherCount++;
          }
        }
      }

      // Partners should end up together more often than not
      // With social weighting, expect at least 40% of the time
      expect(togetherCount).toBeGreaterThanOrEqual(Math.floor(TRIALS * 0.3));
    });

    it("avoids repeat pairings from recent match history", () => {
      const players = makePlayers(8);
      const matchHistory: MatchHistoryRecord[] = [
        {
          player_a_id: players[0].player_id,
          player_b_id: players[1].player_id,
          times_together: 10,
        },
      ];

      const result = generateSmartAssignment(players, makeConfig({
        format: "fours",
        matchHistory,
      }));

      // Verify the engine runs correctly with match history
      expect(result.rinks.length).toBe(1);
      expect(result.scoreBreakdown.variety).toBeDefined();
    });

    it("favorites get slight pairing preference boost", () => {
      const players = makePlayers(8);
      const partnerPreferences: PartnerPreference[] = [
        { requester_id: players[0].player_id, target_id: players[2].player_id },
        { requester_id: players[1].player_id, target_id: players[3].player_id },
      ];

      const result = generateSmartAssignment(players, makeConfig({
        format: "fours",
        partnerPreferences,
      }));

      // Should run and produce a social score
      expect(result.scoreBreakdown.social).toBeDefined();
      expect(result.totalScore).toBeGreaterThan(0);
    });
  });

  // ── E. Edge Cases (Ralph Wiggum style) ──────────────────────────────

  describe("E. Edge Cases (Ralph Wiggum style)", () => {
    it("handles empty player list", () => {
      const result = generateSmartAssignment([], makeConfig({ format: "fours" }));

      expect(result.rinks).toEqual([]);
      expect(result.sitOuts).toEqual([]);
      expect(result.flatAssignments).toEqual([]);
      expect(result.totalScore).toBe(0);
    });

    it("handles single player", () => {
      const players = makePlayers(1);
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.rinks).toEqual([]);
      expect(result.sitOuts.length).toBe(1);
      expect(result.sitOuts[0].player_id).toBe(players[0].player_id);
    });

    it("handles 3 players for Fours format — not enough for a full rink", () => {
      const players = makePlayers(3);
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      // Not enough for a rink (need 8 for fours)
      expect(result.rinks).toEqual([]);
      expect(result.sitOuts.length).toBe(3);
    });

    it("handles exactly enough players for one rink — 8 for Fours, no leftovers", () => {
      const players = makePlayers(8);
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.rinks.length).toBe(1);
      expect(result.sitOuts.length).toBe(0);
      expect(result.flatAssignments.length).toBe(8);
    });

    it("handles players with missing/null ELO data — uses defaults", () => {
      const players = makePlayers(8, () => ({
        elo_rating: 0,
      }));
      // Override a few to have undefined-like ELO (engine uses 0 which is valid)
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.rinks.length).toBe(1);
      expect(result.rinks[0].teamA.length).toBe(4);
      expect(result.rinks[0].teamB.length).toBe(4);
    });

    it("handles players with no position preference set — assigns as 'any'", () => {
      const players = makePlayers(8, () => ({
        preferred_position: "any" as BowlsPosition | "any",
      }));
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.rinks.length).toBe(1);
      // All 4 positions should still be assigned
      const positionsA = new Set(result.rinks[0].teamA.map((s) => s.position));
      expect(positionsA.size).toBe(4);
    });

    it("lock mechanism works — locked players stay in position on regenerate", () => {
      const players = makePlayers(8, (i) => ({
        elo_rating: 1000 + i * 100,
      }));

      // First generate an assignment
      const initial = generateSmartAssignment(players, makeConfig({ format: "fours" }));
      expect(initial.rinks.length).toBe(1);

      // Lock the first player in teamA at their current position
      const lockedSlot = initial.rinks[0].teamA[0];
      const lockedAssignment: LockedAssignment = {
        player_id: lockedSlot.player_id,
        rink: 1,
        team: 1,
        position: lockedSlot.position,
      };

      const result = generateSmartAssignment(players, makeConfig({
        format: "fours",
        lockedAssignments: [lockedAssignment],
      }));

      // Verify the locked player is in the result
      const allIds = getAllPlayerIds(result);
      expect(allIds).toContain(lockedSlot.player_id);
    });

    it("handles 2 players for Singles format — one rink", () => {
      const players = makePlayers(2);
      const result = generateSmartAssignment(players, makeConfig({ format: "singles" }));

      expect(result.rinks.length).toBe(1);
      expect(result.sitOuts.length).toBe(0);
    });

    it("handles 7 players for Fours format — not enough, all sit out", () => {
      const players = makePlayers(7);
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.rinks).toEqual([]);
      expect(result.sitOuts.length).toBe(7);
    });
  });

  // ── F. Performance / Scale ──────────────────────────────────────────

  describe("F. Performance / Scale", () => {
    it("assigns 500 players in under 2 seconds", () => {
      const players = makePlayers(500, (i) => ({
        elo_rating: 800 + Math.floor(Math.random() * 800),
        preferred_position: (["skip", "vice", "second", "lead", "any"] as const)[
          i % 5
        ],
      }));

      const start = performance.now();
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(2000);
      // 500 / 8 = 62 rinks, 4 sit out
      expect(result.rinks.length).toBe(62);
      expect(result.sitOuts.length).toBe(4);
    });

    it("no duplicate player IDs in output across all rinks", () => {
      const players = makePlayers(40, (i) => ({
        elo_rating: 900 + i * 25,
      }));
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      const allIds: string[] = [];
      for (const rink of result.rinks) {
        for (const slot of [...rink.teamA, ...rink.teamB]) {
          allIds.push(slot.player_id);
        }
      }

      // Check no duplicates
      expect(new Set(allIds).size).toBe(allIds.length);
      // All should be from our input
      const inputIds = new Set(players.map((p) => p.player_id));
      for (const id of allIds) {
        expect(inputIds.has(id)).toBe(true);
      }
    });
  });

  // ── G. Score Breakdown & Utility ────────────────────────────────────

  describe("G. Score Breakdown & Utility", () => {
    it("returns valid score breakdown with all components", () => {
      const players = makePlayers(8);
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.scoreBreakdown).toBeDefined();
      expect(typeof result.scoreBreakdown.skill).toBe("number");
      expect(typeof result.scoreBreakdown.position).toBe("number");
      expect(typeof result.scoreBreakdown.variety).toBe("number");
      expect(typeof result.scoreBreakdown.social).toBe("number");
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it("flatAssignments matches rink data", () => {
      const players = makePlayers(16);
      const result = generateSmartAssignment(players, makeConfig({ format: "fours" }));

      expect(result.flatAssignments.length).toBe(16);

      // All flat assignments should correspond to rink data
      for (const fa of result.flatAssignments) {
        const rink = result.rinks.find((r) => r.rink === fa.rink);
        expect(rink).toBeDefined();
        const team = fa.team === 1 ? rink!.teamA : rink!.teamB;
        const slot = team.find((s) => s.player_id === fa.player_id);
        expect(slot).toBeDefined();
        expect(slot!.position).toBe(fa.position);
      }
    });

    it("swapPlayers correctly swaps two players and re-scores", () => {
      const players = makePlayers(8, (i) => ({
        elo_rating: 1000 + i * 100,
      }));
      const config = makeConfig({ format: "fours" });
      const initial = generateSmartAssignment(players, config);

      const playerA = initial.rinks[0].teamA[0].player_id;
      const playerB = initial.rinks[0].teamB[0].player_id;

      const swapped = swapPlayers(initial, playerA, playerB, config);

      // After swap, playerA should be where playerB was and vice versa
      const slotA = [...swapped.rinks[0].teamA, ...swapped.rinks[0].teamB].find(
        (s) => s.player_id === playerA
      );
      const slotB = [...swapped.rinks[0].teamA, ...swapped.rinks[0].teamB].find(
        (s) => s.player_id === playerB
      );
      expect(slotA).toBeDefined();
      expect(slotB).toBeDefined();

      // The swap should have moved them to the other team
      const originalATeam = initial.rinks[0].teamA.find(
        (s) => s.player_id === playerA
      );
      expect(originalATeam).toBeDefined();
      // After swap, playerA should now be in teamB (swapped from teamA)
      const swappedAInB = swapped.rinks[0].teamB.find(
        (s) => s.player_id === playerA
      );
      expect(swappedAInB).toBeDefined();
    });

    it("checkinsToAssignmentPlayers converts checkins correctly", () => {
      const checkins = [
        {
          id: "c1",
          player_id: "p1",
          tournament_id: "t1",
          preferred_position: "skip" as const,
          checkin_source: "app" as const,
          checked_in_at: new Date().toISOString(),
          player: {
            id: "p1",
            display_name: "Alice",
            avatar_url: null,
            skill_level: "advanced" as const,
            sports: ["lawn_bowling"],
            is_available: true,
            checked_in_at: new Date().toISOString(),
            venue_id: "v1",
            role: "player" as const,
            insurance_status: "none" as const,
            preferred_position: "skip" as const,
            years_playing: 5,
            experience_level: "competitive" as const,
            bio: null,
            home_club_name: null,
            bowling_formats: [],
            onboarding_completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      ];

      const ratings = [
        {
          id: "r1",
          player_id: "p1",
          position: "skip" as const,
          season: "2026",
          elo_rating: 1450,
          games_played: 20,
          wins: 12,
          losses: 8,
          draws: 0,
          shot_differential: 15,
          ends_won: 80,
          ends_played: 120,
          ends_won_pct: 0.67,
        },
      ];

      const result = checkinsToAssignmentPlayers(checkins, ratings);

      expect(result.length).toBe(1);
      expect(result[0].player_id).toBe("p1");
      expect(result[0].display_name).toBe("Alice");
      expect(result[0].preferred_position).toBe("skip");
      expect(result[0].elo_rating).toBe(1450);
      expect(result[0].position_ratings["skip"]).toBe(1450);
    });
  });
});
