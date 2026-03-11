import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/clubs/claims
 * List claim requests. Admins see all; players see their own.
 * Query params: status (pending|approved|rejected), club_id
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const clubId = searchParams.get("club_id");

  // Check if admin
  const { data: player } = await supabase
    .from("players")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  let query = supabase
    .from("club_claim_requests")
    .select("*, player:players(id, display_name, avatar_url, email:user_id), club:clubs(id, name, slug, city, state_code)")
    .order("created_at", { ascending: false });

  // Non-admins only see their own claims
  if (player.role !== "admin") {
    query = query.eq("player_id", player.id);
  }

  if (status) query = query.eq("status", status);
  if (clubId) query = query.eq("club_id", clubId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ claims: data ?? [] });
}

/**
 * POST /api/clubs/claims
 * Submit a club claim request.
 * Body: { club_id, role_at_club?, message? }
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
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const body = await req.json();
  const { club_id, role_at_club, message } = body;

  if (!club_id) {
    return NextResponse.json({ error: "club_id is required" }, { status: 400 });
  }

  // Check club exists and isn't already claimed
  const { data: club } = await supabase
    .from("clubs")
    .select("id, claimed_by")
    .eq("id", club_id)
    .single();

  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }
  if (club.claimed_by) {
    return NextResponse.json(
      { error: "This club has already been claimed" },
      { status: 409 }
    );
  }

  // Check no existing pending claim by this player for this club
  const { data: existing } = await supabase
    .from("club_claim_requests")
    .select("id")
    .eq("club_id", club_id)
    .eq("player_id", player.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You already have a pending claim for this club" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("club_claim_requests")
    .insert({
      club_id,
      player_id: player.id,
      role_at_club: role_at_club || null,
      message: message || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ claim: data }, { status: 201 });
}
