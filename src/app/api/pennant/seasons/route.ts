import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRoundRobinFixtures } from "@/lib/pennant-engine";
import type { PennantTeam } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venue_id");

    let query = supabase
      .from("pennant_seasons")
      .select(`
        *,
        divisions:pennant_divisions(
          *,
          teams:pennant_teams(*)
        )
      `)
      .order("season_year", { ascending: false })
      .order("created_at", { ascending: false });

    if (venueId) {
      query = query.eq("venue_id", venueId);
    }

    const { data: seasons, error } = await query;
    if (error) throw error;

    return NextResponse.json({ seasons: seasons ?? [] });
  } catch (error) {
    console.error("Get pennant seasons error:", error);
    return NextResponse.json({ error: "Failed to fetch seasons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const { data: player } = await supabase
      .from("players")
      .select("id, role, venue_id")
      .eq("user_id", user.id)
      .single();

    if (!player || player.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      season_year,
      starts_at,
      ends_at,
      rounds_total,
      format = "round_robin",
      description,
      divisions = [],
      teams_by_division = {},
    } = body;

    if (!name || !season_year || !starts_at || !ends_at || !rounds_total) {
      return NextResponse.json(
        { error: "Missing required fields: name, season_year, starts_at, ends_at, rounds_total" },
        { status: 400 }
      );
    }

    // Create season
    const { data: season, error: seasonError } = await supabase
      .from("pennant_seasons")
      .insert({
        venue_id: player.venue_id,
        name,
        season_year,
        starts_at,
        ends_at,
        rounds_total,
        format,
        description,
        created_by: user.id,
      })
      .select()
      .single();

    if (seasonError) throw seasonError;

    // Create divisions
    const createdDivisions: Array<{ id: string; name: string; grade: number }> = [];
    for (const div of divisions as Array<{ name: string; grade: number }>) {
      const { data: division, error: divError } = await supabase
        .from("pennant_divisions")
        .insert({
          season_id: season.id,
          name: div.name,
          grade: div.grade,
        })
        .select()
        .single();

      if (divError) throw divError;
      createdDivisions.push(division);
    }

    // Create teams per division and generate fixtures
    for (const div of createdDivisions) {
      const divTeams = (teams_by_division as Record<string, Array<{ name: string; captain_id: string; club_id?: string }>>)[div.name] ?? [];

      const createdTeams: PennantTeam[] = [];
      for (const team of divTeams) {
        const { data: createdTeam, error: teamError } = await supabase
          .from("pennant_teams")
          .insert({
            division_id: div.id,
            season_id: season.id,
            name: team.name,
            captain_id: team.captain_id,
            club_id: team.club_id ?? null,
            venue_id: player.venue_id,
          })
          .select()
          .single();

        if (teamError) throw teamError;
        createdTeams.push(createdTeam as PennantTeam);

        // Auto-add captain as team member
        await supabase
          .from("pennant_team_members")
          .insert({
            team_id: createdTeam.id,
            player_id: team.captain_id,
            role: "captain",
          });
      }

      // Generate fixtures for this division
      if (createdTeams.length >= 2) {
        const fixtures = generateRoundRobinFixtures(
          createdTeams,
          rounds_total,
          season.id,
          div.id
        );

        if (fixtures.length > 0) {
          const { error: fixtureError } = await supabase
            .from("pennant_fixtures")
            .insert(fixtures);

          if (fixtureError) throw fixtureError;
        }
      }
    }

    return NextResponse.json({ season }, { status: 201 });
  } catch (error) {
    console.error("Create pennant season error:", error);
    return NextResponse.json({ error: "Failed to create season" }, { status: 500 });
  }
}
