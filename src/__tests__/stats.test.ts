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
