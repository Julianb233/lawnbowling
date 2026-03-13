import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { getMessages, sendMessage } from "@/lib/db/messages";

/** GET /api/messages?friendId=xxx — fetch messages with a friend */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const player = await getPlayerByUserId(user.id);
  if (!player) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const friendId = request.nextUrl.searchParams.get("friendId");
  if (!friendId) return NextResponse.json({ error: "friendId required" }, { status: 400 });

  const before = request.nextUrl.searchParams.get("before") ?? undefined;
  const messages = await getMessages(player.id, friendId, 50, before);
  return NextResponse.json(messages);
}

/** POST /api/messages — send a message */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const player = await getPlayerByUserId(user.id);
  if (!player) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const { receiver_id, content } = await request.json();
  if (!receiver_id || !content?.trim()) {
    return NextResponse.json({ error: "receiver_id and content required" }, { status: 400 });
  }

  // Verify they are friends
  const { data: friendship } = await supabase
    .from("friendships")
    .select("id")
    .or(
      `and(player_id.eq.${player.id},friend_id.eq.${receiver_id}),and(player_id.eq.${receiver_id},friend_id.eq.${player.id})`
    )
    .eq("status", "accepted")
    .limit(1)
    .maybeSingle();

  if (!friendship) {
    return NextResponse.json({ error: "Can only message friends" }, { status: 403 });
  }

  const msg = await sendMessage(player.id, receiver_id, content.trim());
  return NextResponse.json(msg);
}
