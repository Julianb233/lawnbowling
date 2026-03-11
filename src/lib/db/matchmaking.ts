import { createClient } from "@/lib/supabase/server";
import type { PlayerSkillRating, RecentMatch } from "@/lib/matchmaking";

export async function getPlayerSkills(playerId: string): Promise<PlayerSkillRating[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("player_sport_skills").select("player_id, sport, elo_rating, games_played").eq("player_id", playerId);
  if (error) { if (error.code === "42P01") return []; throw error; }
  return (data ?? []) as PlayerSkillRating[];
}

export async function getBulkPlayerSkills(playerIds: string[]): Promise<Map<string, Map<string, PlayerSkillRating>>> {
  if (playerIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase.from("player_sport_skills").select("player_id, sport, elo_rating, games_played").in("player_id", playerIds);
  if (error) { if (error.code === "42P01") return new Map(); throw error; }
  const result = new Map<string, Map<string, PlayerSkillRating>>();
  for (const row of (data ?? []) as PlayerSkillRating[]) {
    if (!result.has(row.player_id)) { result.set(row.player_id, new Map()); }
    result.get(row.player_id)!.set(row.sport, row);
  }
  return result;
}

export async function getMatchHistory(playerId: string): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data: myMatches, error: err1 } = await supabase.from("match_players").select("match_id").eq("player_id", playerId);
  if (err1 || !myMatches?.length) return new Map();
  const matchIds = myMatches.map((m) => m.match_id);
  const { data: opponents, error: err2 } = await supabase.from("match_players").select("match_id, player_id").in("match_id", matchIds).neq("player_id", playerId);
  if (err2 || !opponents?.length) return new Map();
  const counts = new Map<string, number>();
  for (const opp of opponents) { counts.set(opp.player_id, (counts.get(opp.player_id) ?? 0) + 1); }
  return counts;
}

export async function getRecentMatches(playerId: string): Promise<RecentMatch[]> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: myMatches, error: err1 } = await supabase.from("match_players").select("match_id").eq("player_id", playerId);
  if (err1 || !myMatches?.length) return [];
  const matchIds = myMatches.map((m) => m.match_id);
  const { data: matches, error: err2 } = await supabase.from("matches").select("id, ended_at").in("id", matchIds).eq("status", "completed").gte("ended_at", sevenDaysAgo).order("ended_at", { ascending: false });
  if (err2 || !matches?.length) return [];
  const recentMatchIds = matches.map((m) => m.id);
  const matchTimestamps = new Map(matches.map((m) => [m.id, m.ended_at as string]));
  const { data: opponents, error: err3 } = await supabase.from("match_players").select("match_id, player_id").in("match_id", recentMatchIds).neq("player_id", playerId);
  if (err3 || !opponents?.length) return [];
  const opponentMap = new Map<string, { played_at: string; count: number }>();
  for (const opp of opponents) {
    const ts = matchTimestamps.get(opp.match_id) ?? "";
    const existing = opponentMap.get(opp.player_id);
    if (!existing || ts > existing.played_at) {
      opponentMap.set(opp.player_id, { played_at: ts, count: (existing?.count ?? 0) + 1 });
    } else { existing.count += 1; }
  }
  return Array.from(opponentMap.entries()).map(([opponent_id, { played_at, count }]) => ({ opponent_id, played_at, count }));
}

export async function getFavoriteIds(playerId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("favorites").select("favorite_id").eq("player_id", playerId);
  if (error) { if (error.code === "42P01") return new Set(); throw error; }
  return new Set((data ?? []).map((d) => d.favorite_id));
}

export async function upsertPlayerSkillRating(playerId: string, sport: string, eloRating: number, isWin: boolean) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("player_sport_skills").select("*").eq("player_id", playerId).eq("sport", sport).single();
  if (existing) {
    await supabase.from("player_sport_skills").update({
      elo_rating: eloRating, games_played: existing.games_played + 1,
      wins: existing.wins + (isWin ? 1 : 0), losses: existing.losses + (isWin ? 0 : 1),
      updated_at: new Date().toISOString(),
    }).eq("player_id", playerId).eq("sport", sport);
  } else {
    await supabase.from("player_sport_skills").insert({
      player_id: playerId, sport, elo_rating: eloRating, games_played: 1,
      wins: isWin ? 1 : 0, losses: isWin ? 0 : 1,
    });
  }
}
