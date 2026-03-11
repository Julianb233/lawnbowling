import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { forfeitMatch } from "@/lib/db/tournaments";

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
    const { forfeiting_player_id } = body;
    if (!forfeiting_player_id) {
      return NextResponse.json({ error: "forfeiting_player_id is required" }, { status: 400 });
    }
    const result = await forfeitMatch(matchId, forfeiting_player_id);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process forfeit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
