import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import { completeMatch } from "@/lib/db/courts";

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

    const { matchId } = await request.json();
    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 }
      );
    }

    const match = await completeMatch(matchId);
    return NextResponse.json({ match });
  } catch (error) {
    console.error("Complete match error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete match" },
      { status: 500 }
    );
  }
}
