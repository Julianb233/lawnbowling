import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push";
import type { PushPayload } from "@/lib/push";

export type BowlsNotificationType =
  | "draw_announcement"
  | "score_update"
  | "tournament_start"
  | "result_announcement";

interface NotifyRequest {
  tournament_id: string;
  type: BowlsNotificationType;
  round?: number;
  rink?: number;
  message?: string;
}

/**
 * POST /api/bowls/notifications
 * Send push notifications for bowls tournament events.
 * Notifies all checked-in players for the given tournament.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body: NotifyRequest = await request.json();
    const { tournament_id, type, round, rink, message } = body;

    if (!tournament_id || !type) {
      return NextResponse.json(
        { error: "tournament_id and type are required" },
        { status: 400 }
      );
    }

    // Get tournament info
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("name")
      .eq("id", tournament_id)
      .single();

    const tournamentName = tournament?.name ?? "Tournament";

    // Build payload based on notification type
    let payload: PushPayload;
    switch (type) {
      case "draw_announcement":
        payload = {
          title: "New Draw Announced",
          body: message ?? `Round ${round ?? "?"} draw is ready for ${tournamentName}. Check your rink assignment!`,
          tag: `bowls-draw-${tournament_id}-${round}`,
          url: `/bowls/${tournament_id}`,
          actions: [
            { action: "view", title: "View Draw" },
            { action: "dismiss", title: "Dismiss" },
          ],
        };
        break;

      case "score_update":
        payload = {
          title: "Score Updated",
          body: message ?? `Rink ${rink ?? "?"} scores updated in ${tournamentName}`,
          tag: `bowls-score-${tournament_id}-${round}-${rink}`,
          url: `/bowls/${tournament_id}/scores`,
        };
        break;

      case "tournament_start":
        payload = {
          title: "Tournament Starting",
          body: message ?? `${tournamentName} is starting now! Head to the green.`,
          tag: `bowls-start-${tournament_id}`,
          url: `/bowls/${tournament_id}`,
          actions: [
            { action: "view", title: "View Tournament" },
            { action: "dismiss", title: "Dismiss" },
          ],
        };
        break;

      case "result_announcement":
        payload = {
          title: `Round ${round ?? "?"} Results`,
          body: message ?? `${tournamentName} - Round ${round ?? "?"} results are in! Check the standings.`,
          tag: `bowls-results-${tournament_id}-${round}`,
          url: `/bowls/${tournament_id}/results`,
          actions: [
            { action: "view", title: "View Results" },
            { action: "dismiss", title: "Dismiss" },
          ],
        };
        break;

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        );
    }

    // Get all checked-in players for this tournament
    const { data: checkins } = await supabase
      .from("bowls_checkins")
      .select("player_id, player:players!bowls_checkins_player_id_fkey(user_id)")
      .eq("tournament_id", tournament_id);

    if (!checkins || checkins.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, total_players: 0 });
    }

    // Send to each checked-in player
    let totalSent = 0;
    let totalFailed = 0;

    for (const checkin of checkins) {
      const player = checkin.player as unknown as { user_id: string } | null;
      if (!player?.user_id) continue;

      const result = await sendPushToUser(player.user_id, payload);
      totalSent += result.sent;
      totalFailed += result.failed;
    }

    return NextResponse.json({
      sent: totalSent,
      failed: totalFailed,
      total_players: checkins.length,
    });
  } catch (err) {
    console.error("Bowls notification error:", err);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
