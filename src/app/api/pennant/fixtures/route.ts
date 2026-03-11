import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get("season_id");
    const divisionId = searchParams.get("division_id");
    const round = searchParams.get("round");
    const fixtureId = searchParams.get("fixture_id");

    if (fixtureId) {
      // Single fixture detail
      const { data: fixture, error } = await supabase
        .from("pennant_fixtures")
        .select(`
          *,
          home_team:pennant_teams!pennant_fixtures_home_team_id_fkey(*),
          away_team:pennant_teams!pennant_fixtures_away_team_id_fkey(*),
          result:pennant_fixture_results(*)
        `)
        .eq("id", fixtureId)
        .single();

      if (error) throw error;
      return NextResponse.json({ fixture });
    }

    // List fixtures
    let query = supabase
      .from("pennant_fixtures")
      .select(`
        *,
        home_team:pennant_teams!pennant_fixtures_home_team_id_fkey(id, name, club_id),
        away_team:pennant_teams!pennant_fixtures_away_team_id_fkey(id, name, club_id),
        result:pennant_fixture_results(*)
      `)
      .order("round", { ascending: true });

    if (seasonId) query = query.eq("season_id", seasonId);
    if (divisionId) query = query.eq("division_id", divisionId);
    if (round) query = query.eq("round", parseInt(round));

    const { data: fixtures, error } = await query;
    if (error) throw error;

    return NextResponse.json({ fixtures: fixtures ?? [] });
  } catch (error) {
    console.error("Get pennant fixtures error:", error);
    return NextResponse.json({ error: "Failed to fetch fixtures" }, { status: 500 });
  }
}

// Record/update a fixture result
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!player || player.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      fixture_id,
      home_rink_wins,
      away_rink_wins,
      home_shot_total,
      away_shot_total,
      notes,
    } = body;

    if (!fixture_id || home_shot_total === undefined || away_shot_total === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: fixture_id, home_shot_total, away_shot_total" },
        { status: 400 }
      );
    }

    // Determine winner
    let winner_team_id: string | null = null;
    let points_home = 1;
    let points_away = 1;

    // Get the fixture to find team IDs
    const { data: fixture, error: fixtureError } = await supabase
      .from("pennant_fixtures")
      .select("home_team_id, away_team_id")
      .eq("id", fixture_id)
      .single();

    if (fixtureError || !fixture) {
      return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
    }

    if (home_shot_total > away_shot_total) {
      winner_team_id = fixture.home_team_id;
      points_home = 2;
      points_away = 0;
    } else if (away_shot_total > home_shot_total) {
      winner_team_id = fixture.away_team_id;
      points_home = 0;
      points_away = 2;
    }

    // Upsert result
    const { data: result, error: resultError } = await supabase
      .from("pennant_fixture_results")
      .upsert(
        {
          fixture_id,
          home_rink_wins: home_rink_wins ?? 0,
          away_rink_wins: away_rink_wins ?? 0,
          home_shot_total,
          away_shot_total,
          winner_team_id,
          points_home,
          points_away,
          notes: notes ?? null,
          recorded_by: user.id,
        },
        { onConflict: "fixture_id" }
      )
      .select()
      .single();

    if (resultError) throw resultError;

    // Update fixture status to completed
    await supabase
      .from("pennant_fixtures")
      .update({ status: "completed" })
      .eq("id", fixture_id);

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error("Record fixture result error:", error);
    return NextResponse.json({ error: "Failed to record result" }, { status: 500 });
  }
}
