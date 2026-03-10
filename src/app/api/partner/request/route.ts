import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPartnerRequest, hasPendingRequest } from "@/lib/db/partner-requests";
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
    const { target_id, sport } = body;

    if (!target_id || !sport) {
      return NextResponse.json(
        { error: "target_id and sport are required" },
        { status: 400 }
      );
    }

    // Get current player
    const { data: currentPlayer, error: playerError } = await supabase
      .from("players")
      .select("id, is_available, sports, display_name")
      .eq("user_id", user.id)
      .single();

    if (playerError || !currentPlayer) {
      return NextResponse.json(
        { error: "Player profile not found" },
        { status: 404 }
      );
    }

    if (!currentPlayer.is_available) {
      return NextResponse.json(
        { error: "You are not currently available" },
        { status: 400 }
      );
    }

    // Check target player exists and is available
    const { data: targetPlayer, error: targetError } = await supabase
      .from("players")
      .select("id, is_available, sports")
      .eq("id", target_id)
      .single();

    if (targetError || !targetPlayer) {
      return NextResponse.json(
        { error: "Target player not found" },
        { status: 404 }
      );
    }

    if (!targetPlayer.is_available) {
      return NextResponse.json(
        { error: "That player is no longer available" },
        { status: 400 }
      );
    }

    if (currentPlayer.id === target_id) {
      return NextResponse.json(
        { error: "You cannot send a request to yourself" },
        { status: 400 }
      );
    }

    // Check for existing pending request
    const alreadyPending = await hasPendingRequest(currentPlayer.id, target_id);
    if (alreadyPending) {
      return NextResponse.json(
        { error: "You already have a pending request to this player" },
        { status: 409 }
      );
    }

    // Create request with configurable expiration (default 5 minutes)
    const timeoutMinutes = parseInt(process.env.PARTNER_REQUEST_TIMEOUT_MINUTES || "5", 10);
    const expiresAt = new Date(Date.now() + timeoutMinutes * 60 * 1000).toISOString();

    const partnerRequest = await createPartnerRequest({
      requester_id: currentPlayer.id,
      target_id,
      sport,
      expires_at: expiresAt,
    });

    // Create persistent notification for the target player
    createNotification({
      player_id: target_id,
      type: "partner_request_received",
      title: "New Partner Request",
      body: `${currentPlayer.display_name || "A player"} wants to play ${sport} with you!`,
      metadata: {
        request_id: partnerRequest.id,
        requester_id: currentPlayer.id,
        sport,
      },
    }).catch((err: unknown) => console.error("Failed to create notification:", err));

    // Send push notification to target player (fire-and-forget)
    const requesterName = currentPlayer.display_name || "Someone";
    sendPushToPlayer(target_id, "partner_request", {
      title: "Partner Request",
      body: `${requesterName} wants to play ${sport} with you!`,
      tag: `partner-request-${partnerRequest.id}`,
      url: "/board",
      actions: [
        { action: "accept", title: "View" },
        { action: "dismiss", title: "Later" },
      ],
    }).catch((err: unknown) => console.error("Push notification failed:", err));

    return NextResponse.json({ request: partnerRequest }, { status: 201 });
  } catch (error) {
    console.error("Partner request error:", error);
    return NextResponse.json(
      { error: "Failed to create partner request" },
      { status: 500 }
    );
  }
}
