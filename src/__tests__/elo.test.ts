import { describe, it, expect } from "vitest";
import { calculateElo, getRatingTier } from "@/lib/elo";

describe("ELO Rating System", () => {
  it("should increase winner rating and decrease loser rating", () => {
    const { newWinnerRating, newLoserRating } = calculateElo(1000, 1000);
    expect(newWinnerRating).toBeGreaterThan(1000);
    expect(newLoserRating).toBeLessThan(1000);
  });

  it("should give more points when lower-rated player beats higher-rated", () => {
    const upset = calculateElo(800, 1200);
    const expected = calculateElo(1200, 800);

    const upsetGain = upset.newWinnerRating - 800;
    const expectedGain = expected.newWinnerRating - 1200;

    expect(upsetGain).toBeGreaterThan(expectedGain);
  });

  it("should give equal and opposite changes for equal ratings", () => {
    const { newWinnerRating, newLoserRating } = calculateElo(1000, 1000);
    const winnerGain = newWinnerRating - 1000;
    const loserLoss = 1000 - newLoserRating;
    expect(winnerGain).toBeCloseTo(loserLoss, 1);
  });

  it("should never produce negative ratings with reasonable inputs", () => {
    const { newLoserRating } = calculateElo(2000, 100);
    expect(newLoserRating).toBeGreaterThan(0);
  });

  describe("getRatingTier", () => {
    it("should return beginner for low ratings", () => {
      expect(getRatingTier(800)).toBe("beginner");
      expect(getRatingTier(1000)).toBe("beginner");
    });

    it("should return intermediate for mid ratings", () => {
      expect(getRatingTier(1100)).toBe("intermediate");
      expect(getRatingTier(1300)).toBe("intermediate");
    });

    it("should return advanced for high ratings", () => {
      expect(getRatingTier(1400)).toBe("advanced");
      expect(getRatingTier(1700)).toBe("advanced");
    });

    it("should return expert for top ratings", () => {
      expect(getRatingTier(1800)).toBe("expert");
      expect(getRatingTier(2200)).toBe("expert");
    });
  });
});
