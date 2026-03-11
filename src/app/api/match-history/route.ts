import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMatchHistory } from "@/lib/db/stats";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const sport = url.searchParams.get("sport") ?? undefined;
    const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

    const matches = await getMatchHistory(user.id, { sport, limit, offset });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Match history error:", error);
    return NextResponse.json({ error: "Failed to fetch match history" }, { status: 500 });
  }
}
