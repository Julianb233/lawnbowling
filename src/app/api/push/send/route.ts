import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToPlayer } from "@/lib/push";
import type { PushNotificationType, PushPayload } from "@/lib/push";

/**
 * Internal API endpoint for sending push notifications.
 * Requires admin role or can be called server-side.
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

    // Verify caller is admin
    const { data: player } = await supabase
      .from("players")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!player || player.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { player_id, type, payload } = body as {
      player_id: string;
      type: PushNotificationType;
      payload: PushPayload;
    };

    if (!player_id || !type || !payload) {
      return NextResponse.json(
        { error: "player_id, type, and payload are required" },
        { status: 400 }
      );
    }

    const result = await sendPushToPlayer(player_id, type, payload);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Push send error:", err);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
