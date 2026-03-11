import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BowlsPosition, CheckinSource } from "@/lib/types";

/**
 * POST /api/bowls/checkin
 * Check in a player for a bowls tournament with position preference.
 * Body: { player_id, tournament_id, preferred_position, checkin_source?, visit_token? }
 * Idempotent: upserts on (player_id, tournament_id) — no duplicate rows (UCI-13).
 * REQ-12-07: When visit_token is provided, validates and marks the player as a guest.
 */
export async function POST(req: NextRequest) {
  try {
    const { player_id, tournament_id, preferred_position, checkin_source, visit_token } = (await req.json()) as {
      player_id: string;
      tournament_id: string;
      preferred_position: BowlsPosition;
      checkin_source?: CheckinSource;
      visit_token?: string;
    };

    if (!player_id || !tournament_id || !preferred_position) {
      return NextResponse.json(
        { error: "player_id, tournament_id, and preferred_position required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let isGuest = false;

    // REQ-12-07: Validate visit token if provided
    if (visit_token) {
      const { data: visitReq, error: visitErr } = await supabase
        .from("visit_requests")
        .select("id, status, requested_date, player_id, expires_at")
        .eq("visit_token", visit_token)
        .single();

      if (visitErr || !visitReq) {
        return NextResponse.json({ error: "Invalid visit token" }, { status: 400 });
      }

      if (visitReq.status !== "accepted") {
        return NextResponse.json({ error: "Visit token is not valid" }, { status: 400 });
      }

      if (visitReq.player_id !== player_id) {
        return NextResponse.json({ error: "Visit token does not match player" }, { status: 403 });
      }

      if (visitReq.expires_at && new Date(visitReq.expires_at) < new Date()) {
        return NextResponse.json({ error: "Visit token has expired" }, { status: 410 });
      }

      isGuest = true;
    }

    // Upsert — if they check in again, update their position choice (UCI-13)
    const { data, error } = await supabase
      .from("bowls_checkins")
      .upsert(
        {
          player_id,
          tournament_id,
          preferred_position,
          checkin_source: checkin_source ?? "manual",
          checked_in_at: new Date().toISOString(),
          is_guest: isGuest,
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
