import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db/stats";
import type { LeaderboardSortBy } from "@/lib/db/stats";

const VALID_SORTS: LeaderboardSortBy[] = [
  "win_rate",
  "games_played",
  "wins",
  "elo_rating",
];

const VALID_SPORTS = ["lawn_bowling"];
const VALID_SKILLS = ["beginner", "intermediate", "advanced"];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sportParam = url.searchParams.get("sport") ?? undefined;
    const sport = sportParam && VALID_SPORTS.includes(sportParam) ? sportParam : undefined;
    const skillParam = url.searchParams.get("skill_level") ?? undefined;
    const skillLevel = skillParam && VALID_SKILLS.includes(skillParam) ? skillParam : undefined;
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
    return NextResponse.json({ leaderboard }, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
