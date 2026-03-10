import { createClient } from "@/lib/supabase/server";
import type { Favorite } from "@/lib/types";

export async function getFavorites(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("*, favorite:players!favorite_id(*)")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Favorite[];
}

export async function addFavorite(playerId: string, favoriteId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .upsert({ player_id: playerId, favorite_id: favoriteId })
    .select()
    .single();

  if (error) throw error;
  return data as Favorite;
}

export async function removeFavorite(playerId: string, favoriteId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("player_id", playerId)
    .eq("favorite_id", favoriteId);

  if (error) throw error;
}

export async function isFavorite(playerId: string, favoriteId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("player_id", playerId)
    .eq("favorite_id", favoriteId)
    .maybeSingle();

  return !!data;
}
