import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/clubs/members?club_id=xxx
 * List members of a club.
 * Query params: club_id (required), status (active|inactive|pending)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clubId = searchParams.get("club_id");
  const status = searchParams.get("status");

  if (!clubId) {
    return NextResponse.json({ error: "club_id is required" }, { status: 400 });
  }

  const supabase = await createClient();
  let query = supabase
    .from("club_members")
    .select(
      "*, player:players(id, display_name, avatar_url, skill_level)"
    )
    .eq("club_id", clubId)
    .order("role", { ascending: true })
    .order("joined_at", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ members: data ?? [] });
}

/**
 * POST /api/clubs/members
 * Join a club (creates pending membership).
 * Body: { club_id }
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
  const { club_id } = body;

  if (!club_id) {
    return NextResponse.json(
      { error: "club_id is required" },
      { status: 400 }
    );
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("club_members")
    .select("id, status")
    .eq("club_id", club_id)
    .eq("player_id", player.id)
    .maybeSingle();

  if (existing?.status === "active") {
    return NextResponse.json(
      { error: "Already a member of this club" },
      { status: 409 }
    );
  }

  if (existing?.status === "pending") {
    return NextResponse.json(
      { error: "Membership request already pending" },
      { status: 409 }
    );
  }

  // Check if this is the player's first club
  const { count } = await supabase
    .from("club_members")
    .select("id", { count: "exact", head: true })
    .eq("player_id", player.id)
    .eq("status", "active");

  const insertData: Record<string, unknown> = {
    club_id,
    player_id: player.id,
    status: "pending",
    is_primary_club: (count ?? 0) === 0,
  };

  // Reactivate or create
  if (existing) {
    const { data, error } = await supabase
      .from("club_members")
      .update({ status: "pending" })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ member: data }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("club_members")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ member: data }, { status: 201 });
}

/**
 * PATCH /api/clubs/members
 * Update a member's status or role (club manager or admin only).
 * Body: { id, status?, role? }
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
  const { id, status, role } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Member id is required" },
      { status: 400 }
    );
  }

  // Get the membership to find the club
  const { data: membership } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("id", id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  // Check if the current user is the club manager or admin
  if (player.role !== "admin") {
    const { data: club } = await supabase
      .from("clubs")
      .select("claimed_by")
      .eq("id", membership.club_id)
      .single();

    if (!club || club.claimed_by !== player.id) {
      return NextResponse.json(
        { error: "Only club managers or admins can update members" },
        { status: 403 }
      );
    }
  }

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (role) updates.role = role;

  const { data, error } = await supabase
    .from("club_members")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ member: data });
}

/**
 * DELETE /api/clubs/members
 * Leave a club (player) or remove a member (manager/admin).
 * Body: { club_id, player_id? }
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: currentPlayer } = await supabase
    .from("players")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!currentPlayer) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const body = await req.json();
  const { club_id, player_id } = body;

  if (!club_id) {
    return NextResponse.json(
      { error: "club_id is required" },
      { status: 400 }
    );
  }

  const targetPlayerId = player_id || currentPlayer.id;

  // If removing someone else, must be club manager or admin
  if (targetPlayerId !== currentPlayer.id && currentPlayer.role !== "admin") {
    const { data: club } = await supabase
      .from("clubs")
      .select("claimed_by")
      .eq("id", club_id)
      .single();

    if (!club || club.claimed_by !== currentPlayer.id) {
      return NextResponse.json(
        { error: "Only club managers or admins can remove members" },
        { status: 403 }
      );
    }
  }

  const { error } = await supabase
    .from("club_members")
    .delete()
    .eq("club_id", club_id)
    .eq("player_id", targetPlayerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
