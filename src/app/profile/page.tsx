export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { getWaiverByPlayerId } from "@/lib/db/waivers";
import { ProfilePageClient } from "./ProfilePageClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let player;
  try {
    player = await getPlayerByUserId(user.id);
  } catch {
    redirect("/profile/setup");
  }
  if (!player) redirect("/profile/setup");

  let waiver = null;
  try {
    waiver = await getWaiverByPlayerId(player.id);
  } catch {
    // Waiver lookup failed — continue with null waiver
  }

  return <ProfilePageClient player={player} waiver={waiver} />;
}
