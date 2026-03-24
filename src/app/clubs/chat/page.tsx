export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { getClubMessages } from "@/lib/db/club-messages";
import { ClubChatClient } from "./ClubChatClient";

export default async function ClubChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const player = await getPlayerByUserId(user.id);
  if (!player) redirect("/profile/setup");

  // Get the player's club membership
  const { data: membership } = await supabase
    .from("club_memberships")
    .select("club_id, role, club:clubs(id, name, logo_url)")
    .eq("player_id", player.id)
    .limit(1)
    .maybeSingle();

  if (!membership || membership.role === "visitor") {
    redirect("/clubs");
  }

  const club = membership.club as unknown as {
    id: string;
    name: string;
    logo_url: string | null;
  };

  // Get club members for display
  const { data: members } = await supabase
    .from("club_memberships")
    .select("player:players(id, display_name, avatar_url)")
    .eq("club_id", club.id);

  const memberList = (members ?? [])
    .map((m) => m.player as unknown as { id: string; display_name: string; avatar_url: string | null })
    .filter(Boolean);

  // Get initial messages
  let initialMessages: Awaited<ReturnType<typeof getClubMessages>> = [];
  try {
    initialMessages = await getClubMessages(club.id);
  } catch {
    // Table may not exist yet
  }

  return (
    <ClubChatClient
      currentPlayer={player}
      club={club}
      members={memberList}
      initialMessages={initialMessages}
      isAdmin={membership.role === "admin"}
    />
  );
}
