import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const clubId = url.searchParams.get("club_id");

    if (!clubId) {
      return NextResponse.json({ error: "club_id is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get club name
    const { data: club } = await supabase
      .from("clubs")
      .select("name")
      .eq("id", clubId)
      .single();

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Get total members
    const { count: totalMembers } = await supabase
      .from("players")
      .select("id", { count: "exact", head: true })
      .eq("home_club_id", clubId);

    // Get club stats (aggregated from player_stats for club members)
    // Use !inner join to filter at the database level — only returns rows
    // where the player belongs to this club, eliminating client-side null filtering.
    const { data: memberStats } = await supabase
      .from("player_stats")
      .select("games_played, wins, losses, player:players!player_stats_player_id_fkey!inner(display_name, home_club_id)")
      .eq("player.home_club_id", clubId);

    const validStats = memberStats ?? [];

    const totalGames = validStats.reduce((sum: number, s: Record<string, unknown>) => sum + (s.games_played as number), 0);
    const totalWins = validStats.reduce((sum: number, s: Record<string, unknown>) => sum + (s.wins as number), 0);
    const clubWinRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

    // Most active players this month
    const mostActive = validStats
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.games_played as number) - (a.games_played as number))
      .slice(0, 5)
      .map((s: Record<string, unknown>) => ({
        display_name: (s.player as Record<string, unknown>)?.display_name ?? "Unknown",
        games_played: s.games_played as number,
      }));

    return NextResponse.json({
      club_name: club.name,
      total_members: totalMembers ?? 0,
      total_games: totalGames,
      club_win_rate: Math.round(clubWinRate * 100) / 100,
      most_active: mostActive,
    });
  } catch (error) {
    console.error("Club stats error:", error);
    return NextResponse.json({ error: "Failed to fetch club stats" }, { status: 500 });
  }
}
