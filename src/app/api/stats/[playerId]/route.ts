import { NextRequest, NextResponse } from "next/server";
import { getPlayerStats, getMatchHistory, getFavoritePartners } from "@/lib/db/stats";

export async function GET(request: NextRequest, { params }: { params: Promise<{ playerId: string }> }) {
  try {
    const { playerId } = await params;
    const url = new URL(request.url);
    const includeHistory = url.searchParams.get("history") === "true";
    const includePartners = url.searchParams.get("partners") !== "false";
    const sport = url.searchParams.get("sport") ?? undefined;

    const [stats, favoritePartners] = await Promise.all([
      getPlayerStats(playerId),
      includePartners ? getFavoritePartners(playerId, { limit: 5 }) : [],
    ]);

    let history = null;
    if (includeHistory) {
      const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
      const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
      history = await getMatchHistory(playerId, { sport, limit, offset });
    }

    return NextResponse.json({ stats, favoritePartners, history });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
