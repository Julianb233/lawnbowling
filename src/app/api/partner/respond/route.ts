import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateRequestStatus } from "@/lib/db/partner-requests";
import { createMatch } from "@/lib/db/matches";
import { sendPushToPlayer } from "@/lib/push";
import { createNotification } from "@/lib/db/notifications";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { request_id, accept } = body;

    if (!request_id || typeof accept !== "boolean") {
      return NextResponse.json(
        { error: "request_id and accept (boolean) are required" },
        { status: 400 }
      );
    }

    // Get the request
    const { data: partnerRequest, error: reqError } = await supabase
      .from("partner_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (reqError || !partnerRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Verify the current user is the target
    const { data: currentPlayer } = await supabase
      .from("players")
      .select("id, display_name")
      .eq("user_id", user.id)
      .single();

    if (!currentPlayer || currentPlayer.id !== partnerRequest.target_id) {
      return NextResponse.json(
        { error: "You can only respond to requests sent to you" },
        { status: 403 }
      );
    }

    if (partnerRequest.status !== "pending") {
      return NextResponse.json(
        { error: "This request has already been responded to" },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date(partnerRequest.expires_at) < new Date()) {
      await updateRequestStatus(request_id, "expired");
      return NextResponse.json(
        { error: "This request has expired" },
        { status: 400 }
      );
    }

    if (accept) {
      // Accept: update request, create match, mark both unavailable
      await updateRequestStatus(request_id, "accepted");

      // Look up requester's venue_id for the match
      const { data: requester } = await supabase
        .from("players")
        .select("venue_id")
        .eq("id", partnerRequest.requester_id)
        .single();

      const match = await createMatch(
        {
          sport: partnerRequest.sport,
          venue_id: requester?.venue_id ?? undefined,
        },
        [partnerRequest.requester_id, partnerRequest.target_id]
      );

      // Create persistent notification for the requester
      const responderName = currentPlayer.display_name || "Your partner";
      createNotification({
        player_id: partnerRequest.requester_id,
        type: "partner_request_accepted",
        title: "Request Accepted!",
        body: `${responderName} accepted your ${partnerRequest.sport} request!`,
        metadata: {
          request_id: partnerRequest.id,
          match_id: match.id,
          sport: partnerRequest.sport,
        },
      }).catch((err: unknown) => console.error("Failed to create notification:", err));

      // Send push notification
      sendPushToPlayer(partnerRequest.requester_id, "partner_accepted", {
        title: "Partner Found!",
        body: `${responderName} accepted your request for ${partnerRequest.sport}!`,
        tag: `partner-accepted-${partnerRequest.id}`,
        url: "/board",
      }).catch((err: unknown) => console.error("Push notification failed:", err));

      return NextResponse.json({ status: "accepted", match });
    } else {
      // Decline: just update the request status
      await updateRequestStatus(request_id, "declined");

      // Create persistent notification for the requester
      createNotification({
        player_id: partnerRequest.requester_id,
        type: "partner_request_declined",
        title: "Request Declined",
        body: `${currentPlayer.display_name || "A player"} declined your ${partnerRequest.sport} request.`,
        metadata: {
          request_id: partnerRequest.id,
          sport: partnerRequest.sport,
        },
      }).catch((err: unknown) => console.error("Failed to create notification:", err));

      return NextResponse.json({ status: "declined" });
    }
  } catch (error) {
    console.error("Partner respond error:", error);
    return NextResponse.json(
      { error: "Failed to respond to request" },
      { status: 500 }
    );
  }
}
