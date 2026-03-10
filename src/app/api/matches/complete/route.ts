import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeMatch } from "@/lib/db/courts";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matchId } = await request.json();
  if (!matchId) {
    return NextResponse.json(
      { error: "matchId is required" },
      { status: 400 }
    );
  }

  try {
    const match = await completeMatch(matchId);
    return NextResponse.json({ match });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete match" },
      { status: 500 }
    );
  }
}
