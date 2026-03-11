import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { ResultsCardTemplate } from "@/components/bowls/ResultsCardTemplate";
import { BOWLS_FORMAT_LABELS } from "@/lib/types";
import type { BowlsGameFormat } from "@/lib/types";

export const runtime = "edge";

// Public Supabase client (no auth needed for share cards)
function getPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  const { tournamentId } = await params;

  try {
    const supabase = getPublicSupabase();

    // Fetch tournament details
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("id, name, format, status, created_at, club_id")
      .eq("id", tournamentId)
      .single();

    if (!tournament) {
      return new Response("Tournament not found", { status: 404 });
    }

    // Fetch club info if available
    let clubName: string | undefined;
    let accentColor: string | undefined;
    if (tournament.club_id) {
      const { data: club } = await supabase
        .from("clubs")
        .select("name, primary_color")
        .eq("id", tournament.club_id)
        .single();
      if (club) {
        clubName = club.name;
        if (club.primary_color) accentColor = club.primary_color;
      }
    }

    // Fetch scores and calculate standings inline (can't call internal API from edge)
    const { data: scores } = await supabase
      .from("tournament_scores")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("round", { ascending: true });

    const allScores = scores ?? [];
    const totalRounds = allScores.length > 0
      ? Math.max(...allScores.map((s: { round: number }) => s.round))
      : 0;

    // Build player standings
    const playerStats = new Map<
      string,
      {
        display_name: string;
        wins: number;
        losses: number;
        draws: number;
        shots_for: number;
        shots_against: number;
      }
    >();

    for (const score of allScores) {
      if (!score.is_finalized) continue;

      // Team A players
      if (score.team_a_players) {
        for (const p of score.team_a_players as { player_id: string; display_name: string }[]) {
          const existing = playerStats.get(p.player_id) ?? {
            display_name: p.display_name,
            wins: 0, losses: 0, draws: 0, shots_for: 0, shots_against: 0,
          };
          existing.shots_for += score.total_a;
          existing.shots_against += score.total_b;
          if (score.winner === "team_a") existing.wins++;
          else if (score.winner === "team_b") existing.losses++;
          else if (score.winner === "draw") existing.draws++;
          playerStats.set(p.player_id, existing);
        }
      }

      // Team B players
      if (score.team_b_players) {
        for (const p of score.team_b_players as { player_id: string; display_name: string }[]) {
          const existing = playerStats.get(p.player_id) ?? {
            display_name: p.display_name,
            wins: 0, losses: 0, draws: 0, shots_for: 0, shots_against: 0,
          };
          existing.shots_for += score.total_b;
          existing.shots_against += score.total_a;
          if (score.winner === "team_b") existing.wins++;
          else if (score.winner === "team_a") existing.losses++;
          else if (score.winner === "draw") existing.draws++;
          playerStats.set(p.player_id, existing);
        }
      }
    }

    // Sort: wins desc, shot diff desc
    const standings = Array.from(playerStats.values()).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (b.shots_for - b.shots_against) - (a.shots_for - a.shots_against);
    });

    const topPlayers = standings.slice(0, 5).map((p) => ({
      display_name: p.display_name,
      wins: p.wins,
      losses: p.losses,
      draws: p.draws,
      shot_diff: p.shots_for - p.shots_against,
    }));

    const formatLabel =
      BOWLS_FORMAT_LABELS[tournament.format as BowlsGameFormat]?.label ??
      tournament.format;

    const date = new Date(tournament.created_at).toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return new ImageResponse(
      ResultsCardTemplate({
        tournamentName: tournament.name,
        date,
        format: formatLabel,
        clubName,
        accentColor,
        topPlayers,
        totalRounds,
        totalPlayers: standings.length,
      }),
      {
        width: 1080,
        height: 1080,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }
    );
  } catch (err) {
    console.error("Share card generation error:", err);
    return new Response("Failed to generate share card", { status: 500 });
  }
}
