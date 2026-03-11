import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BowlsLeaderboardCategory } from "@/lib/types";

/**
 * GET /api/stats/leaderboard/bowls?category=skip|lead|ends_pct&club_id=xxx
 *
 * Returns bowls-specific leaderboard data sorted by position ELO or ends won %.
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = (url.searchParams.get("category") ?? "skip") as BowlsLeaderboardCategory;
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const clubId = url.searchParams.get("club_id") ?? undefined;
    const season = url.searchParams.get("season") ?? new Date().getFullYear().toString();

    const supabase = await createClient();

    // Determine position filter and sort column
    let positionFilter: string | null = null;
    let orderColumn = "elo_rating";

    switch (category) {
      case "skip":
        positionFilter = "skip";
        orderColumn = "elo_rating";
        break;
      case "lead":
        positionFilter = "lead";
        orderColumn = "elo_rating";
        break;
      case "ends_pct":
        positionFilter = null; // aggregate across positions
        orderColumn = "ends_won_pct";
        break;
      default:
        positionFilter = "skip";
        orderColumn = "elo_rating";
    }

    let query = supabase
      .from("bowls_position_ratings")
      .select("*, player:players!bowls_position_ratings_player_id_fkey(id, display_name, avatar_url, home_club_id)")
      .eq("season", season)
      .gte("games_played", 3)
      .order(orderColumn, { ascending: false })
      .limit(limit);

    if (positionFilter) {
      query = query.eq("position", positionFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = data ?? [];

    // Filter by club if needed
    if (clubId) {
      results = results.filter(
        (entry: Record<string, unknown>) =>
          entry.player != null &&
          (entry.player as Record<string, unknown>).home_club_id === clubId
      );
    }

    return NextResponse.json({ leaderboard: results });
  } catch (error) {
    console.error("Bowls leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bowls leaderboard" },
      { status: 500 }
    );
  }
}
