import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import { assignCourtToMatch, autoAssignCourt } from "@/lib/db/courts";
import { apiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { matchId, courtId } = await request.json();
    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 }
      );
    }

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
    console.error("Assign court error:", error);
    return apiError(error, "matches/assign-court", 500);
  }
}
