export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { getUpcomingGames } from "@/lib/db/schedule";
import { SchedulePageClient } from "./SchedulePageClient";

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const player = await getPlayerByUserId(user.id);
  if (!player) redirect("/profile/setup");

  const games = await getUpcomingGames();

  return <SchedulePageClient games={games} currentPlayerId={player.id} />;
}
