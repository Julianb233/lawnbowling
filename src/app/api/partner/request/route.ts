import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPartnerRequest, hasPendingRequest } from "@/lib/db/partner-requests";

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
      .select("id, is_available, sports")
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

    // Create request with 5-minute expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const partnerRequest = await createPartnerRequest({
      requester_id: currentPlayer.id,
      target_id,
      sport,
      expires_at: expiresAt,
    });

    return NextResponse.json({ request: partnerRequest }, { status: 201 });
  } catch (error) {
    console.error("Partner request error:", error);
    return NextResponse.json(
      { error: "Failed to create partner request" },
      { status: 500 }
    );
  }
}
