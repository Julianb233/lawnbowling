import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-error-handler";

/**
 * GET /api/clubs/managed
 * Get clubs managed by the current user.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
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

  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("claimed_by", player.id)
    .order("name", { ascending: true });

  if (error) {
    return apiError(error, "clubs/managed", 500);
  }

  return NextResponse.json({ clubs: data ?? [] });
}

/**
 * PATCH /api/clubs/managed
 * Update a club managed by the current user.
 * Body: { id, name?, description?, phone?, email?, website?, ... }
 */
export async function PATCH(req: NextRequest) {
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
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Club id is required" }, { status: 400 });
  }

  // Verify the player manages this club (or is admin)
  if (player.role !== "admin") {
    const { data: club } = await supabase
      .from("clubs")
      .select("claimed_by")
      .eq("id", id)
      .single();

    if (!club || club.claimed_by !== player.id) {
      return NextResponse.json(
        { error: "You do not manage this club" },
        { status: 403 }
      );
    }
  }

  // Only allow safe fields to be updated by managers
  const allowedFields = [
    "name", "description", "phone", "email", "website",
    "address", "member_count", "greens", "rinks", "surface_type",
    "activities", "facilities", "facebook_url", "instagram_url",
    "youtube_url", "logo_url", "cover_image_url", "tags",
  ];
  const safeUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      safeUpdates[key] = updates[key];
    }
  }

  const { data, error } = await supabase
    .from("clubs")
    .update(safeUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return apiError(error, "clubs/managed", 400);
  }

  return NextResponse.json({ club: data });
}
