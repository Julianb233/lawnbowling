import { createClient } from "@/lib/supabase/server";
import type { PushNotificationType } from "@/lib/types";

/** Map notification type to the preference column that controls it */
const TYPE_TO_PREF: Record<PushNotificationType, string> = {
  partner_request: "push_partner_requests",
  match_ready: "push_match_ready",
  friend_checkin: "push_friend_checkin",
  scheduled_reminder: "push_scheduled_reminder",
};

function getWebPush() {
  // Lazy-load web-push to keep it server-only
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const wp = require("web-push");
  wp.setVapidDetails(
    "mailto:hello@pickapartner.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  return wp as {
    sendNotification: (
      sub: { endpoint: string; keys: { p256dh: string; auth: string } },
      payload: string
    ) => Promise<void>;
  };
}

/**
 * Send a push notification to a player, respecting their preferences.
 * Returns the number of subscriptions notified (0 if opted out or no subscriptions).
 */
export async function sendPushToPlayer(
  playerId: string,
  type: PushNotificationType,
  payload: { title: string; body: string; url?: string }
): Promise<number> {
  const supabase = await createClient();

  // Check if user has this notification type enabled
  const prefColumn = TYPE_TO_PREF[type];
  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select(prefColumn)
    .eq("player_id", playerId)
    .maybeSingle();

  // Default is true if no preferences row exists
  if (prefs && (prefs as unknown as Record<string, unknown>)[prefColumn] === false)
    return 0;

  // Get all push subscriptions for this player
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("player_id", playerId);

  if (!subs || subs.length === 0) return 0;

  const webpush = getWebPush();
  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/",
  });

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        message
      );
      sent++;
    } catch (err: unknown) {
      // 410 Gone or 404 = subscription expired, clean it up
      if (
        err &&
        typeof err === "object" &&
        "statusCode" in err &&
        ((err as { statusCode: number }).statusCode === 410 ||
          (err as { statusCode: number }).statusCode === 404)
      ) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("player_id", playerId)
          .eq("endpoint", sub.endpoint);
      }
    }
  }

  return sent;
}
