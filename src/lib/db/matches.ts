import { createClient } from "@/lib/supabase/server";
import type { Match, MatchPlayer, MatchStatus } from "@/lib/types";

export async function listMatches(options?: {
  status?: string;
  sport?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("matches")
    .select(
      "*, courts(name), match_players(player_id, team, players(display_name, avatar_url))",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (options?.status) query = query.eq("status", options.status);
  if (options?.sport) query = query.eq("sport", options.sport);
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset)
    query = query.range(
      options.offset,
      options.offset + (options.limit ?? 20) - 1
    );

  const { data, error, count } = await query;
  if (error) throw error;
  return { matches: data, total: count ?? 0 };
}

export async function getActiveMatches() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "*, courts(name, sport), match_players(player_id, team, players(display_name, avatar_url))"
    )
    .in("status", ["queued", "playing"])
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as (Match & { courts: { name: string; sport: string } | null; match_players: { player_id: string; team: number | null; players: { display_name: string; avatar_url: string | null } }[] })[];
}

export type MatchInsert = {
  sport: string;
  venue_id?: string;
};

export async function createMatch(match: MatchInsert, playerIds: [string, string]) {
  const supabase = await createClient();

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .insert({ ...match, status: "queued" as MatchStatus })
    .select()
    .single();

  if (matchError) throw matchError;
  const newMatch = matchData as Match;

  const matchPlayers = playerIds.map((playerId, i) => ({
    match_id: newMatch.id,
    player_id: playerId,
    team: (i + 1) as 1 | 2,
  }));

  const { error: playersError } = await supabase
    .from("match_players")
    .insert(matchPlayers);

  if (playersError) throw playersError;

  const { error: updateError } = await supabase
    .from("players")
    .update({ is_available: false })
    .in("id", playerIds);

  if (updateError) throw updateError;

  return newMatch;
}

export async function getQueuedMatches() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*, match_players(*, player:players(id, display_name, avatar_url, skill_level, sports))")
    .eq("status", "queued")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateMatchStatus(id: string, status: MatchStatus, courtId?: string) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };

  if (status === "playing") {
    updates.started_at = new Date().toISOString();
    if (courtId) updates.court_id = courtId;
  } else if (status === "completed" || status === "cancelled" || status === "abandoned") {
    updates.ended_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("matches")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Match;
}

export async function getMatchPlayers(matchId: string): Promise<MatchPlayer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_players")
    .select("*")
    .eq("match_id", matchId);

  if (error) throw error;
  return data as MatchPlayer[];
}
