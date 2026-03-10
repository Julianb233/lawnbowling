import { NextRequest, NextResponse } from "next/server";
import { getPlayerStats, getMatchHistory } from "@/lib/db/stats";

export async function GET(request: NextRequest, { params }: { params: Promise<{ playerId: string }> }) {
  try {
    const { playerId } = await params;
    const url = new URL(request.url);
    const includeHistory = url.searchParams.get("history") === "true";
    const sport = url.searchParams.get("sport") ?? undefined;

    const stats = await getPlayerStats(playerId);

    let history = null;
    if (includeHistory) {
      history = await getMatchHistory(playerId, { sport, limit: 20 });
    }

    return NextResponse.json({ stats, history });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
