import { createClient } from "@/lib/supabase/server";
import type { ScheduledGame, GameRSVP } from "@/lib/types";

export async function getUpcomingGames(venueId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("scheduled_games")
    .select(
      "*, organizer:players!organizer_id(*), rsvps:game_rsvps(*, player:players(*))"
    )
    .in("status", ["upcoming", "in_progress"])
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ScheduledGame[];
}

export async function getGameById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scheduled_games")
    .select(
      "*, organizer:players!organizer_id(*), rsvps:game_rsvps(*, player:players(*))"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ScheduledGame;
}

export async function createGame(game: {
  organizer_id: string;
  venue_id?: string;
  sport: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes?: number;
  max_players?: number;
  is_recurring?: boolean;
  recurrence_rule?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scheduled_games")
    .insert(game)
    .select()
    .single();

  if (error) throw error;
  return data as ScheduledGame;
}

export async function updateGameStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scheduled_games")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

export async function rsvpToGame(
  gameId: string,
  playerId: string,
  status: "going" | "maybe" | "not_going"
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_rsvps")
    .upsert(
      { game_id: gameId, player_id: playerId, status },
      { onConflict: "game_id,player_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as GameRSVP;
}

export async function getGameRSVPs(gameId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_rsvps")
    .select("*, player:players(*)")
    .eq("game_id", gameId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as GameRSVP[];
}
