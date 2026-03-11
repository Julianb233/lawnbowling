"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BOWLS_FORMAT_LABELS, BOWLS_POSITION_LABELS } from "@/lib/types";
import type {
  BowlsGameFormat,
  BowlsPosition,
  TournamentScore,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DrawSheetData {
  tournamentName: string;
  format: BowlsGameFormat;
  date: string;
  rounds: RoundDraw[];
  playerStandings: PlayerStanding[];
}

interface RoundDraw {
  round: number;
  scores: TournamentScore[];
}

interface PlayerStanding {
  player_id: string;
  display_name: string;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  total_shots_for: number;
  total_shots_against: number;
  total_ends_won: number;
}

export default function DrawSheetPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const [data, setData] = useState<DrawSheetData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    // Load tournament info
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("name, format, starts_at, created_at")
      .eq("id", tournamentId)
      .single();

    if (!tournament) {
      setLoading(false);
      return;
    }

    // Load all scores
    const { data: scores } = await supabase
      .from("tournament_scores")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("round", { ascending: true })
      .order("rink", { ascending: true });

    // Group by round
    const roundMap = new Map<number, TournamentScore[]>();
    for (const score of (scores ?? []) as TournamentScore[]) {
      const existing = roundMap.get(score.round) ?? [];
      existing.push(score);
      roundMap.set(score.round, existing);
    }

    const rounds: RoundDraw[] = Array.from(roundMap.entries()).map(
      ([round, scores]) => ({ round, scores })
    );

    // Load standings
    let playerStandings: PlayerStanding[] = [];
    try {
      const res = await fetch(
        `/api/bowls/results?tournament_id=${tournamentId}`
      );
      if (res.ok) {
        const results = await res.json();
        playerStandings = results.player_standings ?? [];
      }
    } catch {
      // Non-critical
    }

    setData({
      tournamentName: tournament.name,
      format: tournament.format as BowlsGameFormat,
      date: tournament.starts_at ?? tournament.created_at,
      rounds,
      playerStandings,
    });
    setLoading(false);
  }, [tournamentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-zinc-500">Tournament not found</p>
      </div>
    );
  }

  const formatLabel =
    BOWLS_FORMAT_LABELS[data.format]?.label ?? data.format;
  const dateStr = new Date(data.date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Screen-only toolbar */}
      <div className="no-print sticky top-0 z-50 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href={`/bowls/${tournamentId}`}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Back to Tournament
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">
              Select A4 or Letter in your print dialog
            </span>
            <button
              onClick={() => window.print()}
              className="rounded-lg bg-[#1B5E20] px-4 py-2 text-sm font-bold text-white hover:bg-[#145218]"
            >
              Print Draw Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="mx-auto max-w-4xl px-6 py-8 print:max-w-none print:px-0 print:py-0">
        {/* Header */}
        <div className="mb-6 border-b-2 border-[#1B5E20] pb-4 print:mb-4 print:pb-2">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 print:text-xl">
            {data.tournamentName}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-zinc-600">
            <span>{formatLabel}</span>
            <span className="text-zinc-300">|</span>
            <span>{dateStr}</span>
            <span className="text-zinc-300">|</span>
            <span>
              {data.rounds.length} Round{data.rounds.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Rounds */}
        {data.rounds.map((round) => (
          <div key={round.round} className="mb-8 print:mb-4 print:break-inside-avoid">
            <h2 className="mb-3 text-lg font-bold text-zinc-800 print:text-base print:mb-2">
              Round {round.round}
            </h2>

            <table className="w-full border-collapse text-sm print:text-xs">
              <thead>
                <tr className="border-b-2 border-zinc-300 bg-zinc-50 print:bg-zinc-100">
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Rink
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Team A
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Score
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Team B
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Score
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {round.scores.map((score) => (
                  <tr
                    key={score.id}
                    className="border-b border-zinc-200 print:border-zinc-300"
                  >
                    <td className="px-3 py-2 font-bold text-zinc-700">
                      {score.rink}
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-0.5">
                        {score.team_a_players.map((p) => (
                          <div key={p.player_id} className="text-zinc-800">
                            {p.display_name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-center font-bold tabular-nums",
                        score.winner === "team_a"
                          ? "text-emerald-700"
                          : "text-zinc-600"
                      )}
                    >
                      {score.is_finalized ? score.total_a : "-"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-0.5">
                        {score.team_b_players.map((p) => (
                          <div key={p.player_id} className="text-zinc-800">
                            {p.display_name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-center font-bold tabular-nums",
                        score.winner === "team_b"
                          ? "text-emerald-700"
                          : "text-zinc-600"
                      )}
                    >
                      {score.is_finalized ? score.total_b : "-"}
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-semibold">
                      {score.is_finalized ? (
                        <span
                          className={cn(
                            score.winner === "team_a"
                              ? "text-blue-700"
                              : score.winner === "team_b"
                                ? "text-purple-700"
                                : score.winner === "draw"
                                  ? "text-amber-700"
                                  : "text-zinc-400"
                          )}
                        >
                          {score.winner === "team_a"
                            ? "A wins"
                            : score.winner === "team_b"
                              ? "B wins"
                              : score.winner === "draw"
                                ? "Draw"
                                : "-"}
                        </span>
                      ) : (
                        <span className="text-zinc-400">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* End-by-end for each rink in this round */}
            {round.scores.some(
              (s) => s.is_finalized && s.team_a_scores.length > 0
            ) && (
              <div className="mt-3 space-y-2 print:mt-2">
                {round.scores
                  .filter(
                    (s) => s.is_finalized && s.team_a_scores.length > 0
                  )
                  .map((score) => (
                    <div
                      key={`ends-${score.id}`}
                      className="print:break-inside-avoid"
                    >
                      <p className="mb-1 text-xs font-bold text-zinc-500">
                        Rink {score.rink} &mdash; End-by-End
                      </p>
                      <table className="w-full border-collapse text-xs print:text-[10px]">
                        <thead>
                          <tr className="border-b border-zinc-200">
                            <th className="px-2 py-1 text-left text-[10px] font-bold text-zinc-400 w-12">
                              &nbsp;
                            </th>
                            {score.team_a_scores.map((_, i) => (
                              <th
                                key={i}
                                className="px-1.5 py-1 text-center text-[10px] font-bold text-zinc-400"
                              >
                                {i + 1}
                              </th>
                            ))}
                            <th className="px-2 py-1 text-center text-[10px] font-bold text-zinc-700 border-l border-zinc-300">
                              Tot
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-zinc-100">
                            <td className="px-2 py-1 font-semibold text-blue-600">
                              A
                            </td>
                            {score.team_a_scores.map((s, i) => (
                              <td
                                key={i}
                                className={cn(
                                  "px-1.5 py-1 text-center font-bold tabular-nums",
                                  s > score.team_b_scores[i]
                                    ? "text-emerald-600"
                                    : s === 0
                                      ? "text-zinc-300"
                                      : "text-zinc-500"
                                )}
                              >
                                {s}
                              </td>
                            ))}
                            <td className="px-2 py-1 text-center font-black text-zinc-900 border-l border-zinc-300 tabular-nums">
                              {score.total_a}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 font-semibold text-purple-600">
                              B
                            </td>
                            {score.team_b_scores.map((s, i) => (
                              <td
                                key={i}
                                className={cn(
                                  "px-1.5 py-1 text-center font-bold tabular-nums",
                                  s > score.team_a_scores[i]
                                    ? "text-emerald-600"
                                    : s === 0
                                      ? "text-zinc-300"
                                      : "text-zinc-500"
                                )}
                              >
                                {s}
                              </td>
                            ))}
                            <td className="px-2 py-1 text-center font-black text-zinc-900 border-l border-zinc-300 tabular-nums">
                              {score.total_b}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}

        {/* Player Standings */}
        {data.playerStandings.length > 0 && (
          <div className="mt-8 print:mt-4 print:break-before-auto">
            <h2 className="mb-3 text-lg font-bold text-zinc-800 print:text-base print:mb-2">
              Player Standings
            </h2>
            <table className="w-full border-collapse text-sm print:text-xs">
              <thead>
                <tr className="border-b-2 border-zinc-300 bg-zinc-50 print:bg-zinc-100">
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Player
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    P
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    W
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    L
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    D
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    SF
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    SA
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    +/-
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    EW
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.playerStandings.map((p, idx) => {
                  const diff =
                    p.total_shots_for - p.total_shots_against;
                  return (
                    <tr
                      key={p.player_id}
                      className={cn(
                        "border-b border-zinc-200",
                        idx === 0 && "bg-amber-50 print:bg-amber-50"
                      )}
                    >
                      <td className="px-3 py-2 font-bold text-zinc-400">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 font-semibold text-zinc-900 whitespace-nowrap">
                        {p.display_name}
                      </td>
                      <td className="px-2 py-2 text-center text-zinc-700">
                        {p.games_played}
                      </td>
                      <td className="px-2 py-2 text-center font-bold text-emerald-700">
                        {p.wins}
                      </td>
                      <td className="px-2 py-2 text-center text-red-600">
                        {p.losses}
                      </td>
                      <td className="px-2 py-2 text-center text-amber-600">
                        {p.draws}
                      </td>
                      <td className="px-2 py-2 text-center tabular-nums text-zinc-600">
                        {p.total_shots_for}
                      </td>
                      <td className="px-2 py-2 text-center tabular-nums text-zinc-600">
                        {p.total_shots_against}
                      </td>
                      <td
                        className={cn(
                          "px-2 py-2 text-center font-bold tabular-nums",
                          diff > 0
                            ? "text-emerald-700"
                            : diff < 0
                              ? "text-red-600"
                              : "text-zinc-400"
                        )}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff}
                      </td>
                      <td className="px-2 py-2 text-center tabular-nums text-zinc-600">
                        {p.total_ends_won}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* No data state */}
        {data.rounds.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold text-zinc-400">
              No draw data yet
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Generate a draw and enter scores to see the draw sheet
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-400 print:mt-4 print:pt-2">
          <p>
            {data.tournamentName} &mdash; {formatLabel} &mdash; {dateStr}
          </p>
          <p className="mt-0.5">
            Generated by Pick a Partner &mdash; lawnbowling.app
          </p>
        </div>
      </div>
    </div>
  );
}
