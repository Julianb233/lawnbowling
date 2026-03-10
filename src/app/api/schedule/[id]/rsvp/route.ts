import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rsvpToGame } from "@/lib/db/schedule";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current player
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: "Player profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["going", "maybe", "not_going"].includes(status)) {
      return NextResponse.json(
        { error: "status must be going, maybe, or not_going" },
        { status: 400 }
      );
    }

    const rsvp = await rsvpToGame(gameId, player.id, status);

    return NextResponse.json({ rsvp });
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { error: "Failed to RSVP" },
      { status: 500 }
    );
  }
}
