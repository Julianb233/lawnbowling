import { createClient } from "@/lib/supabase/server";
import type { PlayerSkillRating } from "@/lib/matchmaking";

/**
 * Get per-sport skill ratings for a player.
 */
export async function getPlayerSkills(
  playerId: string
): Promise<PlayerSkillRating[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_sport_skills")
    .select("player_id, sport, elo_rating, games_played")
    .eq("player_id", playerId);

  if (error) {
    // Table might not exist yet -- return empty
    if (error.code === "42P01") return [];
    throw error;
  }
  return (data ?? []) as PlayerSkillRating[];
}

/**
 * Get per-sport skill ratings for multiple players.
 */
export async function getBulkPlayerSkills(
  playerIds: string[]
): Promise<Map<string, Map<string, PlayerSkillRating>>> {
  if (playerIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_sport_skills")
    .select("player_id, sport, elo_rating, games_played")
    .in("player_id", playerIds);

  if (error) {
    if (error.code === "42P01") return new Map();
    throw error;
  }

  const result = new Map<string, Map<string, PlayerSkillRating>>();
  for (const row of (data ?? []) as PlayerSkillRating[]) {
    if (!result.has(row.player_id)) {
      result.set(row.player_id, new Map());
    }
    result.get(row.player_id)!.set(row.sport, row);
  }
  return result;
}

/**
 * Get match history between the current player and all other players.
 * Returns a map of opponent_id -> number of completed matches together.
 */
export async function getMatchHistory(
  playerId: string
): Promise<Map<string, number>> {
  const supabase = await createClient();

  // Get all match IDs this player was in
  const { data: myMatches, error: err1 } = await supabase
    .from("match_players")
    .select("match_id")
    .eq("player_id", playerId);

  if (err1 || !myMatches?.length) return new Map();

  const matchIds = myMatches.map((m) => m.match_id);

  // Get all players in those matches (excluding self)
  const { data: opponents, error: err2 } = await supabase
    .from("match_players")
    .select("match_id, player_id")
    .in("match_id", matchIds)
    .neq("player_id", playerId);

  if (err2 || !opponents?.length) return new Map();

  // Count matches per opponent
  const counts = new Map<string, number>();
  for (const opp of opponents) {
    counts.set(opp.player_id, (counts.get(opp.player_id) ?? 0) + 1);
  }
  return counts;
}

/**
 * Upsert a player's ELO rating for a sport.
 */
export async function upsertPlayerSkillRating(
  playerId: string,
  sport: string,
  eloRating: number,
  isWin: boolean
) {
  const supabase = await createClient();

  // Check if row exists
  const { data: existing } = await supabase
    .from("player_sport_skills")
    .select("*")
    .eq("player_id", playerId)
    .eq("sport", sport)
    .single();

  if (existing) {
    await supabase
      .from("player_sport_skills")
      .update({
        elo_rating: eloRating,
        games_played: existing.games_played + 1,
        wins: existing.wins + (isWin ? 1 : 0),
        losses: existing.losses + (isWin ? 0 : 1),
        updated_at: new Date().toISOString(),
      })
      .eq("player_id", playerId)
      .eq("sport", sport);
  } else {
    await supabase.from("player_sport_skills").insert({
      player_id: playerId,
      sport,
      elo_rating: eloRating,
      games_played: 1,
      wins: isWin ? 1 : 0,
      losses: isWin ? 0 : 1,
    });
  }
}
