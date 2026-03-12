import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

// ── ELO Calculation (mirrored from src/lib/elo.ts) ──────────────────
const K_FACTOR = 32;

function calculateElo(
  winnerRating: number,
  loserRating: number
): { newWinnerRating: number; newLoserRating: number } {
  const expectedWinner =
    1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser =
    1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  const newWinnerRating =
    Math.round((winnerRating + K_FACTOR * (1 - expectedWinner)) * 100) / 100;
  const newLoserRating =
    Math.round((loserRating + K_FACTOR * (0 - expectedLoser)) * 100) / 100;

  return { newWinnerRating, newLoserRating };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();
    const body = await req.json();
    const { match_id } = body as { match_id: string };

    if (!match_id) {
      return new Response(
        JSON.stringify({ error: "match_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 1. Fetch the match ───────────────────────────────────────────
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", match_id)
      .single();

    if (matchError || !match) {
      return new Response(
        JSON.stringify({ error: "Match not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Mark match as completed ───────────────────────────────────
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("matches")
      .update({ status: "completed", ended_at: now })
      .eq("id", match_id);

    if (updateError) {
      throw new Error(`Failed to complete match: ${updateError.message}`);
    }

    // ── 3. Fetch match players and their scores ──────────────────────
    const { data: matchPlayers } = await supabase
      .from("match_players")
      .select("player_id, team, score")
      .eq("match_id", match_id);

    if (!matchPlayers || matchPlayers.length === 0) {
      return new Response(
        JSON.stringify({ match, players_updated: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 4. Determine winners / losers (by team score if available) ───
    // Group players by team
    const teamA = matchPlayers.filter((p) => p.team === "a" || p.team === "A");
    const teamB = matchPlayers.filter((p) => p.team === "b" || p.team === "B");

    // Sum team scores if present
    const scoreA = teamA.reduce((sum, p) => sum + (p.score ?? 0), 0);
    const scoreB = teamB.reduce((sum, p) => sum + (p.score ?? 0), 0);

    const winnerTeam = scoreA >= scoreB ? teamA : teamB;
    const loserTeam = scoreA >= scoreB ? teamB : teamA;
    const isDraw = scoreA === scoreB;

    const winnerIds = new Set(winnerTeam.map((p) => p.player_id));
    const loserIds = new Set(loserTeam.map((p) => p.player_id));

    // ── 5. Update player_stats and ELO for each player ───────────────
    // Compute average ELO per team for the ELO update
    const allPlayerIds = matchPlayers.map((p) => p.player_id);
    const { data: existingStats } = await supabase
      .from("player_stats")
      .select("*")
      .in("player_id", allPlayerIds);

    const statsMap = new Map<string, Record<string, unknown>>();
    if (existingStats) {
      for (const s of existingStats) {
        statsMap.set(s.player_id, s);
      }
    }

    const avgElo = (playerIds: Set<string>) => {
      let total = 0;
      let count = 0;
      for (const pid of playerIds) {
        const s = statsMap.get(pid);
        total += (s?.elo_rating as number) ?? 1200;
        count++;
      }
      return count > 0 ? total / count : 1200;
    };

    const winnerAvgElo = avgElo(winnerIds);
    const loserAvgElo = avgElo(loserIds);

    const { newWinnerRating, newLoserRating } = isDraw
      ? { newWinnerRating: winnerAvgElo, newLoserRating: loserAvgElo }
      : calculateElo(winnerAvgElo, loserAvgElo);

    // Per-player ELO delta (proportional to team delta)
    const winnerDelta = newWinnerRating - winnerAvgElo;
    const loserDelta = newLoserRating - loserAvgElo;

    let playersUpdated = 0;

    for (const mp of matchPlayers) {
      const existing = statsMap.get(mp.player_id);
      const isWinner = winnerIds.has(mp.player_id);
      const currentElo = (existing?.elo_rating as number) ?? 1200;
      const eloDelta = isDraw ? 0 : isWinner ? winnerDelta : loserDelta;

      if (existing) {
        const gamesPlayed = ((existing.games_played as number) ?? 0) + 1;
        const wins =
          ((existing.wins as number) ?? 0) + (isWinner && !isDraw ? 1 : 0);
        const losses =
          ((existing.losses as number) ?? 0) + (!isWinner && !isDraw ? 1 : 0);

        await supabase
          .from("player_stats")
          .update({
            games_played: gamesPlayed,
            wins,
            losses,
            win_rate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) / 100 : 0,
            elo_rating: Math.round((currentElo + eloDelta) * 100) / 100,
            last_played_at: now,
            updated_at: now,
          })
          .eq("player_id", mp.player_id);
      } else {
        await supabase.from("player_stats").insert({
          player_id: mp.player_id,
          games_played: 1,
          wins: isWinner && !isDraw ? 1 : 0,
          losses: !isWinner && !isDraw ? 1 : 0,
          win_rate: isWinner && !isDraw ? 1 : 0,
          elo_rating: Math.round((1200 + eloDelta) * 100) / 100,
          favorite_sport: match.sport ?? "lawn_bowls",
          last_played_at: now,
        });
      }
      playersUpdated++;
    }

    // ── 6. Free the court ────────────────────────────────────────────
    if (match.court_id) {
      await supabase
        .from("courts")
        .update({ is_available: true })
        .eq("id", match.court_id);

      // Auto-assign next queued match to the freed court
      const { data: court } = await supabase
        .from("courts")
        .select("sport")
        .eq("id", match.court_id)
        .single();

      if (court) {
        const { data: nextMatch } = await supabase
          .from("matches")
          .select("id")
          .eq("status", "queued")
          .eq("sport", court.sport)
          .is("court_id", null)
          .order("created_at", { ascending: true })
          .limit(1)
          .single();

        if (nextMatch) {
          await supabase
            .from("matches")
            .update({
              court_id: match.court_id,
              status: "playing",
              started_at: now,
            })
            .eq("id", nextMatch.id)
            .eq("status", "queued");

          await supabase
            .from("courts")
            .update({ is_available: false })
            .eq("id", match.court_id);
        }
      }
    }

    // ── 7. Create activity feed entry ────────────────────────────────
    const playerNames: string[] = [];
    for (const mp of matchPlayers) {
      const { data: player } = await supabase
        .from("players")
        .select("display_name")
        .eq("id", mp.player_id)
        .single();
      if (player?.display_name) {
        playerNames.push(player.display_name);
      }
    }

    await supabase.from("activity_feed").insert({
      venue_id: match.venue_id ?? null,
      type: "match_completed",
      metadata: {
        match_id,
        sport: match.sport,
        players: playerNames,
        score_a: scoreA,
        score_b: scoreB,
        is_draw: isDraw,
      },
    });

    console.log(
      `Match ${match_id} completed: ${playersUpdated} players updated, score ${scoreA}-${scoreB}`
    );

    return new Response(
      JSON.stringify({
        match: { ...match, status: "completed", ended_at: now },
        players_updated: playersUpdated,
        score: { team_a: scoreA, team_b: scoreB, is_draw: isDraw },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Match complete error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to complete match",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
