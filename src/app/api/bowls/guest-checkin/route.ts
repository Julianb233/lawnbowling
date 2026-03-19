import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BowlsPosition, SkillLevel } from "@/lib/types";

/**
 * POST /api/bowls/guest-checkin
 * Creates a temporary guest player record and immediately checks them in.
 * Used by the kiosk "Quick Add Guest" flow (US-006).
 *
 * Body: {
 *   first_name: string,
 *   last_name: string,
 *   skill_level: SkillLevel,
 *   preferred_position: BowlsPosition,
 *   tournament_id: string,
 *   venue_id: string,
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const {
      first_name,
      last_name,
      skill_level,
      preferred_position,
      tournament_id,
      venue_id,
    } = (await req.json()) as {
      first_name: string;
      last_name: string;
      skill_level: SkillLevel;
      preferred_position: BowlsPosition;
      tournament_id: string;
      venue_id: string;
    };

    if (!first_name || !last_name || !skill_level || !preferred_position || !tournament_id || !venue_id) {
      return NextResponse.json(
        { error: "first_name, last_name, skill_level, preferred_position, tournament_id, and venue_id are all required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const displayName = `${first_name.trim()} ${last_name.trim()}`;

    // Step 1: Create a temporary guest player record
    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        display_name: displayName,
        skill_level,
        preferred_position,
        venue_id,
        sports: ["lawn_bowling"],
        is_available: true,
        role: "player",
        insurance_status: "none",
        years_playing: 0,
        experience_level: skill_level === "beginner" ? "brand_new" : skill_level === "intermediate" ? "social" : "competitive",
        bowling_formats: [],
        onboarding_completed: false,
      })
      .select("*")
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: playerError?.message ?? "Failed to create guest player" },
        { status: 500 }
      );
    }

    // Step 2: Check them in with is_guest=true
    const { data: checkin, error: checkinError } = await supabase
      .from("bowls_checkins")
      .upsert(
        {
          player_id: player.id,
          tournament_id,
          preferred_position,
          checkin_source: "kiosk" as const,
          checked_in_at: new Date().toISOString(),
          is_guest: true,
        },
        { onConflict: "player_id,tournament_id" }
      )
      .select("*, player:players(id, display_name, avatar_url, skill_level)")
      .single();

    if (checkinError) {
      return NextResponse.json(
        { error: checkinError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ player, checkin });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Guest check-in failed" },
      { status: 500 }
    );
  }
}
