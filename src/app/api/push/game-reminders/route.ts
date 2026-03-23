import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToPlayer } from "@/lib/push";
import { apiError } from "@/lib/api-error-handler";

/**
 * Cron-triggered endpoint: send 15-minute reminders for upcoming scheduled games.
 * Should be called every 5 minutes by a cron job or Vercel cron.
 * Protected by a secret header to prevent unauthorized access.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Find games starting in the next 15-20 minutes (window avoids duplicates)
    const now = new Date();
    const windowStart = new Date(now.getTime() + 13 * 60 * 1000); // 13 min from now
    const windowEnd = new Date(now.getTime() + 18 * 60 * 1000); // 18 min from now

    const { data: games, error } = await supabase
      .from("scheduled_games")
      .select("id, title, sport, scheduled_at")
      .eq("status", "upcoming")
      .gte("scheduled_at", windowStart.toISOString())
      .lte("scheduled_at", windowEnd.toISOString());

    if (error) {
      console.error("Failed to fetch upcoming games:", error);
      return apiError(error, "push/game-reminders", 500);
    }

    if (!games || games.length === 0) {
      return NextResponse.json({ reminders_sent: 0 });
    }

    let totalSent = 0;

    for (const game of games) {
      // Get all RSVPs who said "going"
      const { data: rsvps } = await supabase
        .from("game_rsvps")
        .select("player_id")
        .eq("game_id", game.id)
        .eq("status", "going");

      if (!rsvps) continue;

      for (const rsvp of rsvps) {
        try {
          const result = await sendPushToPlayer(rsvp.player_id, "game_reminder", {
            title: "Game Starting Soon",
            body: `${game.title} starts in 15 minutes!`,
            tag: `game-reminder-${game.id}`,
            url: "/schedule",
          });
          totalSent += result.sent;
        } catch (pushErr: unknown) {
          console.error("Push reminder failed:", pushErr);
        }
      }
    }

    return NextResponse.json({ reminders_sent: totalSent, games_checked: games.length });
  } catch (err: unknown) {
    console.error("Game reminders error:", err);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
