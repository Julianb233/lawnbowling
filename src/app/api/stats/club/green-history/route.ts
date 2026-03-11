import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const clubId = request.nextUrl.searchParams.get("club_id");
  if (!clubId) {
    return NextResponse.json({ error: "club_id is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Get tournaments for this club, then their green conditions
    const { data: tournaments } = await supabase
      .from("tournaments")
      .select("id")
      .eq("club_id", clubId);

    if (!tournaments || tournaments.length === 0) {
      return NextResponse.json([]);
    }

    const tournamentIds = tournaments.map((t) => t.id);

    const { data } = await supabase
      .from("green_conditions")
      .select("id, green_speed, surface_condition, wind_direction, wind_strength, recorded_at")
      .in("tournament_id", tournamentIds)
      .order("recorded_at", { ascending: false })
      .limit(10);

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Green history error:", error);
    return NextResponse.json([]);
  }
}
