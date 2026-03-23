import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMatchHistory } from "@/lib/db/stats";

/**
 * GET /api/match-history
 * Fetch match history for the authenticated user with pagination.
 *
 * Query params:
 *   sport  - filter by sport
 *   page   - 1-based page number (takes precedence over offset)
 *   limit  - page size (default 20, max 100)
 *   offset - pagination offset (default 0)
 */
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
    const limit = Math.min(
      Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)),
      100
    );
    const pageParam = url.searchParams.get("page");
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : null;
    const offset = page
      ? (page - 1) * limit
      : Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10));

    const matches = await getMatchHistory(user.id, { sport, limit, offset });

    const currentPage = Math.floor(offset / limit) + 1;

    return NextResponse.json({
      matches,
      page: currentPage,
      limit,
      offset,
      hasMore: matches.length === limit,
    });
  } catch (error) {
    console.error("Match history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch match history" },
      { status: 500 }
    );
  }
}
