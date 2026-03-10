import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportMatchResult } from "@/lib/db/stats";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: matchId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { winner_team, team1_score, team2_score } = body;

    const result = await reportMatchResult({
      match_id: matchId,
      winner_team: winner_team ?? null,
      team1_score: team1_score ?? null,
      team2_score: team2_score ?? null,
      reported_by: user.id,
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error("Report result error:", error);
    return NextResponse.json({ error: "Failed to report result" }, { status: 500 });
  }
}
