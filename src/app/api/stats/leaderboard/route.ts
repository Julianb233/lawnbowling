import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db/stats";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sport = url.searchParams.get("sport") ?? undefined;
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const clubId = url.searchParams.get("club_id") ?? undefined;

    const leaderboard = await getLeaderboard({ sport, limit, clubId });
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
