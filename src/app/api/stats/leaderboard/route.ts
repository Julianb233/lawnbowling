import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db/stats";
import type { LeaderboardSortBy } from "@/lib/db/stats";

const VALID_SORTS: LeaderboardSortBy[] = [
  "win_rate",
  "games_played",
  "wins",
  "elo_rating",
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sport = url.searchParams.get("sport") ?? undefined;
    const skillLevel = url.searchParams.get("skill_level") ?? undefined;
    const sortByParam = url.searchParams.get("sort_by") ?? "win_rate";
    const limit = parseInt(url.searchParams.get("limit") ?? "50");

    const sortBy = VALID_SORTS.includes(sortByParam as LeaderboardSortBy)
      ? (sortByParam as LeaderboardSortBy)
      : "win_rate";

    const leaderboard = await getLeaderboard({
      sport,
      skillLevel,
      sortBy,
      limit,
    });
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
