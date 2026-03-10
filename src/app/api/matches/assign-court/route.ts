import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assignCourtToMatch, autoAssignCourt } from "@/lib/db/courts";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matchId, courtId } = await request.json();
  if (!matchId) {
    return NextResponse.json(
      { error: "matchId is required" },
      { status: 400 }
    );
  }

  try {
    let match;
    if (courtId) {
      match = await assignCourtToMatch(matchId, courtId);
    } else {
      // Get the match's sport for auto-assignment
      const { data: matchData } = await supabase
        .from("matches")
        .select("sport")
        .eq("id", matchId)
        .single();

      if (!matchData) {
        return NextResponse.json(
          { error: "Match not found" },
          { status: 404 }
        );
      }
      match = await autoAssignCourt(matchId, matchData.sport);
      if (!match) {
        return NextResponse.json(
          { error: "No available courts for this sport" },
          { status: 409 }
        );
      }
    }
    return NextResponse.json({ match });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to assign court" },
      { status: 500 }
    );
  }
}
