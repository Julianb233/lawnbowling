import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db/stats";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sport = url.searchParams.get("sport") ?? undefined;
    const limit = parseInt(url.searchParams.get("limit") ?? "20");

    const leaderboard = await getLeaderboard({ sport, limit });
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
