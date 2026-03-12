/**
 * Unit tests for the game-engine Edge Function shared logic.
 *
 * Tests the pure game logic functions that power the Edge Function.
 * Run with: npx vitest run supabase/functions/game-engine/index.test.ts
 */

import { describe, it, expect } from "vitest";

// Import the shared game logic (same code used by the Edge Function)
// We test via the source copies since the _shared module uses Deno imports
import {
  calculateBowlsResult,
  calculateMatchResult,
  sortStandings,
  buildStandings,
  generateSeededDraw,
  generateSingleEliminationBracket,
} from "../../../src/lib/tournament-engine";
import {
  calculateElo,
  calculateBowlsElo,
  getRatingTier,
} from "../../../src/lib/elo";

// ─── calculateBowlsResult ───────────────────────────────────────────

describe("calculateBowlsResult", () => {
  it("calculates totals and determines winner", () => {
    const result = calculateBowlsResult([3, 1, 2, 4], [1, 2, 3, 0]);
    expect(result.totalA).toBe(10);
    expect(result.totalB).toBe(6);
    expect(result.winner).toBe("team_a");
    expect(result.margin).toBe(4);
    expect(result.endsWonA).toBe(2);
    expect(result.endsWonB).toBe(2);
  });

  it("detects draw", () => {
    const result = calculateBowlsResult([3, 2], [2, 3]);
    expect(result.totalA).toBe(5);
    expect(result.totalB).toBe(5);
    expect(result.winner).toBe("draw");
    expect(result.margin).toBe(0);
  });

  it("handles team B win", () => {
    const result = calculateBowlsResult([0, 1], [5, 3]);
    expect(result.winner).toBe("team_b");
    expect(result.totalB).toBe(8);
  });

  it("returns null winner for empty scores", () => {
    const result = calculateBowlsResult([], []);
    expect(result.winner).toBeNull();
    expect(result.totalA).toBe(0);
  });

  it("throws on mismatched score lengths", () => {
    expect(() => calculateBowlsResult([1, 2], [3])).toThrow(
      "Score arrays must have equal length"
    );
  });
});

// ─── calculateMatchResult ────────────────────────────────────────────

describe("calculateMatchResult", () => {
  it("determines single game winner", () => {
    const result = calculateMatchResult("p1", "p2", [
      { player1Score: 21, player2Score: 15 },
    ]);
    expect(result.winnerId).toBe("p1");
    expect(result.loserId).toBe("p2");
    expect(result.isDraw).toBe(false);
  });

  it("detects single game draw", () => {
    const result = calculateMatchResult("p1", "p2", [
      { player1Score: 15, player2Score: 15 },
    ]);
    expect(result.winnerId).toBeNull();
    expect(result.isDraw).toBe(true);
  });

  it("handles best of 3", () => {
    const result = calculateMatchResult(
      "p1",
      "p2",
      [
        { player1Score: 10, player2Score: 8 },
        { player1Score: 7, player2Score: 12 },
        { player1Score: 15, player2Score: 10 },
      ],
      "best_of_3"
    );
    expect(result.winnerId).toBe("p1");
    expect(result.gamesWon.player1).toBe(2);
    expect(result.gamesWon.player2).toBe(1);
  });

  it("handles best of 5 with early clinch", () => {
    const result = calculateMatchResult(
      "p1",
      "p2",
      [
        { player1Score: 5, player2Score: 10 },
        { player1Score: 3, player2Score: 8 },
        { player1Score: 6, player2Score: 12 },
      ],
      "best_of_5"
    );
    expect(result.winnerId).toBe("p2");
    expect(result.gamesWon.player2).toBe(3);
  });
});

// ─── ELO Calculations ───────────────────────────────────────────────

describe("calculateElo", () => {
  it("adjusts ratings correctly for equal-rated players", () => {
    const { newWinnerRating, newLoserRating } = calculateElo(1200, 1200);
    expect(newWinnerRating).toBeGreaterThan(1200);
    expect(newLoserRating).toBeLessThan(1200);
    // Equal ratings: expected = 0.5, so change = K * 0.5 = 16
    expect(newWinnerRating).toBe(1216);
    expect(newLoserRating).toBe(1184);
  });

  it("gives smaller gain when beating weaker opponent", () => {
    const { newWinnerRating: strongWins } = calculateElo(1500, 1200);
    const { newWinnerRating: weakWins } = calculateElo(1200, 1500);
    // Strong beating weak gains less than weak beating strong
    expect(weakWins - 1200).toBeGreaterThan(strongWins - 1500);
  });
});

describe("calculateBowlsElo", () => {
  it("uses position-specific K-factor", () => {
    const skipResult = calculateBowlsElo({
      position: "skip",
      playerRating: 1200,
      opponentRating: 1200,
      result: 1,
      shotDifferential: 5,
      endsWon: 8,
      endsPlayed: 12,
    });

    const leadResult = calculateBowlsElo({
      position: "lead",
      playerRating: 1200,
      opponentRating: 1200,
      result: 1,
      shotDifferential: 5,
      endsWon: 8,
      endsPlayed: 12,
    });

    // Skip (K=40) should change more than lead (K=28)
    expect(skipResult - 1200).toBeGreaterThan(leadResult - 1200);
  });

  it("applies margin multiplier for blowouts", () => {
    const closeWin = calculateBowlsElo({
      position: "singles",
      playerRating: 1200,
      opponentRating: 1200,
      result: 1,
      shotDifferential: 1,
      endsWon: 7,
      endsPlayed: 12,
    });

    const blowout = calculateBowlsElo({
      position: "singles",
      playerRating: 1200,
      opponentRating: 1200,
      result: 1,
      shotDifferential: 20,
      endsWon: 10,
      endsPlayed: 12,
    });

    expect(blowout - 1200).toBeGreaterThan(closeWin - 1200);
  });

  it("no margin multiplier on draws", () => {
    const drawResult = calculateBowlsElo({
      position: "vice",
      playerRating: 1200,
      opponentRating: 1200,
      result: 0.5,
      shotDifferential: 0,
      endsWon: 6,
      endsPlayed: 12,
    });
    // Draw against equal opponent should result in no change
    expect(drawResult).toBe(1200);
  });
});

describe("getRatingTier", () => {
  it("returns correct tiers", () => {
    expect(getRatingTier(2000)).toBe("expert");
    expect(getRatingTier(1800)).toBe("expert");
    expect(getRatingTier(1500)).toBe("advanced");
    expect(getRatingTier(1200)).toBe("intermediate");
    expect(getRatingTier(900)).toBe("beginner");
  });
});

// ─── Standings ───────────────────────────────────────────────────────

describe("buildStandings", () => {
  it("builds standings from results", () => {
    const standings = buildStandings([
      {
        teamAPlayerIds: ["p1"],
        teamBPlayerIds: ["p2"],
        totalA: 15,
        totalB: 10,
        endsWonA: 8,
        endsWonB: 4,
        winner: "team_a",
        isFinalized: true,
      },
      {
        teamAPlayerIds: ["p1"],
        teamBPlayerIds: ["p3"],
        totalA: 12,
        totalB: 18,
        endsWonA: 5,
        endsWonB: 7,
        winner: "team_b",
        isFinalized: true,
      },
    ]);

    expect(standings).toHaveLength(3);
    // p3 has 1 win, p1 has 1 win 1 loss, p2 has 1 loss
    const p3 = standings.find((s) => s.playerId === "p3");
    expect(p3?.wins).toBe(1);
    expect(p3?.losses).toBe(0);

    const p1 = standings.find((s) => s.playerId === "p1");
    expect(p1?.wins).toBe(1);
    expect(p1?.losses).toBe(1);
  });

  it("skips non-finalized results", () => {
    const standings = buildStandings([
      {
        teamAPlayerIds: ["p1"],
        teamBPlayerIds: ["p2"],
        totalA: 10,
        totalB: 5,
        endsWonA: 7,
        endsWonB: 3,
        winner: "team_a",
        isFinalized: false,
      },
    ]);
    expect(standings).toHaveLength(0);
  });
});

describe("sortStandings", () => {
  it("sorts by wins first, then shot difference", () => {
    const sorted = sortStandings([
      { playerId: "p1", wins: 1, losses: 1, draws: 0, pointsFor: 20, pointsAgainst: 20, shotDifference: 0, endsWon: 10, gamesPlayed: 2 },
      { playerId: "p2", wins: 2, losses: 0, draws: 0, pointsFor: 30, pointsAgainst: 15, shotDifference: 15, endsWon: 14, gamesPlayed: 2 },
      { playerId: "p3", wins: 1, losses: 1, draws: 0, pointsFor: 25, pointsAgainst: 18, shotDifference: 7, endsWon: 12, gamesPlayed: 2 },
    ]);
    expect(sorted[0].playerId).toBe("p2"); // 2 wins
    expect(sorted[1].playerId).toBe("p3"); // 1 win, +7 shot diff
    expect(sorted[2].playerId).toBe("p1"); // 1 win, 0 shot diff
  });
});

// ─── Draw Generation ─────────────────────────────────────────────────

describe("generateSeededDraw", () => {
  it("creates pairings for even number of players", () => {
    const pairings = generateSeededDraw(["p1", "p2", "p3", "p4"]);
    expect(pairings).toHaveLength(2);
    expect(pairings[0].player2Id).not.toBeNull();
    expect(pairings[1].player2Id).not.toBeNull();
  });

  it("creates bye for odd number of players", () => {
    const pairings = generateSeededDraw(["p1", "p2", "p3"]);
    expect(pairings).toHaveLength(2);
    const byeMatch = pairings.find((p) => p.player2Id === null);
    expect(byeMatch).toBeDefined();
  });

  it("returns empty for fewer than 2 players", () => {
    expect(generateSeededDraw(["p1"])).toHaveLength(0);
    expect(generateSeededDraw([])).toHaveLength(0);
  });
});

// ─── Bracket Generation ─────────────────────────────────────────────

describe("generateSingleEliminationBracket", () => {
  it("creates bracket for power-of-2 players", () => {
    const bracket = generateSingleEliminationBracket([
      "p1", "p2", "p3", "p4",
    ]);
    const round1 = bracket.filter((m) => m.round === 1);
    const round2 = bracket.filter((m) => m.round === 2);
    expect(round1).toHaveLength(2);
    expect(round2).toHaveLength(1);
  });

  it("handles byes for non-power-of-2 players", () => {
    const bracket = generateSingleEliminationBracket(["p1", "p2", "p3"]);
    const byeMatches = bracket.filter(
      (m) => m.round === 1 && m.status === "completed"
    );
    expect(byeMatches.length).toBeGreaterThan(0);
  });

  it("auto-advances bye winners to round 2", () => {
    const bracket = generateSingleEliminationBracket(["p1", "p2", "p3"]);
    const round2 = bracket.filter((m) => m.round === 2);
    const hasAdvanced = round2.some(
      (m) => m.player1Id !== null || m.player2Id !== null
    );
    expect(hasAdvanced).toBe(true);
  });

  it("returns empty for fewer than 2 players", () => {
    expect(generateSingleEliminationBracket(["p1"])).toHaveLength(0);
  });
});
