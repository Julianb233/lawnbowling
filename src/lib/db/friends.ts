import { createClient } from "@/lib/supabase/server";
import type { Friendship } from "@/lib/types";

export async function getFriends(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("*, friend:players!friend_id(*), player:players!player_id(*)")
    .or(`player_id.eq.${playerId},friend_id.eq.${playerId}`)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Friendship[];
}

export async function getPendingRequests(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("*, player:players!player_id(*)")
    .eq("friend_id", playerId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Friendship[];
}

export async function sendFriendRequest(playerId: string, friendId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .insert({ player_id: playerId, friend_id: friendId, status: "pending" })
    .select()
    .single();

  if (error) throw error;
  return data as Friendship;
}

export async function respondToFriendRequest(
  requestId: string,
  accept: boolean
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .update({ status: accept ? "accepted" : "blocked" })
    .eq("id", requestId);

  if (error) throw error;
}

export async function removeFriend(playerId: string, friendId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .or(
      `and(player_id.eq.${playerId},friend_id.eq.${friendId}),and(player_id.eq.${friendId},friend_id.eq.${playerId})`
    );

  if (error) throw error;
}

export async function blockPlayer(playerId: string, blockedId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .upsert({
      player_id: playerId,
      friend_id: blockedId,
      status: "blocked",
    });

  if (error) throw error;
}
