import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToPlayer } from "@/lib/push";
import { getClubById } from "@/lib/clubs-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (!action || !["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    // Get the admin's player record
    const { data: adminPlayer } = await supabase
      .from("players")
      .select("id, role, venue_id")
      .eq("user_id", user.id)
      .single();

    if (!adminPlayer || adminPlayer.role !== "admin") {
      return NextResponse.json({ error: "Only admins can respond to visit requests" }, { status: 403 });
    }

    // Get the visit request
    const { data: visitRequest, error: fetchError } = await supabase
      .from("visit_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !visitRequest) {
      return NextResponse.json({ error: "Visit request not found" }, { status: 404 });
    }

    if (visitRequest.status !== "pending") {
      return NextResponse.json(
        { error: `Visit request is already ${visitRequest.status}` },
        { status: 409 }
      );
    }

    const club = getClubById(visitRequest.club_id);
    const clubName = club?.name ?? "the club";

    if (action === "accept") {
      // Generate visit token and set expiry
      const visitToken = crypto.randomUUID();
      const requestedDate = new Date(visitRequest.requested_date);
      requestedDate.setHours(23, 59, 59, 999);

      const { data: updated, error: updateError } = await supabase
        .from("visit_requests")
        .update({
          status: "accepted",
          responded_by: adminPlayer.id,
          responded_at: new Date().toISOString(),
          visit_token: visitToken,
          expires_at: requestedDate.toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to accept visit request:", updateError);
        return NextResponse.json({ error: "Failed to accept visit request" }, { status: 500 });
      }

      // Notify the visiting player
      await sendPushToPlayer(visitRequest.player_id, "partner_accepted", {
        title: "Visit Request Accepted!",
        body: `Your visit to ${clubName} on ${visitRequest.requested_date} has been approved.`,
        url: `/checkin?visit_token=${visitToken}`,
      });

      return NextResponse.json(updated);
    } else {
      // Decline
      const { data: updated, error: updateError } = await supabase
        .from("visit_requests")
        .update({
          status: "declined",
          responded_by: adminPlayer.id,
          responded_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to decline visit request:", updateError);
        return NextResponse.json({ error: "Failed to decline visit request" }, { status: 500 });
      }

      // Notify the visiting player
      await sendPushToPlayer(visitRequest.player_id, "partner_accepted", {
        title: "Visit Request Update",
        body: `Your visit request to ${clubName} on ${visitRequest.requested_date} was not approved this time.`,
      });

      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("Visit respond error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
