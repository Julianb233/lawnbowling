import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToPlayer } from "@/lib/push";
import { createNotification } from "@/lib/db/notifications";
import type { PushNotificationType, PushPayload } from "@/lib/push";
import type { NotificationType } from "@/lib/types";

/** Map push notification types to in-app notification types */
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

/**
 * POST /api/notifications/send
 *
 * Send push + in-app notifications based on user preferences.
 * Can target a single player or all members of a club.
 *
 * Body:
 *   - player_id?: string        — target a single player
 *   - club_id?: string          — target all members of a club
 *   - type: PushNotificationType
 *   - payload: PushPayload      — { title, body, url?, ... }
 *   - metadata?: Record<string, unknown>
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify caller is admin or has server-level access
    const { data: callerPlayer } = await supabase
      .from("players")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!callerPlayer || callerPlayer.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
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

    if (!type || !payload) {
      return NextResponse.json(
        { error: "type and payload are required" },
        { status: 400 }
      );
    }

    if (!player_id && !club_id) {
      return NextResponse.json(
        { error: "Either player_id or club_id is required" },
        { status: 400 }
      );
    }

    const notificationType = toNotificationType(type);
    let totalSent = 0;
    let totalFailed = 0;
    let totalNotified = 0;

    // Collect target player IDs
    const targetPlayerIds: string[] = [];

    if (player_id) {
      targetPlayerIds.push(player_id);
    }

    if (club_id) {
      // Get all members of the club
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

    for (const pid of targetPlayerIds) {
      try {
        // Create in-app notification
        await createNotification({
          player_id: pid,
          type: notificationType,
          title: payload.title,
          body: payload.body,
          metadata: metadata ?? {},
        });
        totalNotified++;

        // Send push notification (respects user preferences internally)
        const result = await sendPushToPlayer(pid, type, payload);
        totalSent += result.sent;
        totalFailed += result.failed;
      } catch (err) {
        console.error(`Failed to notify player ${pid}:`, err);
        totalFailed++;
      }
    }

    return NextResponse.json({
      sent: totalSent,
      failed: totalFailed,
      notified: totalNotified,
      targets: targetPlayerIds.length,
    });
  } catch (err) {
    console.error("Notification send error:", err);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
