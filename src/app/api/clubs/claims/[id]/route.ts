import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/clubs/claims/[id]
 * Admin: approve or reject a claim request.
 * Body: { action: "approve" | "reject", rejection_reason? }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin
  const { data: adminPlayer } = await supabase
    .from("players")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!adminPlayer || adminPlayer.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { action, rejection_reason } = body;

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "action must be 'approve' or 'reject'" },
      { status: 400 }
    );
  }

  // Get the claim
  const { data: claim } = await supabase
    .from("club_claim_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }
  if (claim.status !== "pending") {
    return NextResponse.json(
      { error: "Claim has already been reviewed" },
      { status: 409 }
    );
  }

  const newStatus = action === "approve" ? "approved" : "rejected";

  // Update the claim
  const { error: claimError } = await supabase
    .from("club_claim_requests")
    .update({
      status: newStatus,
      rejection_reason: action === "reject" ? rejection_reason || null : null,
      reviewed_by: adminPlayer.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (claimError) {
    return NextResponse.json({ error: claimError.message }, { status: 500 });
  }

  // If approved, update the club's claimed_by field
  if (action === "approve") {
    const { error: clubError } = await supabase
      .from("clubs")
      .update({
        claimed_by: claim.player_id,
        claimed_at: new Date().toISOString(),
        status: "claimed",
      })
      .eq("id", claim.club_id);

    if (clubError) {
      return NextResponse.json({ error: clubError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, status: newStatus });
}
