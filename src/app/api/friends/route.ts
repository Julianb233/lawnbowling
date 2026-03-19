import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerIdFromAuth } from "@/lib/db/get-player-id";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playerId = await getPlayerIdFromAuth(supabase, user.id);
  if (!playerId) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const { friend_id } = await request.json();
  if (!friend_id || playerId === friend_id) {
    return NextResponse.json({ error: "Invalid friend request" }, { status: 400 });
  }
  const { error } = await supabase
    .from("friendships")
    .insert({ player_id: playerId, friend_id, status: "pending" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
