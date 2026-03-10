export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QueuePageClient } from "./QueuePageClient";

export default async function QueuePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch current player profile
  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!player) redirect("/profile/setup");

  // Fetch player's active queued match (if any)
  const { data: activeMatch } = await supabase
    .from("match_players")
    .select("match_id, matches(id, status, sport, created_at, court_id, courts(name))")
    .eq("player_id", user.id)
    .eq("matches.status", "queued")
    .limit(1)
    .maybeSingle();

  return (
    <QueuePageClient
      player={player}
      activeMatch={activeMatch?.matches ?? null}
    />
  );
}
