import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-error-handler";

export async function POST(req: NextRequest) {
  const { player_id, venue_id } = await req.json();

  if (!player_id) {
    return NextResponse.json({ error: "Missing player_id" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id, display_name")
    .eq("id", player_id)
    .single();

  if (playerError || !player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("players")
    .update({
      is_available: true,
      checked_in_at: new Date().toISOString(),
      venue_id: venue_id || null,
    })
    .eq("id", player_id);

  if (updateError) {
    return apiError(updateError, "qr-checkin", 500);
  }

  return NextResponse.json({
    success: true,
    player_name: player.display_name,
    checked_in_at: new Date().toISOString(),
  });
}
