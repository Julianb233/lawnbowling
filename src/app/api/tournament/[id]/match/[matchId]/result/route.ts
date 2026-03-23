import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordTournamentResult } from "@/lib/db/tournaments";
import { apiError } from "@/lib/api-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { winner_id, score } = body;

    if (!winner_id) {
      return NextResponse.json({ error: "Winner is required" }, { status: 400 });
    }

    const result = await recordTournamentResult(matchId, winner_id, score || "");
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Report result error:", error);
    return apiError(error, "POST /api/tournament/[id]/match/[matchId]/result", 500);
  }
}
