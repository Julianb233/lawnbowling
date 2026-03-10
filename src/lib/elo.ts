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

export function getRatingTier(rating: number): string {
  if (rating >= 1800) return "expert";
  if (rating >= 1400) return "advanced";
  if (rating >= 1100) return "intermediate";
  return "beginner";
}
