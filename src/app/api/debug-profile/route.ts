import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { getWaiverByPlayerId } from "@/lib/db/waivers";
import { getPlayerStats, getFavoritePartners } from "@/lib/db/stats";

export async function GET() {
  const steps: Record<string, unknown> = {};
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    steps.user = user ? { id: user.id, email: user.email } : null;
    if (!user) return NextResponse.json({ error: "not authenticated", steps });

    const player = await getPlayerByUserId(user.id);
    steps.player = player ? { id: player.id, name: player.display_name } : null;
    if (!player) return NextResponse.json({ error: "no player", steps });

    try {
      const waiver = await getWaiverByPlayerId(player.id);
      steps.waiver = waiver ? "found" : "null";
    } catch (e: unknown) {
      steps.waiver_error = e instanceof Error ? { message: e.message, stack: e.stack } : JSON.stringify(e);
    }

    try {
      const stats = await getPlayerStats(player.id);
      steps.stats = stats ? { games: stats.games_played } : "null";
    } catch (e) {
      steps.stats_error = String(e);
    }

    try {
      const partners = await getFavoritePartners(player.id, { limit: 5 });
      steps.partners = partners.length;
    } catch (e) {
      steps.partners_error = String(e);
    }

    return NextResponse.json({ ok: true, steps });
  } catch (e) {
    return NextResponse.json({ error: String(e), steps }, { status: 500 });
  }
}
