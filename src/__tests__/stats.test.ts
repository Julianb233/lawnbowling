import { describe, it, expect } from "vitest";

describe("Stats Calculation", () => {
  it("should calculate win rate correctly", () => {
    function calculateWinRate(wins: number, total: number): number {
      if (total === 0) return 0;
      return Math.round((wins / total) * 10000) / 100;
    }

    expect(calculateWinRate(0, 0)).toBe(0);
    expect(calculateWinRate(5, 10)).toBe(50);
    expect(calculateWinRate(7, 10)).toBe(70);
    expect(calculateWinRate(3, 7)).toBeCloseTo(42.86, 1);
    expect(calculateWinRate(10, 10)).toBe(100);
  });

  it("should track games played", () => {
    const stats = { games_played: 0, wins: 0, losses: 0 };

    // Win a game
    stats.games_played += 1;
    stats.wins += 1;
    expect(stats.games_played).toBe(1);
    expect(stats.wins).toBe(1);

    // Lose a game
    stats.games_played += 1;
    stats.losses += 1;
    expect(stats.games_played).toBe(2);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(1);
  });

  it("should identify favorite sport from match history", () => {
    function getFavoriteSport(matches: Array<{ sport: string }>): string | null {
      if (matches.length === 0) return null;
      const counts: Record<string, number> = {};
      matches.forEach((m) => { counts[m.sport] = (counts[m.sport] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }

    expect(getFavoriteSport([])).toBeNull();
    expect(getFavoriteSport([
      { sport: "pickleball" },
      { sport: "pickleball" },
      { sport: "tennis" },
    ])).toBe("pickleball");
    expect(getFavoriteSport([
      { sport: "tennis" },
      { sport: "tennis" },
      { sport: "tennis" },
    ])).toBe("tennis");
  });
});

describe("Partner Stats Calculation", () => {
  it("should calculate partner win rate correctly", () => {
    function calculatePartnerWinRate(wins: number, games: number): number {
      if (games === 0) return 0;
      return Math.round((wins / games) * 10000) / 100;
    }

    expect(calculatePartnerWinRate(0, 0)).toBe(0);
    expect(calculatePartnerWinRate(3, 5)).toBe(60);
    expect(calculatePartnerWinRate(10, 10)).toBe(100);
    expect(calculatePartnerWinRate(0, 5)).toBe(0);
    expect(calculatePartnerWinRate(1, 3)).toBeCloseTo(33.33, 1);
  });

  it("should rank favorite partners by games played together", () => {
    const partners = [
      { partner_id: "a", games_together: 5, wins_together: 3 },
      { partner_id: "b", games_together: 10, wins_together: 7 },
      { partner_id: "c", games_together: 2, wins_together: 1 },
    ];

    const sorted = [...partners].sort((a, b) => b.games_together - a.games_together);
    expect(sorted[0].partner_id).toBe("b");
    expect(sorted[1].partner_id).toBe("a");
    expect(sorted[2].partner_id).toBe("c");
  });

  it("should track partner stats bidirectionally", () => {
    const partnerStats = new Map<string, { games: number; wins: number }>();

    function updatePartnerPair(p1: string, p2: string, isWin: boolean) {
      const keyAB = `${p1}->${p2}`;
      const keyBA = `${p2}->${p1}`;
      for (const key of [keyAB, keyBA]) {
        const existing = partnerStats.get(key) ?? { games: 0, wins: 0 };
        existing.games += 1;
        if (isWin) existing.wins += 1;
        partnerStats.set(key, existing);
      }
    }

    updatePartnerPair("alice", "bob", true);
    updatePartnerPair("alice", "bob", false);
    updatePartnerPair("alice", "bob", true);

    const aliceToBob = partnerStats.get("alice->bob")!;
    const bobToAlice = partnerStats.get("bob->alice")!;

    expect(aliceToBob.games).toBe(3);
    expect(aliceToBob.wins).toBe(2);
    expect(bobToAlice.games).toBe(3);
    expect(bobToAlice.wins).toBe(2);
  });

  it("should handle teams with more than 2 players", () => {
    const teamPlayers = ["p1", "p2", "p3"];
    const pairs: Array<[string, string]> = [];

    for (let i = 0; i < teamPlayers.length; i++) {
      for (let j = i + 1; j < teamPlayers.length; j++) {
        pairs.push([teamPlayers[i], teamPlayers[j]]);
        pairs.push([teamPlayers[j], teamPlayers[i]]);
      }
    }

    // 3 players = 3 unique pairs, 6 directional records
    expect(pairs.length).toBe(6);
    expect(pairs).toContainEqual(["p1", "p2"]);
    expect(pairs).toContainEqual(["p2", "p1"]);
    expect(pairs).toContainEqual(["p1", "p3"]);
    expect(pairs).toContainEqual(["p3", "p1"]);
    expect(pairs).toContainEqual(["p2", "p3"]);
    expect(pairs).toContainEqual(["p3", "p2"]);
  });
});
