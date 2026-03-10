import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBowlsDraw } from "@/lib/bowls-draw";
import type { BowlsCheckin, BowlsGameFormat } from "@/lib/types";

/**
 * POST /api/bowls/draw
 * Generate a tournament draw from checked-in players.
 * Body: { tournament_id: string, format: BowlsGameFormat }
 */
export async function POST(req: NextRequest) {
  try {
    const { tournament_id, format } = (await req.json()) as {
      tournament_id: string;
      format: BowlsGameFormat;
    };

    if (!tournament_id || !format) {
      return NextResponse.json({ error: "tournament_id and format required" }, { status: 400 });
    }

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

    const draw = generateBowlsDraw(checkins as BowlsCheckin[], format);

    return NextResponse.json(draw);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Draw generation failed" },
      { status: 500 }
    );
  }
}
