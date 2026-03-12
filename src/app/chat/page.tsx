export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { ChatPageClient } from "./ChatPageClient";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const player = await getPlayerByUserId(user.id);
  if (!player) redirect("/profile/setup");

  // Fetch friends for conversation starters
  const { data: friendships } = await supabase
    .from("friendships")
    .select("friend_id, player_id, friend:players!friendships_friend_id_fkey(id, display_name, avatar_url), player:players!friendships_player_id_fkey(id, display_name, avatar_url)")
    .or(`player_id.eq.${player.id},friend_id.eq.${player.id}`)
    .eq("status", "accepted");

  const friends = (friendships ?? []).map((f) => {
    const isSender = f.player_id === player.id;
    const friend = isSender ? f.friend : f.player;
    return friend as unknown as { id: string; display_name: string; avatar_url: string | null };
  }).filter(Boolean);

  return <ChatPageClient currentPlayer={player} friends={friends} />;
}
