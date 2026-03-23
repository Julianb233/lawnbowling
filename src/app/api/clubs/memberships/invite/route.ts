import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireClubRole } from "@/lib/club-auth";
import type { ClubRole } from "@/lib/types";
import { apiError } from "@/lib/api-error-handler";

/**
 * POST /api/clubs/memberships/invite
 * Generate an invite link for a club. Requires owner/admin/manager role.
 * Body: { club_id, role? }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { club_id, role } = body as { club_id: string; role?: ClubRole };

  if (!club_id) {
    return NextResponse.json({ error: "club_id is required" }, { status: 400 });
  }

  const authResult = await requireClubRole(club_id, ["owner", "admin", "manager"]);
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  // Generate a unique invite code
  const inviteCode = crypto.randomUUID().slice(0, 8);
  const inviteRole = role ?? "member";

  // Managers can only invite members or visitors
  if (authResult.membership.role === "manager" && !["member", "visitor"].includes(inviteRole)) {
    return NextResponse.json(
      { error: "Managers can only invite members or visitors" },
      { status: 403 }
    );
  }

  const { data: currentPlayer } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data, error } = await supabase
    .from("club_memberships")
    .insert({
      club_id,
      player_id: null as unknown as string, // placeholder until someone claims it
      role: inviteRole,
      status: "pending",
      invite_code: inviteCode,
      invited_by: currentPlayer?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    return apiError(error, "POST /api/clubs/memberships/invite", 400);
  }

  return NextResponse.json({
    invite_code: inviteCode,
    invite_url: `/clubs/join/${inviteCode}`,
    membership: data,
  });
}
