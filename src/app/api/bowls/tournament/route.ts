import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_BOWLS_FORMATS = ["fours", "triples", "pairs", "singles"] as const;
type BowlsFormat = (typeof VALID_BOWLS_FORMATS)[number];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: tournaments, error } = await supabase
      .from("tournaments")
      .select("*, creator:players!tournaments_created_by_fkey(id, display_name, avatar_url), tournament_participants(count)")
      .eq("sport", "lawn_bowling")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error("Get bowls tournaments error:", error);
    return NextResponse.json({ error: "Failed to fetch bowls tournaments" }, { status: 500 });
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
    const { name, bowls_format, max_players, starts_at } = body;

    if (!name || !bowls_format) {
      return NextResponse.json({ error: "Name and bowls_format are required" }, { status: 400 });
    }

    if (!VALID_BOWLS_FORMATS.includes(bowls_format as BowlsFormat)) {
      return NextResponse.json(
        { error: `Invalid bowls_format. Must be one of: ${VALID_BOWLS_FORMATS.join(", ")}` },
        { status: 400 }
      );
    }

    const supabaseAdmin = await createClient();
    const insertData: Record<string, unknown> = {
      name,
      sport: "lawn_bowling",
      format: bowls_format,
      status: "registration",
      max_players: max_players || 32,
      created_by: player.id,
    };
    if (player.venue_id) insertData.venue_id = player.venue_id;
    if (starts_at) insertData.starts_at = starts_at;

    const { data: tournament, error: insertError } = await supabaseAdmin
      .from("tournaments")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error) {
    console.error("Create bowls tournament error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
