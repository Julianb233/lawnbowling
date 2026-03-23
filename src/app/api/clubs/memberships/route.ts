import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireClubRole, hasHigherOrEqualRole } from "@/lib/club-auth";
import type { ClubRole } from "@/lib/types";
import { apiError } from "@/lib/api-error-handler";

/**
 * GET /api/clubs/memberships?club_id=xxx&status=active
 * List memberships for a club.
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
    .from("club_memberships")
    .select("*, player:players!club_memberships_player_id_fkey(id, display_name, avatar_url)")
    .eq("club_id", clubId)
    .order("created_at", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return apiError(error, "GET /api/clubs/memberships", 500);
  }

  return NextResponse.json({ memberships: data ?? [] });
}

/**
 * POST /api/clubs/memberships
 * Join a club or invite a player.
 * Body: { club_id, player_id?, role?, invite_code? }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: currentPlayer } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!currentPlayer) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const body = await req.json();
  const { club_id, player_id, role, invite_code } = body as {
    club_id: string;
    player_id?: string;
    role?: ClubRole;
    invite_code?: string;
  };

  if (!club_id) {
    return NextResponse.json({ error: "club_id is required" }, { status: 400 });
  }

  // If joining via invite code
  if (invite_code) {
    const { data: invite } = await supabase
      .from("club_memberships")
      .select("id, club_id, role")
      .eq("invite_code", invite_code)
      .eq("status", "pending")
      .is("player_id", null)
      .single();

    if (!invite || invite.club_id !== club_id) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("club_memberships")
      .update({
        player_id: currentPlayer.id,
        status: "active",
        joined_at: new Date().toISOString(),
      })
      .eq("id", invite.id)
      .select()
      .single();

    if (error) {
      return apiError(error, "POST /api/clubs/memberships", 400);
    }
    return NextResponse.json({ membership: data }, { status: 200 });
  }

  // If inviting someone else, need admin/owner role
  if (player_id && player_id !== currentPlayer.id) {
    const authResult = await requireClubRole(club_id, ["owner", "admin"]);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("club_memberships")
      .select("id, status")
      .eq("club_id", club_id)
      .eq("player_id", player_id)
      .maybeSingle();

    if (existing?.status === "active") {
      return NextResponse.json({ error: "Already a member" }, { status: 409 });
    }

    if (existing) {
      const { data, error } = await supabase
        .from("club_memberships")
        .update({
          role: role ?? "member",
          status: "active",
          invited_by: currentPlayer.id,
          joined_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) return apiError(error, "POST /api/clubs/memberships", 400);
      return NextResponse.json({ membership: data });
    }

    const { data, error } = await supabase
      .from("club_memberships")
      .insert({
        club_id,
        player_id,
        role: role ?? "member",
        status: "active",
        invited_by: currentPlayer.id,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return apiError(error, "POST /api/clubs/memberships", 400);
    return NextResponse.json({ membership: data }, { status: 201 });
  }

  // Self-join (as member or visitor, pending approval)
  const { data: existing } = await supabase
    .from("club_memberships")
    .select("id, status")
    .eq("club_id", club_id)
    .eq("player_id", currentPlayer.id)
    .maybeSingle();

  if (existing?.status === "active") {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  if (existing) {
    const { data, error } = await supabase
      .from("club_memberships")
      .update({ status: "pending" })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return apiError(error, "POST /api/clubs/memberships", 400);
    return NextResponse.json({ membership: data });
  }

  const { data, error } = await supabase
    .from("club_memberships")
    .insert({
      club_id,
      player_id: currentPlayer.id,
      role: "member",
      status: "pending",
    })
    .select()
    .single();

  if (error) return apiError(error, "POST /api/clubs/memberships", 400);
  return NextResponse.json({ membership: data }, { status: 201 });
}

/**
 * PATCH /api/clubs/memberships
 * Update membership role or status. Requires owner/admin role.
 * Body: { id, role?, status? }
 */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, role, status } = body as { id: string; role?: ClubRole; status?: string };

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Get the membership to find club_id
  const { data: membership } = await supabase
    .from("club_memberships")
    .select("club_id, role, player_id")
    .eq("id", id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  // Check permission
  const authResult = await requireClubRole(membership.club_id, ["owner", "admin"]);
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  // Cannot change owner role unless you are the owner
  if (membership.role === "owner" && authResult.membership.role !== "owner") {
    return NextResponse.json({ error: "Only owners can modify owner memberships" }, { status: 403 });
  }

  // Cannot assign a role higher than your own
  if (role && !hasHigherOrEqualRole(authResult.membership.role, role)) {
    return NextResponse.json({ error: "Cannot assign a role higher than your own" }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  if (role) updates.role = role;
  if (status) {
    updates.status = status;
    if (status === "active" && !membership.player_id) {
      // Don't activate without a player
    } else if (status === "active") {
      updates.joined_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("club_memberships")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return apiError(error, "PATCH /api/clubs/memberships", 400);
  return NextResponse.json({ membership: data });
}

/**
 * DELETE /api/clubs/memberships
 * Leave a club or remove a member.
 * Body: { id }
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
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!currentPlayer) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const body = await req.json();
  const { id } = body as { id: string };

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from("club_memberships")
    .select("club_id, player_id, role")
    .eq("id", id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  // Cannot remove owner
  if (membership.role === "owner") {
    return NextResponse.json({ error: "Cannot remove the club owner" }, { status: 403 });
  }

  // Self-removal is always allowed (except owner)
  const isSelf = membership.player_id === currentPlayer.id;
  if (!isSelf) {
    const authResult = await requireClubRole(membership.club_id, ["owner", "admin"]);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
  }

  const { error } = await supabase
    .from("club_memberships")
    .delete()
    .eq("id", id);

  if (error) return apiError(error, "DELETE /api/clubs/memberships", 400);
  return NextResponse.json({ success: true });
}
