import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateBowlsDraw,
  generateMultiRoundDraw,
  validateDrawCompatibility,
  DrawCompatibilityError,
} from "@/lib/bowls-draw";
import type { DrawStyle } from "@/lib/bowls-draw";
import type { BowlsCheckin, BowlsGameFormat } from "@/lib/types";

/**
 * POST /api/bowls/draw
 * Generate a tournament draw from checked-in players.
 * Body: { tournament_id: string, format: BowlsGameFormat, draw_style?: DrawStyle }
 */
export async function POST(req: NextRequest) {
  try {
    const { tournament_id, format, draw_style } = (await req.json()) as {
      tournament_id: string;
      format: BowlsGameFormat;
      draw_style?: DrawStyle;
    };

    if (!tournament_id || !format) {
      return NextResponse.json({ error: "tournament_id and format required" }, { status: 400 });
    }

    const style: DrawStyle = draw_style ?? "random";

    const supabase = await createClient();

    // Get all checked-in players for this tournament
    const { data: checkins, error } = await supabase
      .from("bowls_checkins")
      .select("*, player:players(id, display_name, avatar_url, skill_level)")
      .eq("tournament_id", tournament_id)
      .order("checked_in_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const playerCount = checkins?.length ?? 0;

    // For mead/gavel, validate player count compatibility first
    if (style === "mead" || style === "gavel") {
      const validation = validateDrawCompatibility(playerCount, format, style);
      if (!validation.compatible) {
        return NextResponse.json(
          {
            error: "incompatible_player_count",
            player_count: playerCount,
            min: validation.min,
            max: validation.max,
            supported_counts: validation.supported_counts,
          },
          { status: 400 }
        );
      }
    }

    // Generate multi-round draw for mead/gavel, single-round for random/seeded
    if (style === "mead" || style === "gavel") {
      const multiDraw = generateMultiRoundDraw(checkins as BowlsCheckin[], format, style);
      return NextResponse.json(multiDraw);
    }

    // Legacy single-round draw for backward compatibility
    const draw = generateBowlsDraw(checkins as BowlsCheckin[], format);
    return NextResponse.json(draw);
  } catch (err) {
    if (err instanceof DrawCompatibilityError) {
      return NextResponse.json(
        {
          error: "incompatible_player_count",
          min: err.min,
          max: err.max,
          supported_counts: err.supported_counts,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Draw generation failed" },
      { status: 500 }
    );
  }
}
