import { describe, it, expect } from "vitest";
import {
  calculateMatchResult,
  calculateBowlsResult,
  sortStandings,
  buildStandings,
  generateSeededDraw,
  handleBye,
  generateSingleEliminationBracket,
  generateDoubleEliminationBracket,
  getNextMatchSlot,
  isTournamentComplete,
  determineTournamentWinner,
  handleForfeit,
  seedPlayersForNextRound,
  type Standing,
  type GameScore,
} from "@/lib/tournament-engine";

// ─── calculateMatchResult ────────────────────────────────────────────

describe("calculateMatchResult", () => {
  it("determines winner in single-game format", () => {
    const result = calculateMatchResult("p1", "p2", [
      { player1Score: 21, player2Score: 15 },
    ]);
    expect(result.winnerId).toBe("p1");
    expect(result.loserId).toBe("p2");
    expect(result.isDraw).toBe(false);
  });

  it("detects a draw in single-game format", () => {
    const result = calculateMatchResult("p1", "p2", [
      { player1Score: 10, player2Score: 10 },
    ]);
    expect(result.winnerId).toBeNull();
    expect(result.isDraw).toBe(true);
  });

  it("handles best-of-3 format — player1 wins 2-0", () => {
    const games: GameScore[] = [
      { player1Score: 21, player2Score: 15 },
      { player1Score: 21, player2Score: 18 },
    ];
    const result = calculateMatchResult("p1", "p2", games, "best_of_3");
    expect(result.winnerId).toBe("p1");
    expect(result.gamesWon.player1).toBe(2);
    expect(result.gamesWon.player2).toBe(0);
  });

  it("handles best-of-3 format — player2 wins 2-1", () => {
    const games: GameScore[] = [
      { player1Score: 21, player2Score: 15 },
      { player1Score: 10, player2Score: 21 },
      { player1Score: 18, player2Score: 21 },
    ];
    const result = calculateMatchResult("p1", "p2", games, "best_of_3");
    expect(result.winnerId).toBe("p2");
    expect(result.gamesWon.player1).toBe(1);
    expect(result.gamesWon.player2).toBe(2);
  });

  it("handles best-of-5 format — needs 3 wins", () => {
    const games: GameScore[] = [
      { player1Score: 11, player2Score: 7 },
      { player1Score: 7, player2Score: 11 },
      { player1Score: 11, player2Score: 9 },
      { player1Score: 11, player2Score: 5 },
    ];
    const result = calculateMatchResult("p1", "p2", games, "best_of_5");
    expect(result.winnerId).toBe("p1");
    expect(result.gamesWon.player1).toBe(3);
  });

  it("returns null winner when match is incomplete", () => {
    const result = calculateMatchResult("p1", "p2", [
      { player1Score: 11, player2Score: 7 },
    ], "best_of_3");
    expect(result.winnerId).toBeNull();
    expect(result.gamesWon.player1).toBe(1);
    expect(result.gamesWon.player2).toBe(0);
  });

  it("calculates total scores across games", () => {
    const games: GameScore[] = [
      { player1Score: 21, player2Score: 15 },
      { player1Score: 18, player2Score: 21 },
    ];
    const result = calculateMatchResult("p1", "p2", games, "best_of_3");
    expect(result.totalScore.player1).toBe(39);
    expect(result.totalScore.player2).toBe(36);
  });
});

// ─── calculateBowlsResult ───────────────────────────────────────────

describe("calculateBowlsResult", () => {
  it("calculates totals and winner correctly", () => {
    const result = calculateBowlsResult([3, 0, 2, 4], [0, 5, 1, 0]);
    expect(result.totalA).toBe(9);
    expect(result.totalB).toBe(6);
    expect(result.endsWonA).toBe(3);
    expect(result.endsWonB).toBe(1);
    expect(result.winner).toBe("team_a");
    expect(result.margin).toBe(3);
  });

  it("detects a draw", () => {
    const result = calculateBowlsResult([3, 2, 1], [1, 2, 3]);
    expect(result.totalA).toBe(6);
    expect(result.totalB).toBe(6);
    expect(result.winner).toBe("draw");
    expect(result.margin).toBe(0);
  });

  it("returns null winner for empty scores", () => {
    const result = calculateBowlsResult([], []);
    expect(result.winner).toBeNull();
    expect(result.totalA).toBe(0);
  });

  it("throws for mismatched array lengths", () => {
    expect(() => calculateBowlsResult([1, 2], [3])).toThrow(
      "Score arrays must have equal length"
    );
  });
});

// ─── sortStandings ───────────────────────────────────────────────────

describe("sortStandings", () => {
  const base: Standing = {
    playerId: "",
    wins: 0,
    losses: 0,
    draws: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    shotDifference: 0,
    endsWon: 0,
    gamesPlayed: 0,
  };

  it("sorts by wins first", () => {
    const standings: Standing[] = [
      { ...base, playerId: "a", wins: 1 },
      { ...base, playerId: "b", wins: 3 },
      { ...base, playerId: "c", wins: 2 },
    ];
    const sorted = sortStandings(standings);
    expect(sorted.map((s) => s.playerId)).toEqual(["b", "c", "a"]);
  });

  it("breaks ties with shot difference", () => {
    const standings: Standing[] = [
      { ...base, playerId: "a", wins: 2, shotDifference: 5 },
      { ...base, playerId: "b", wins: 2, shotDifference: 10 },
    ];
    const sorted = sortStandings(standings);
    expect(sorted[0].playerId).toBe("b");
  });

  it("breaks further ties with ends won", () => {
    const standings: Standing[] = [
      { ...base, playerId: "a", wins: 2, shotDifference: 5, endsWon: 8 },
      { ...base, playerId: "b", wins: 2, shotDifference: 5, endsWon: 12 },
    ];
    const sorted = sortStandings(standings);
    expect(sorted[0].playerId).toBe("b");
  });

  it("breaks final ties with points for", () => {
    const standings: Standing[] = [
      { ...base, playerId: "a", wins: 2, shotDifference: 5, endsWon: 8, pointsFor: 30 },
      { ...base, playerId: "b", wins: 2, shotDifference: 5, endsWon: 8, pointsFor: 45 },
    ];
    const sorted = sortStandings(standings);
    expect(sorted[0].playerId).toBe("b");
  });
});

// ─── buildStandings ──────────────────────────────────────────────────

describe("buildStandings", () => {
  it("builds standings from rink results", () => {
    const results = [
      {
        teamAPlayerIds: ["p1", "p2"],
        teamBPlayerIds: ["p3", "p4"],
        totalA: 20,
        totalB: 15,
        endsWonA: 10,
        endsWonB: 5,
        winner: "team_a" as const,
        isFinalized: true,
      },
    ];
    const standings = buildStandings(results);
    expect(standings).toHaveLength(4);

    const p1 = standings.find((s) => s.playerId === "p1")!;
    expect(p1.wins).toBe(1);
    expect(p1.pointsFor).toBe(20);
    expect(p1.pointsAgainst).toBe(15);
    expect(p1.shotDifference).toBe(5);

    const p3 = standings.find((s) => s.playerId === "p3")!;
    expect(p3.losses).toBe(1);
    expect(p3.shotDifference).toBe(-5);
  });

  it("ignores non-finalized results", () => {
    const results = [
      {
        teamAPlayerIds: ["p1"],
        teamBPlayerIds: ["p2"],
        totalA: 10,
        totalB: 5,
        endsWonA: 5,
        endsWonB: 3,
        winner: "team_a" as const,
        isFinalized: false,
      },
    ];
    const standings = buildStandings(results);
    expect(standings).toHaveLength(0);
  });

  it("accumulates across multiple rounds", () => {
    const results = [
      {
        teamAPlayerIds: ["p1"],
        teamBPlayerIds: ["p2"],
        totalA: 20,
        totalB: 15,
        endsWonA: 8,
        endsWonB: 6,
        winner: "team_a" as const,
        isFinalized: true,
      },
      {
        teamAPlayerIds: ["p2"],
        teamBPlayerIds: ["p1"],
        totalA: 18,
        totalB: 12,
        endsWonA: 9,
        endsWonB: 5,
        winner: "team_a" as const,
        isFinalized: true,
      },
    ];
    const standings = buildStandings(results);
    const p1 = standings.find((s) => s.playerId === "p1")!;
    expect(p1.gamesPlayed).toBe(2);
    expect(p1.wins).toBe(1);
    expect(p1.losses).toBe(1);
    expect(p1.pointsFor).toBe(32); // 20 + 12
    expect(p1.pointsAgainst).toBe(33); // 15 + 18
  });
});

// ─── generateSeededDraw ──────────────────────────────────────────────

describe("generateSeededDraw", () => {
  it("pairs top seed with bottom seed (snake seeding)", () => {
    const pairings = generateSeededDraw(["s1", "s2", "s3", "s4"]);
    expect(pairings).toHaveLength(2);
    expect(pairings[0]).toEqual({
      player1Id: "s1",
      player2Id: "s4",
      matchNumber: 1,
    });
    expect(pairings[1]).toEqual({
      player1Id: "s2",
      player2Id: "s3",
      matchNumber: 2,
    });
  });

  it("handles odd number of players with a bye", () => {
    const pairings = generateSeededDraw(["s1", "s2", "s3"]);
    expect(pairings).toHaveLength(2);
    expect(pairings[0].player1Id).toBe("s1");
    expect(pairings[0].player2Id).toBe("s3");
    expect(pairings[1].player1Id).toBe("s2");
    expect(pairings[1].player2Id).toBeNull();
  });

  it("avoids repeat opponents when history provided", () => {
    const prev = new Map<string, Set<string>>();
    prev.set("s1", new Set(["s4"]));
    prev.set("s4", new Set(["s1"]));

    const pairings = generateSeededDraw(["s1", "s2", "s3", "s4"], prev);
    // s1 should not be paired with s4
    const s1Pairing = pairings.find((p) => p.player1Id === "s1");
    expect(s1Pairing?.player2Id).not.toBe("s4");
  });

  it("falls back to repeat when no other option", () => {
    // Only 2 players — must re-pair
    const prev = new Map<string, Set<string>>();
    prev.set("s1", new Set(["s2"]));
    prev.set("s2", new Set(["s1"]));

    const pairings = generateSeededDraw(["s1", "s2"], prev);
    expect(pairings).toHaveLength(1);
    expect(pairings[0].player1Id).toBe("s1");
    expect(pairings[0].player2Id).toBe("s2");
  });

  it("returns empty for less than 2 players", () => {
    expect(generateSeededDraw(["s1"])).toEqual([]);
    expect(generateSeededDraw([])).toEqual([]);
  });

  it("handles 8 players correctly", () => {
    const ids = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];
    const pairings = generateSeededDraw(ids);
    expect(pairings).toHaveLength(4);
    // All players should be in exactly one pairing
    const allPlayerIds = pairings.flatMap((p) => [p.player1Id, p.player2Id].filter(Boolean));
    expect(new Set(allPlayerIds).size).toBe(8);
  });

  it("handles 16 players correctly", () => {
    const ids = Array.from({ length: 16 }, (_, i) => `s${i + 1}`);
    const pairings = generateSeededDraw(ids);
    expect(pairings).toHaveLength(8);
  });

  it("handles 32 players correctly", () => {
    const ids = Array.from({ length: 32 }, (_, i) => `s${i + 1}`);
    const pairings = generateSeededDraw(ids);
    expect(pairings).toHaveLength(16);
  });
});

// ─── handleBye ───────────────────────────────────────────────────────

describe("handleBye", () => {
  it("returns player1 when player2 is null", () => {
    expect(
      handleBye({ player1Id: "p1", player2Id: null, matchNumber: 1 })
    ).toBe("p1");
  });

  it("returns player2 when player1 is null", () => {
    expect(
      handleBye({ player1Id: null as unknown as string, player2Id: "p2", matchNumber: 1 })
    ).toBe("p2");
  });

  it("returns null when both players are present", () => {
    expect(
      handleBye({ player1Id: "p1", player2Id: "p2", matchNumber: 1 })
    ).toBeNull();
  });
});

// ─── generateSingleEliminationBracket ────────────────────────────────

describe("generateSingleEliminationBracket", () => {
  it("generates correct bracket for 4 players", () => {
    const matches = generateSingleEliminationBracket(["p1", "p2", "p3", "p4"]);
    const round1 = matches.filter((m) => m.round === 1);
    const round2 = matches.filter((m) => m.round === 2);

    expect(round1).toHaveLength(2);
    expect(round2).toHaveLength(1);
    // p1 vs p4, p2 vs p3
    expect(round1[0].player1Id).toBe("p1");
    expect(round1[0].player2Id).toBe("p4");
    expect(round1[1].player1Id).toBe("p2");
    expect(round1[1].player2Id).toBe("p3");
  });

  it("generates correct bracket for 8 players", () => {
    const ids = Array.from({ length: 8 }, (_, i) => `p${i + 1}`);
    const matches = generateSingleEliminationBracket(ids);

    const round1 = matches.filter((m) => m.round === 1);
    const round2 = matches.filter((m) => m.round === 2);
    const round3 = matches.filter((m) => m.round === 3);

    expect(round1).toHaveLength(4);
    expect(round2).toHaveLength(2);
    expect(round3).toHaveLength(1);
  });

  it("handles byes for 5 players (bracket size = 8)", () => {
    const ids = ["p1", "p2", "p3", "p4", "p5"];
    const matches = generateSingleEliminationBracket(ids);

    const round1 = matches.filter((m) => m.round === 1);
    const byes = round1.filter((m) => m.status === "completed");

    expect(round1).toHaveLength(4);
    expect(byes.length).toBeGreaterThan(0);
    // Bye winners should be auto-advanced to round 2
    byes.forEach((bye) => {
      expect(bye.winnerId).toBeTruthy();
    });
  });

  it("handles byes for 6 players", () => {
    const ids = Array.from({ length: 6 }, (_, i) => `p${i + 1}`);
    const matches = generateSingleEliminationBracket(ids);
    const round1 = matches.filter((m) => m.round === 1);
    const byeMatches = round1.filter((m) => m.status === "completed");
    expect(byeMatches).toHaveLength(2);
  });

  it("auto-advances bye winners to round 2", () => {
    const ids = ["p1", "p2", "p3"];
    const matches = generateSingleEliminationBracket(ids);
    const round2 = matches.filter((m) => m.round === 2);
    // At least one slot in round 2 should be filled
    const filledSlots = round2.filter(
      (m) => m.player1Id !== null || m.player2Id !== null
    );
    expect(filledSlots.length).toBeGreaterThan(0);
  });

  it("generates correct bracket for 16 players", () => {
    const ids = Array.from({ length: 16 }, (_, i) => `p${i + 1}`);
    const matches = generateSingleEliminationBracket(ids);
    expect(matches.filter((m) => m.round === 1)).toHaveLength(8);
    expect(matches.filter((m) => m.round === 2)).toHaveLength(4);
    expect(matches.filter((m) => m.round === 3)).toHaveLength(2);
    expect(matches.filter((m) => m.round === 4)).toHaveLength(1);
  });

  it("generates correct bracket for 32 players", () => {
    const ids = Array.from({ length: 32 }, (_, i) => `p${i + 1}`);
    const matches = generateSingleEliminationBracket(ids);
    expect(matches.filter((m) => m.round === 1)).toHaveLength(16);
    expect(matches.filter((m) => m.round === 5)).toHaveLength(1);
  });

  it("returns empty for less than 2 players", () => {
    expect(generateSingleEliminationBracket(["p1"])).toEqual([]);
  });
});

// ─── generateDoubleEliminationBracket ────────────────────────────────

describe("generateDoubleEliminationBracket", () => {
  it("generates winners, losers, and grand final brackets", () => {
    const ids = ["p1", "p2", "p3", "p4"];
    const matches = generateDoubleEliminationBracket(ids);

    const winners = matches.filter((m) => m.bracket === "winners");
    const losers = matches.filter((m) => m.bracket === "losers");
    const grandFinal = matches.filter((m) => m.bracket === "grand_final");

    expect(winners.length).toBeGreaterThan(0);
    expect(losers.length).toBeGreaterThan(0);
    expect(grandFinal).toHaveLength(1);
  });

  it("first round winners bracket has correct seeding", () => {
    const ids = ["p1", "p2", "p3", "p4"];
    const matches = generateDoubleEliminationBracket(ids);
    const winnersR1 = matches.filter(
      (m) => m.bracket === "winners" && m.round === 1
    );

    expect(winnersR1).toHaveLength(2);
    expect(winnersR1[0].player1Id).toBe("p1");
    expect(winnersR1[0].player2Id).toBe("p4");
  });

  it("handles byes in winners bracket", () => {
    const ids = ["p1", "p2", "p3"];
    const matches = generateDoubleEliminationBracket(ids);
    const winnersR1 = matches.filter(
      (m) => m.bracket === "winners" && m.round === 1
    );
    const byes = winnersR1.filter((m) => m.status === "completed");
    expect(byes.length).toBeGreaterThan(0);
  });

  it("returns empty for less than 2 players", () => {
    expect(generateDoubleEliminationBracket(["p1"])).toEqual([]);
  });

  it("handles 8 players", () => {
    const ids = Array.from({ length: 8 }, (_, i) => `p${i + 1}`);
    const matches = generateDoubleEliminationBracket(ids);
    expect(matches.filter((m) => m.bracket === "grand_final")).toHaveLength(1);
    // Winners bracket should have R1=4, R2=2, R3=1
    expect(
      matches.filter((m) => m.bracket === "winners" && m.round === 1)
    ).toHaveLength(4);
  });
});

// ─── getNextMatchSlot ────────────────────────────────────────────────

describe("getNextMatchSlot", () => {
  it("match 1 goes to round 2 match 1 player1 slot", () => {
    const slot = getNextMatchSlot(1, 1);
    expect(slot).toEqual({
      nextRound: 2,
      nextMatchNumber: 1,
      slot: "player1Id",
    });
  });

  it("match 2 goes to round 2 match 1 player2 slot", () => {
    const slot = getNextMatchSlot(2, 1);
    expect(slot).toEqual({
      nextRound: 2,
      nextMatchNumber: 1,
      slot: "player2Id",
    });
  });

  it("match 3 goes to round 2 match 2 player1 slot", () => {
    const slot = getNextMatchSlot(3, 1);
    expect(slot).toEqual({
      nextRound: 2,
      nextMatchNumber: 2,
      slot: "player1Id",
    });
  });
});

// ─── isTournamentComplete ────────────────────────────────────────────

describe("isTournamentComplete", () => {
  it("returns true when all matches are completed", () => {
    const matches = [
      { status: "completed" },
      { status: "completed" },
    ];
    expect(isTournamentComplete(matches)).toBe(true);
  });

  it("returns false when some matches are pending", () => {
    const matches = [
      { status: "completed" },
      { status: "pending" },
    ];
    expect(isTournamentComplete(matches)).toBe(false);
  });

  it("returns false for empty matches", () => {
    expect(isTournamentComplete([])).toBe(false);
  });
});

// ─── determineTournamentWinner ───────────────────────────────────────

describe("determineTournamentWinner", () => {
  it("returns final match winner for single elimination", () => {
    const matches = [
      { round: 1, winnerId: "p1" },
      { round: 1, winnerId: "p3" },
      { round: 2, winnerId: "p1" },
    ];
    expect(
      determineTournamentWinner(matches, "single_elimination")
    ).toBe("p1");
  });

  it("returns standings leader for round robin", () => {
    const base: Standing = {
      playerId: "",
      wins: 0,
      losses: 0,
      draws: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      shotDifference: 0,
      endsWon: 0,
      gamesPlayed: 0,
    };
    const standings: Standing[] = [
      { ...base, playerId: "p2", wins: 1 },
      { ...base, playerId: "p1", wins: 3 },
    ];
    expect(
      determineTournamentWinner([], "round_robin", standings)
    ).toBe("p1");
  });

  it("returns grand final winner for double elimination", () => {
    const matches = [
      { round: 1, winnerId: "p1", bracket: "winners" },
      { round: 1, winnerId: "p2", bracket: "grand_final" },
    ];
    expect(
      determineTournamentWinner(matches, "double_elimination")
    ).toBe("p2");
  });
});

// ─── handleForfeit ───────────────────────────────────────────────────

describe("handleForfeit", () => {
  it("awards win to other player when player1 forfeits", () => {
    const result = handleForfeit("p1", "p2", "p1");
    expect(result.winnerId).toBe("p2");
    expect(result.loserId).toBe("p1");
  });

  it("awards win to other player when player2 forfeits", () => {
    const result = handleForfeit("p1", "p2", "p2");
    expect(result.winnerId).toBe("p1");
    expect(result.loserId).toBe("p2");
  });
});

// ─── seedPlayersForNextRound ─────────────────────────────────────────

describe("seedPlayersForNextRound", () => {
  const base: Standing = {
    playerId: "",
    wins: 0,
    losses: 0,
    draws: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    shotDifference: 0,
    endsWon: 0,
    gamesPlayed: 0,
  };

  it("orders players by performance (wins desc)", () => {
    const standings: Standing[] = [
      { ...base, playerId: "c", wins: 1 },
      { ...base, playerId: "a", wins: 3 },
      { ...base, playerId: "b", wins: 2 },
    ];
    expect(seedPlayersForNextRound(standings)).toEqual(["a", "b", "c"]);
  });

  it("uses shot difference as tiebreaker", () => {
    const standings: Standing[] = [
      { ...base, playerId: "x", wins: 2, shotDifference: 3 },
      { ...base, playerId: "y", wins: 2, shotDifference: 10 },
    ];
    expect(seedPlayersForNextRound(standings)).toEqual(["y", "x"]);
  });
});
