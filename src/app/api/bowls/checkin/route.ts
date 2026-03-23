import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BowlsPosition, CheckinSource } from "@/lib/types";
import { apiError } from "@/lib/api-error-handler";
import { validateBody, isValidationError } from "@/lib/schemas/validate";
import { checkinCreateSchema, checkinDeleteSchema } from "@/lib/schemas";

/**
 * POST /api/bowls/checkin
 * Check in a player for a bowls tournament with position preference.
 * Idempotent: upserts on (player_id, tournament_id) — no duplicate rows (UCI-13).
 * REQ-12-07: When visit_token is provided, validates and marks the player as a guest.
 */
export async function POST(req: NextRequest) {
  try {
    const result = await validateBody(req, checkinCreateSchema);
    if (isValidationError(result)) return result;

    const { player_id, tournament_id, preferred_position, checkin_source, visit_token } = result;

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
          preferred_position: preferred_position as BowlsPosition,
          checkin_source: (checkin_source as CheckinSource) ?? "manual",
          checked_in_at: new Date().toISOString(),
          is_guest: isGuest,
        },
        { onConflict: "player_id,tournament_id" }
      )
      .select("*, player:players(id, display_name, avatar_url, skill_level)")
      .single();

    if (error) {
      return apiError(error, "POST /api/bowls/checkin", 500);
    }

    return NextResponse.json(data);
  } catch (err) {
    return apiError(err, "POST /api/bowls/checkin", 500);
  }
}

/**
 * DELETE /api/bowls/checkin
 * Remove a player's check-in.
 */
export async function DELETE(req: NextRequest) {
  try {
    const result = await validateBody(req, checkinDeleteSchema);
    if (isValidationError(result)) return result;

    const supabase = await createClient();
    const { error } = await supabase
      .from("bowls_checkins")
      .delete()
      .eq("player_id", result.player_id)
      .eq("tournament_id", result.tournament_id);

    if (error) {
      return apiError(error, "DELETE /api/bowls/checkin", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "DELETE /api/bowls/checkin", 500);
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
    return apiError(error, "GET /api/bowls/checkin", 500);
  }

  return NextResponse.json(data ?? []);
}
