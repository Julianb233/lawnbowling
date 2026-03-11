import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_SPEEDS = ["fast", "medium", "slow"] as const;
const VALID_SURFACES = ["dry", "damp", "wet"] as const;
const VALID_WIND_DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "calm"] as const;
const VALID_WIND_STRENGTHS = ["calm", "light", "moderate", "strong"] as const;

export async function GET(request: NextRequest) {
  const tournamentId = request.nextUrl.searchParams.get("tournament_id");
  if (!tournamentId) {
    return NextResponse.json({ error: "tournament_id is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("green_conditions")
      .select("*, recorder:players!green_conditions_recorded_by_fkey(id, display_name, avatar_url)")
      .eq("tournament_id", tournamentId)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Get green conditions error:", error);
    return NextResponse.json({ error: "Failed to fetch green conditions" }, { status: 500 });
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
      .select("id, role, venue_id")
      .eq("user_id", user.id)
      .single();

    if (!player || player.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { tournament_id, green_speed, surface_condition, wind_direction, wind_strength, notes, temperature_c } = body;

    if (!tournament_id || !green_speed || !surface_condition || !wind_direction || !wind_strength) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!VALID_SPEEDS.includes(green_speed)) {
      return NextResponse.json({ error: "Invalid green_speed" }, { status: 400 });
    }
    if (!VALID_SURFACES.includes(surface_condition)) {
      return NextResponse.json({ error: "Invalid surface_condition" }, { status: 400 });
    }
    if (!VALID_WIND_DIRS.includes(wind_direction)) {
      return NextResponse.json({ error: "Invalid wind_direction" }, { status: 400 });
    }
    if (!VALID_WIND_STRENGTHS.includes(wind_strength)) {
      return NextResponse.json({ error: "Invalid wind_strength" }, { status: 400 });
    }

    if (notes && notes.length > 280) {
      return NextResponse.json({ error: "Notes must be 280 characters or less" }, { status: 400 });
    }

    // Get tournament's venue_id
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("venue_id")
      .eq("id", tournament_id)
      .single();

    const record = {
      tournament_id,
      venue_id: tournament?.venue_id ?? player.venue_id,
      recorded_by: player.id,
      green_speed,
      surface_condition,
      wind_direction,
      wind_strength,
      notes: notes || null,
      temperature_c: temperature_c ?? null,
      recorded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upsert on tournament_id
    const { data, error } = await supabase
      .from("green_conditions")
      .upsert(record, { onConflict: "tournament_id" })
      .select("*, recorder:players!green_conditions_recorded_by_fkey(id, display_name, avatar_url)")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Save green conditions error:", error);
    return NextResponse.json({ error: "Failed to save green conditions" }, { status: 500 });
  }
}
