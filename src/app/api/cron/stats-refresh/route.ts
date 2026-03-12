import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/auth/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/cron/stats-refresh
 *
 * Recalculate player_stats from matches, match_results, and match_players
 * for players active in the last 30 days. Runs daily at 3am UTC.
 */
function verifyCronAuth(request: NextRequest): boolean {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return false;
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  if (bearer === expectedSecret) return true;
  const cronSecret = request.headers.get("x-cron-secret");
  return cronSecret === expectedSecret;
}

export async function GET(request: NextRequest) {
  return handleRefresh(request);
}

export async function POST(request: NextRequest) {
  return handleRefresh(request);
}

async function handleRefresh(request: NextRequest) {
  try {
    const expectedSecret = process.env.CRON_SECRET;

    if (!verifyCronAuth(request)) {
      const supabase = await createServerClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!(await isAdmin(user.id))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find active players: those with completed matches in the last 30 days
    const { data: recentMatchPlayers, error: mpError } = await supabase
      .from("match_players")
      .select("player_id, match_id, team")
      .in(
        "match_id",
        // Subquery: get match IDs completed in last 30 days
        (
          await supabase
            .from("matches")
            .select("id")
            .eq("status", "completed")
            .gte("ended_at", thirtyDaysAgo.toISOString())
        ).data?.map((m) => m.id) ?? []
      );

    if (mpError) {
      console.error("Failed to fetch recent match players:", mpError);
      return NextResponse.json(
        { error: "Failed to fetch match data" },
        { status: 500 }
      );
    }

    // Get unique active player IDs
    const activePlayerIds = [
      ...new Set(recentMatchPlayers?.map((mp) => mp.player_id) ?? []),
    ];

    if (activePlayerIds.length === 0) {
      return NextResponse.json({ updated: 0, message: "No active players" });
    }

    let updatedCount = 0;

    for (const playerId of activePlayerIds) {
      // Get ALL match_players for this player (not just recent)
      const { data: allPlayerMatches } = await supabase
        .from("match_players")
        .select("match_id, team")
        .eq("player_id", playerId);

      if (!allPlayerMatches?.length) continue;

      const matchIds = allPlayerMatches.map((mp) => mp.match_id);

      // Get completed matches with results
      const { data: completedMatches } = await supabase
        .from("matches")
        .select("id, sport, ended_at")
        .in("id", matchIds)
        .eq("status", "completed");

      if (!completedMatches?.length) continue;

      const completedMatchIds = completedMatches.map((m) => m.id);

      // Get match results for these matches
      const { data: results } = await supabase
        .from("match_results")
        .select("match_id, winner_team")
        .in("match_id", completedMatchIds);

      // Build team lookup for this player
      const teamByMatch = new Map(
        allPlayerMatches.map((mp) => [mp.match_id, mp.team])
      );

      let wins = 0;
      let losses = 0;
      const gamesPlayed = completedMatchIds.length;

      for (const result of results ?? []) {
        const playerTeam = teamByMatch.get(result.match_id);
        if (result.winner_team !== null && playerTeam !== null) {
          if (playerTeam === result.winner_team) {
            wins++;
          } else {
            losses++;
          }
        }
      }

      const winRate =
        gamesPlayed > 0
          ? Math.round((wins / gamesPlayed) * 100 * 100) / 100
          : 0;

      // Determine favorite sport
      const sportCounts = new Map<string, number>();
      for (const m of completedMatches) {
        sportCounts.set(m.sport, (sportCounts.get(m.sport) ?? 0) + 1);
      }
      const favoriteSport = [...sportCounts.entries()].sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] ?? null;

      // Find last played date
      const lastPlayed = completedMatches
        .filter((m) => m.ended_at)
        .sort(
          (a, b) =>
            new Date(b.ended_at!).getTime() - new Date(a.ended_at!).getTime()
        )[0]?.ended_at ?? null;

      // Upsert player_stats
      const { error: upsertError } = await supabase
        .from("player_stats")
        .upsert(
          {
            player_id: playerId,
            games_played: gamesPlayed,
            wins,
            losses,
            win_rate: winRate,
            favorite_sport: favoriteSport,
            last_played_at: lastPlayed,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "player_id" }
        );

      if (upsertError) {
        console.error(
          `Failed to upsert stats for player ${playerId}:`,
          upsertError
        );
        continue;
      }

      updatedCount++;
    }

    return NextResponse.json({ updated: updatedCount });
  } catch (error) {
    console.error("Cron stats-refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh player stats" },
      { status: 500 }
    );
  }
}
