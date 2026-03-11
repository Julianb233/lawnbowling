export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { getWaiverByPlayerId } from "@/lib/db/waivers";
import { getPlayerStats, getFavoritePartners } from "@/lib/db/stats";
import { getPlayerPhotos } from "@/lib/db/gallery";
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

  const [waiver, stats, favoritePartners, photos] = await Promise.all([
    getWaiverByPlayerId(player.id).catch(() => null),
    getPlayerStats(player.id).catch(() => null),
    getFavoritePartners(player.id, { limit: 5 }).catch(() => []),
    getPlayerPhotos(player.id).catch(() => []),
  ]);

  return <ProfilePageClient player={player} waiver={waiver} stats={stats} favoritePartners={favoritePartners} photos={photos} />;
}
