import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listTournaments, createTournament } from "@/lib/db/tournaments";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tournaments = await listTournaments();
    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error("Get tournaments error:", error);
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id, venue_id")
      .eq("user_id", user.id)
      .single();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, sport, format, max_players, starts_at } = body;

    if (!name || !sport || !format) {
      return NextResponse.json({ error: "Name, sport, and format are required" }, { status: 400 });
    }

    const tournament = await createTournament({
      name,
      sport,
      format,
      max_players: max_players || 16,
      created_by: player.id,
      venue_id: player.venue_id ?? undefined,
      starts_at: starts_at || undefined,
    });

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error) {
    console.error("Create tournament error:", error);
    return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 });
  }
}
