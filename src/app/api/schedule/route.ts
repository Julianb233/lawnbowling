import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingGames, createGame } from "@/lib/db/schedule";

export async function GET() {
  try {
    const games = await getUpcomingGames();
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Schedule GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const { title, sport, scheduled_at, max_players, description, is_recurring, recurrence_rule } = body;

    if (!title || !sport || !scheduled_at) {
      return NextResponse.json(
        { error: "title, sport, and scheduled_at are required" },
        { status: 400 }
      );
    }

    const game = await createGame({
      organizer_id: player.id,
      title,
      sport,
      scheduled_at,
      max_players,
      description,
      is_recurring,
      recurrence_rule,
    });

    return NextResponse.json({ game }, { status: 201 });
  } catch (error) {
    console.error("Schedule POST error:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
