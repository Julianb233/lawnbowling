import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { markMessagesRead } from "@/lib/db/messages";

/** POST /api/messages/read — mark all messages from a friend as read */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const player = await getPlayerByUserId(user.id);
  if (!player) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const { friend_id } = await request.json();
  if (!friend_id) return NextResponse.json({ error: "friend_id required" }, { status: 400 });

  await markMessagesRead(player.id, friend_id);
  return NextResponse.json({ ok: true });
}
