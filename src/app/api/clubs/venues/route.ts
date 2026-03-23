import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-error-handler";

/**
 * GET /api/clubs/venues?club_id=xxx
 * List venues linked to a club.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clubId = searchParams.get("club_id");

  if (!clubId) {
    return NextResponse.json({ error: "club_id is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_venues")
    .select("*, venue:venues(*)")
    .eq("club_id", clubId)
    .order("is_primary", { ascending: false });

  if (error) {
    return apiError(error, "clubs/venues", 500);
  }

  return NextResponse.json({ club_venues: data ?? [] });
}

/**
 * POST /api/clubs/venues
 * Link a venue to a club. Must be club manager or admin.
 * Body: { club_id, venue_id, is_primary? }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: player } = await supabase
    .from("players")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const body = await req.json();
  const { club_id, venue_id, is_primary } = body;

  if (!club_id || !venue_id) {
    return NextResponse.json(
      { error: "club_id and venue_id are required" },
      { status: 400 }
    );
  }

  // Verify the player is the club manager or an admin
  if (player.role !== "admin") {
    const { data: club } = await supabase
      .from("clubs")
      .select("claimed_by")
      .eq("id", club_id)
      .single();

    if (!club || club.claimed_by !== player.id) {
      return NextResponse.json(
        { error: "Only club managers or admins can link venues" },
        { status: 403 }
      );
    }
  }

  // If setting as primary, unset other primaries first
  if (is_primary) {
    await supabase
      .from("club_venues")
      .update({ is_primary: false })
      .eq("club_id", club_id);
  }

  const { data, error } = await supabase
    .from("club_venues")
    .upsert(
      { club_id, venue_id, is_primary: is_primary ?? false },
      { onConflict: "club_id,venue_id" }
    )
    .select("*, venue:venues(*)")
    .single();

  if (error) {
    return apiError(error, "clubs/venues", 400);
  }

  return NextResponse.json({ club_venue: data }, { status: 201 });
}

/**
 * DELETE /api/clubs/venues
 * Unlink a venue from a club. Must be club manager or admin.
 * Body: { club_id, venue_id }
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: player } = await supabase
    .from("players")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const body = await req.json();
  const { club_id, venue_id } = body;

  if (!club_id || !venue_id) {
    return NextResponse.json(
      { error: "club_id and venue_id are required" },
      { status: 400 }
    );
  }

  // Verify the player is the club manager or an admin
  if (player.role !== "admin") {
    const { data: club } = await supabase
      .from("clubs")
      .select("claimed_by")
      .eq("id", club_id)
      .single();

    if (!club || club.claimed_by !== player.id) {
      return NextResponse.json(
        { error: "Only club managers or admins can unlink venues" },
        { status: 403 }
      );
    }
  }

  const { error } = await supabase
    .from("club_venues")
    .delete()
    .eq("club_id", club_id)
    .eq("venue_id", venue_id);

  if (error) {
    return apiError(error, "clubs/venues", 400);
  }

  return NextResponse.json({ success: true });
}
