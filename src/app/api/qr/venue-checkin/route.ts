import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/qr/venue-checkin
 * Player self-check-in via venue QR code.
 * Requires authenticated user. Accepts { venue_id }.
 */
export async function POST(req: NextRequest) {
  const { venue_id } = await req.json();

  if (!venue_id) {
    return NextResponse.json({ error: "Missing venue_id" }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify venue exists
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id, name")
    .eq("id", venue_id)
    .single();

  if (venueError || !venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  // Find the player record for this user
  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id, display_name, is_available, venue_id")
    .eq("user_id", user.id)
    .single();

  if (playerError || !player) {
    return NextResponse.json({ error: "Player profile not found" }, { status: 404 });
  }

  // Already checked in at this venue
  if (player.is_available && player.venue_id === venue_id) {
    return NextResponse.json({
      success: true,
      already_checked_in: true,
      player_name: player.display_name,
      venue_name: venue.name,
    });
  }

  // Check the player in
  const { error: updateError } = await supabase
    .from("players")
    .update({
      is_available: true,
      checked_in_at: new Date().toISOString(),
      venue_id: venue_id,
    })
    .eq("id", player.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    already_checked_in: false,
    player_name: player.display_name,
    venue_name: venue.name,
    checked_in_at: new Date().toISOString(),
  });
}
