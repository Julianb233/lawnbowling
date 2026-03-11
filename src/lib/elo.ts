const K_FACTOR = 32;

export function calculateElo(
  winnerRating: number,
  loserRating: number
): { newWinnerRating: number; newLoserRating: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  const newWinnerRating = Math.round((winnerRating + K_FACTOR * (1 - expectedWinner)) * 100) / 100;
  const newLoserRating = Math.round((loserRating + K_FACTOR * (0 - expectedLoser)) * 100) / 100;

  return { newWinnerRating, newLoserRating };
}

// Position-weighted K-factors: Skip has highest strategic accountability
const BOWLS_K_FACTORS: Record<string, number> = {
  skip: 40,
  vice: 36,
  second: 32,
  lead: 28,
  singles: 36,
};

export interface BowlsEloInput {
  position: string;
  playerRating: number;
  opponentRating: number;
  /** 1 = win, 0 = loss, 0.5 = draw */
  result: 0 | 0.5 | 1;
  shotDifferential: number;
  endsWon: number;
  endsPlayed: number;
}

/**
 * Calculate bowls-specific ELO with position-weighted K-factor and
 * shot-differential bonus. Higher positions (Skip) swing more per game.
 * A large shot differential (margin of victory) scales the K-factor
 * by up to 1.5x for blowouts.
 */
export function calculateBowlsElo(input: BowlsEloInput): number {
  const { position, playerRating, opponentRating, result, shotDifferential } = input;

  const baseK = BOWLS_K_FACTORS[position] ?? 32;

  // Margin multiplier: scale K by 1 + ln(1 + |shotDiff|) / 10, capped at 1.5
  const marginMultiplier = Math.min(
    1 + Math.log(1 + Math.abs(shotDifferential)) / 10,
    1.5
  );
  const effectiveK = baseK * (result === 0.5 ? 1 : marginMultiplier);

  const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const newRating = Math.round((playerRating + effectiveK * (result - expected)) * 100) / 100;

  return newRating;
}

export function getRatingTier(rating: number): string {
  if (rating >= 1800) return "expert";
  if (rating >= 1400) return "advanced";
  if (rating >= 1100) return "intermediate";
  return "beginner";
}
