import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMyTeams, createTeam } from "@/lib/db/teams";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const teams = await getMyTeams(player.id);
    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Get teams error:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, sport } = body;

    if (!name || !sport) {
      return NextResponse.json({ error: "Name and sport are required" }, { status: 400 });
    }

    const team = await createTeam({
      name,
      description: description || null,
      sport,
      captain_id: user.id,
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("Create team error:", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
