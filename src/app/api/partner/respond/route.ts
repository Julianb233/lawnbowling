import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateRequestStatus } from "@/lib/db/partner-requests";
import { createMatch } from "@/lib/db/matches";

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
      .select("id")
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

      const match = await createMatch(
        { sport: partnerRequest.sport },
        [partnerRequest.requester_id, partnerRequest.target_id]
      );

      return NextResponse.json({ status: "accepted", match });
    } else {
      // Decline: just update the request status
      await updateRequestStatus(request_id, "declined");
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
