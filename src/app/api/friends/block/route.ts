import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerIdFromAuth } from "@/lib/db/get-player-id";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playerId = await getPlayerIdFromAuth(supabase, user.id);
  if (!playerId) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const { blocked_id } = await request.json();
  const { error } = await supabase
    .from("friendships")
    .upsert({ player_id: playerId, friend_id: blocked_id, status: "blocked" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
