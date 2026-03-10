import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  joinWaitlist,
  leaveWaitlist,
  getWaitlist,
  getPlayerPosition,
} from "@/lib/db/waitlist";

export async function GET(req: NextRequest) {
  const venueId = req.nextUrl.searchParams.get("venue_id");
  const sport = req.nextUrl.searchParams.get("sport") || undefined;
  const playerId = req.nextUrl.searchParams.get("player_id");

  if (!venueId)
    return NextResponse.json({ error: "Missing venue_id" }, { status: 400 });

  try {
    if (playerId) {
      const position = await getPlayerPosition(venueId, playerId);
      return NextResponse.json(position ?? null);
    }

    const data = await getWaitlist(venueId, sport);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!player)
    return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const { venue_id, sport, partner_id } = await req.json();
  if (!venue_id || !sport) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const entry = await joinWaitlist(venue_id, sport, player.id, partner_id);
    return NextResponse.json(entry, { status: 201 });
  } catch (e) {
    const message = (e as Error).message;
    if (message === "You are already on the waitlist") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const waitlistId = req.nextUrl.searchParams.get("id");
  if (!waitlistId)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await leaveWaitlist(waitlistId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
