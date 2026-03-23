import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTournament } from "@/lib/db/tournaments";
import { logger } from "@/lib/logger";
import { validateBody, isValidationError } from "@/lib/schemas/validate";
import { tournamentCreateSchema } from "@/lib/schemas";

/**
 * GET /api/tournament
 * List tournaments with pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") ?? "20")),
      100
    );
    const pageParam = searchParams.get("page");
    const page = pageParam ? Math.max(1, parseInt(pageParam)) : null;
    const offset = page
      ? (page - 1) * limit
      : Math.max(0, parseInt(searchParams.get("offset") ?? "0"));
    const status = searchParams.get("status");
    const venueId = searchParams.get("venue_id");

    let query = supabase
      .from("tournaments")
      .select(
        "*, creator:players!tournaments_created_by_fkey(id, display_name, avatar_url), tournament_participants(count)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }
    if (venueId) {
      query = query.eq("venue_id", venueId);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error("List tournaments query error", { error });
      return NextResponse.json(
        { error: "Failed to fetch tournaments" },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return NextResponse.json({
      tournaments: data ?? [],
      total,
      page: currentPage,
      limit,
      offset,
      totalPages,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    logger.error("Get tournaments error", { route: "tournament", error });
    return NextResponse.json(
      { error: "Failed to fetch tournaments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id, venue_id")
      .eq("user_id", user.id)
      .single();

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    const result = await validateBody(request, tournamentCreateSchema);
    if (isValidationError(result)) return result;

    const tournament = await createTournament({
      name: result.name,
      sport: result.sport,
      format: result.format,
      max_players: result.max_players || 16,
      created_by: player.id,
      venue_id: player.venue_id ?? undefined,
      starts_at: result.starts_at || undefined,
    });

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error) {
    logger.error("Create tournament error", { route: "tournament", error });
    return NextResponse.json(
      { error: "Failed to create tournament" },
      { status: 500 }
    );
  }
}
