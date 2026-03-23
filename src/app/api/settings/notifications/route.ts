import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerIdFromAuth } from "@/lib/db/get-player-id";
import { getNotificationPreferences } from "@/lib/db/settings";
import { apiError } from "@/lib/api-error-handler";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playerId = await getPlayerIdFromAuth(supabase, user.id);
  if (!playerId) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const prefs = await getNotificationPreferences(playerId);
  return NextResponse.json(prefs);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playerId = await getPlayerIdFromAuth(supabase, user.id);
  if (!playerId) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const body = await request.json();
  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      { player_id: playerId, ...body, updated_at: new Date().toISOString() },
      { onConflict: "player_id" }
    );

  if (error) return apiError(error, "settings/notifications", 400);
  return NextResponse.json({ ok: true });
}
