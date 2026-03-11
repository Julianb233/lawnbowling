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

  const player = await getPlayerByUserId(user.id);
  if (!player) redirect("/profile/setup");

  const [waiver, stats, favoritePartners, photos] = await Promise.all([
    getWaiverByPlayerId(player.id),
    getPlayerStats(player.id),
    getFavoritePartners(player.id, { limit: 5 }),
    getPlayerPhotos(player.id),
  ]);

  return <ProfilePageClient player={player} waiver={waiver} stats={stats} favoritePartners={favoritePartners} photos={photos} />;
}
