import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Require authentication — prevents unauthenticated enumeration of player names/avatars
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ players: [], teams: [], games: [] });
  }

  const searchTerm = `%${q}%`;

  const [playersRes, teamsRes, gamesRes] = await Promise.all([
    supabase
      .from("players")
      .select("id, display_name, avatar_url, skill_level, sports")
      .ilike("display_name", searchTerm)
      .limit(10),
    supabase
      .from("teams")
      .select("id, name, sport, avatar_url")
      .ilike("name", searchTerm)
      .limit(10),
    supabase
      .from("scheduled_games")
      .select("id, title, sport, scheduled_at, status")
      .ilike("title", searchTerm)
      .eq("status", "upcoming")
      .limit(10),
  ]);

  return NextResponse.json({
    players: playersRes.data || [],
    teams: teamsRes.data || [],
    games: gamesRes.data || [],
  });
}
