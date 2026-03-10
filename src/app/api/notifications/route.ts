import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getNotifications, getUnreadCount, markNotificationRead, markAllRead } from "@/lib/db/notifications";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(player.id, { limit, offset }),
      getUnreadCount(player.id),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await markAllRead(player.id);
    } else if (notificationId) {
      await markNotificationRead(notificationId);
    } else {
      return NextResponse.json({ error: "notificationId or markAll required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notification error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
