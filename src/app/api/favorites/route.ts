import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerIdFromAuth } from "@/lib/db/get-player-id";
import { apiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playerId = await getPlayerIdFromAuth(supabase, user.id);
  if (!playerId) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const { favorite_id } = await request.json();
  const { error } = await supabase
    .from("favorites")
    .upsert({ player_id: playerId, favorite_id });
  if (error) return apiError(error, "favorites", 400);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playerId = await getPlayerIdFromAuth(supabase, user.id);
  if (!playerId) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const { favorite_id } = await request.json();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("player_id", playerId)
    .eq("favorite_id", favorite_id);
  if (error) return apiError(error, "favorites", 400);
  return NextResponse.json({ ok: true });
}
