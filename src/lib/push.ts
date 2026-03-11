import { createClient } from "@/lib/supabase/server";

let webpushModule: typeof import("web-push") | null = null;
let vapidConfigured = false;

function getWebPush(): typeof import("web-push") {
  if (!webpushModule) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    webpushModule = require("web-push") as typeof import("web-push");
  }
  return webpushModule;
}

function ensureVapid() {
  if (vapidConfigured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    console.warn("VAPID keys not set — push notifications disabled");
    return;
  }
  try {
    getWebPush().setVapidDetails("mailto:support@lawnbowl.app", pub, priv);
    vapidConfigured = true;
  } catch (err) {
    console.error("VAPID configuration failed:", err);
  }
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  actions?: Array<{ action: string; title: string }>;
}

export type PushNotificationType =
  | "partner_request"
  | "partner_accepted"
  | "court_available"
  | "game_reminder"
  | "waitlist_matched"
  | "waitlist_update";

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  ensureVapid();
  if (!vapidConfigured) return { sent: 0, failed: 0 };
  const supabase = await createClient();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (error || !subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  const staleIds: string[] = [];

  for (const sub of subscriptions as PushSubscriptionRow[]) {
    try {
      await getWebPush().sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = err && typeof err === "object" && "statusCode" in err
        ? (err as { statusCode: number }).statusCode : 0;
      if (statusCode === 410 || statusCode === 404) { staleIds.push(sub.id); }
      failed++;
    }
  }

  if (staleIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }
  return { sent, failed };
}

export async function sendPushToPlayer(
  playerId: string,
  type: PushNotificationType,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const supabase = await createClient();
  const { data: player, error: playerError } = await supabase
    .from("players").select("user_id").eq("id", playerId).single();

  if (playerError || !player?.user_id) { return { sent: 0, failed: 0 }; }

  const prefKey = getPrefKeyForType(type);
  if (prefKey) {
    const { data: prefs } = await supabase
      .from("notification_preferences").select(prefKey).eq("player_id", playerId).single();
    if (prefs && (prefs as unknown as Record<string, unknown>)[prefKey] === false) {
      return { sent: 0, failed: 0 };
    }
  }
  return sendPushToUser(player.user_id, payload);
}

function getPrefKeyForType(type: PushNotificationType): string | null {
  switch (type) {
    case "partner_request":
    case "partner_accepted":
      return "push_partner_requests";
    case "court_available":
      return "push_match_ready";
    case "game_reminder":
      return "push_scheduled_reminder";
    default:
      return null;
  }
}
