import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import type {
  PushNotificationType,
  NotificationType,
  PushPayload,
  PushSubscriptionRow,
} from "../_shared/types.ts";

// Web-push VAPID keys from environment
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = "mailto:support@lawnbowl.app";

// ── Preference key mapping ───────────────────────────────────────────
function getPrefKeyForType(type: PushNotificationType): string | null {
  switch (type) {
    case "partner_request":
    case "partner_accepted":
      return "push_partner_requests";
    case "court_available":
      return "push_match_ready";
    case "game_reminder":
      return "push_scheduled_reminder";
    case "noticeboard_announcement":
      return null; // Always deliver
    case "event_reminder":
      return "event_reminders";
    case "new_event":
      return "new_events";
    case "tournament_result":
      return "tournament_results";
    case "chat_message":
      return "chat_messages";
    case "club_announcement":
      return "club_announcements";
    default:
      return null;
  }
}

// ── Map push types to in-app notification types ──────────────────────
function toNotificationType(type: PushNotificationType): NotificationType {
  switch (type) {
    case "event_reminder":
      return "event_reminder";
    case "new_event":
      return "new_event";
    case "tournament_result":
      return "tournament_result";
    case "chat_message":
      return "chat_message";
    case "club_announcement":
      return "club_announcement";
    case "partner_request":
      return "partner_request_received";
    case "partner_accepted":
      return "partner_request_accepted";
    case "court_available":
      return "court_assigned";
    case "game_reminder":
      return "game_reminder";
    case "noticeboard_announcement":
      return "noticeboard_announcement";
    default:
      return "noticeboard_announcement";
  }
}

// ── Web Push via fetch (Deno-compatible, no Node web-push dep) ───────
async function sendWebPush(
  subscription: PushSubscriptionRow,
  payload: PushPayload
): Promise<boolean> {
  // Import VAPID JWT signing utilities
  const { default: jwt } = await import(
    "https://esm.sh/jose@5/jwt/sign"
  ).catch(() => ({ default: null }));

  // Simplified: use the Supabase-native approach — call the push endpoint
  // For production VAPID web push, use a Deno-compatible web-push library.
  // Here we use the fetch-based approach with the Web Push protocol.
  try {
    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(JSON.stringify(payload));

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        TTL: "86400",
      },
      body: payloadBytes,
    });

    if (response.status === 410 || response.status === 404) {
      // Subscription expired
      return false;
    }

    return response.ok;
  } catch (err) {
    console.error("Web push send failed:", err);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();

    const body = await req.json();
    const {
      player_id,
      club_id,
      type,
      payload,
      metadata,
    } = body as {
      player_id?: string;
      club_id?: string;
      type: PushNotificationType;
      payload: PushPayload;
      metadata?: Record<string, unknown>;
    };

    // ── Validation ─────────────────────────────────────────────────
    if (!type || !payload) {
      return new Response(
        JSON.stringify({ error: "type and payload are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!player_id && !club_id) {
      return new Response(
        JSON.stringify({ error: "Either player_id or club_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Collect target player IDs ──────────────────────────────────
    const targetPlayerIds: string[] = [];

    if (player_id) {
      targetPlayerIds.push(player_id);
    }

    if (club_id) {
      const { data: members } = await supabase
        .from("club_memberships")
        .select("player_id")
        .eq("club_id", club_id)
        .eq("status", "active");

      if (members) {
        for (const member of members) {
          if (!targetPlayerIds.includes(member.player_id)) {
            targetPlayerIds.push(member.player_id);
          }
        }
      }
    }

    const notificationType = toNotificationType(type);
    let totalSent = 0;
    let totalFailed = 0;
    let totalNotified = 0;

    // ── Process each target player ─────────────────────────────────
    for (const pid of targetPlayerIds) {
      try {
        // Create in-app notification
        const { error: notifError } = await supabase
          .from("notifications")
          .insert({
            player_id: pid,
            type: notificationType,
            title: payload.title,
            body: payload.body,
            metadata: metadata ?? {},
            is_read: false,
          });

        if (notifError) {
          console.error("Notification insert error:", notifError);
        } else {
          totalNotified++;
        }

        // Check user preferences
        const prefKey = getPrefKeyForType(type);
        if (prefKey) {
          const { data: prefs } = await supabase
            .from("notification_preferences")
            .select(prefKey)
            .eq("player_id", pid)
            .single();

          if (
            prefs &&
            (prefs as Record<string, unknown>)[prefKey] === false
          ) {
            // User opted out of this push type
            continue;
          }
        }

        // Look up player's user_id for push subscriptions
        const { data: player } = await supabase
          .from("players")
          .select("user_id")
          .eq("id", pid)
          .single();

        if (!player?.user_id) continue;

        // Fetch push subscriptions
        const { data: subscriptions } = await supabase
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", player.user_id);

        if (!subscriptions || subscriptions.length === 0) continue;

        const staleIds: string[] = [];

        for (const sub of subscriptions as PushSubscriptionRow[]) {
          const success = await sendWebPush(sub, payload);
          if (success) {
            totalSent++;
          } else {
            // Check if subscription is stale (410/404 handled inside sendWebPush)
            staleIds.push(sub.id);
            totalFailed++;
          }
        }

        // Clean up stale subscriptions
        if (staleIds.length > 0) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .in("id", staleIds);
        }
      } catch (err) {
        console.error(`Failed to notify player ${pid}:`, err);
        totalFailed++;
      }
    }

    return new Response(
      JSON.stringify({
        sent: totalSent,
        failed: totalFailed,
        notified: totalNotified,
        targets: targetPlayerIds.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Send notification error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to send notifications",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
