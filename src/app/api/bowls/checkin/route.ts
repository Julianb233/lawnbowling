import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BowlsPosition } from "@/lib/types";

/**
 * POST /api/bowls/checkin
 * Check in a player for a bowls tournament with position preference.
 * Body: { player_id, tournament_id, preferred_position }
 */
export async function POST(req: NextRequest) {
  try {
    const { player_id, tournament_id, preferred_position } = (await req.json()) as {
      player_id: string;
      tournament_id: string;
      preferred_position: BowlsPosition;
    };

    if (!player_id || !tournament_id || !preferred_position) {
      return NextResponse.json(
        { error: "player_id, tournament_id, and preferred_position required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Upsert — if they check in again, update their position choice
    const { data, error } = await supabase
      .from("bowls_checkins")
      .upsert(
        {
          player_id,
          tournament_id,
          preferred_position,
          checked_in_at: new Date().toISOString(),
        },
        { onConflict: "player_id,tournament_id" }
      )
      .select("*, player:players(id, display_name, avatar_url, skill_level)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Check-in failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bowls/checkin
 * Remove a player's check-in.
 * Body: { player_id, tournament_id }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { player_id, tournament_id } = (await req.json()) as {
      player_id: string;
      tournament_id: string;
    };

    const supabase = await createClient();
    const { error } = await supabase
      .from("bowls_checkins")
      .delete()
      .eq("player_id", player_id)
      .eq("tournament_id", tournament_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Undo failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bowls/checkin?tournament_id=xxx
 * List all checked-in players for a tournament.
 */
export async function GET(req: NextRequest) {
  const tournamentId = req.nextUrl.searchParams.get("tournament_id");

  if (!tournamentId) {
    return NextResponse.json({ error: "tournament_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bowls_checkins")
    .select("*, player:players(id, display_name, avatar_url, skill_level)")
    .eq("tournament_id", tournamentId)
    .order("checked_in_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
