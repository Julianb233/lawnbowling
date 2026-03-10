import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rankSuggestions } from "@/lib/matchmaking";
import type { MatchMode } from "@/lib/matchmaking";
import { getBulkPlayerSkills, getPlayerSkills, getMatchHistory, getRecentMatches, getFavoriteIds } from "@/lib/db/matchmaking";
import type { Player } from "@/lib/types";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const { data: currentPlayer, error: playerError } = await supabase.from("players").select("*").eq("user_id", user.id).single();
  if (playerError || !currentPlayer) { return NextResponse.json({ error: "Player not found" }, { status: 404 }); }
  const player = currentPlayer as Player;

  const { searchParams } = new URL(request.url);
  const sportFilter = searchParams.get("sport") ?? undefined;
  const mode = (searchParams.get("mode") ?? "auto") as MatchMode;
  const limitParam = parseInt(searchParams.get("limit") ?? "5", 10);
  const limit = Math.min(Math.max(limitParam, 1), 10);

  let query = supabase.from("players").select("*").eq("is_available", true).neq("id", player.id);
  if (player.venue_id) { query = query.eq("venue_id", player.venue_id); }
  if (sportFilter) { query = query.contains("sports", [sportFilter]); }
  const { data: candidates, error: candError } = await query;
  if (candError) { return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 }); }

  const availablePlayers = (candidates ?? []) as Player[];
  if (availablePlayers.length === 0) { return NextResponse.json({ suggestions: [], mode }); }

  const candidateIds = availablePlayers.map((p) => p.id);
  const [mySkillsArr, allSkillsMap, matchHistoryMap, recentMatches, favoriteIds] = await Promise.all([
    getPlayerSkills(player.id),
    getBulkPlayerSkills([player.id, ...candidateIds]),
    getMatchHistory(player.id),
    getRecentMatches(player.id),
    getFavoriteIds(player.id),
  ]);

  const mySkills = new Map(mySkillsArr.map((s) => [s.sport, s]));
  allSkillsMap.delete(player.id);

  const suggestions = rankSuggestions(player, availablePlayers, mySkills, allSkillsMap, matchHistoryMap, limit, { recentMatches, favoriteIds, mode, sportFilter });

  return NextResponse.json({
    suggestions: suggestions.map((s) => ({ player: s.player, score: s.score, reasons: s.reasons, commonSports: s.commonSports, eloDiff: s.eloDiff, matchQuality: s.matchQuality })),
    mode,
  });
}
