"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { cn } from "@/lib/utils";
import type { TournamentScore } from "@/lib/types";

interface RinkScoreEntry {
  rink: number;
  teamAScores: number[];
  teamBScores: number[];
  teamAPlayers: { player_id: string; display_name: string }[];
  teamBPlayers: { player_id: string; display_name: string }[];
  isFinalized: boolean;
  id?: string;
}

export default function ScoreEntryPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournamentName, setTournamentName] = useState("Tournament");
  const [round, setRound] = useState(1);
  const [rinkScores, setRinkScores] = useState<RinkScoreEntry[]>([]);
  const [activeRink, setActiveRink] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [allFinalized, setAllFinalized] = useState(false);

  const loadTournament = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tournaments")
      .select("name")
      .eq("id", tournamentId)
      .single();
    if (data) setTournamentName(data.name);
  }, [tournamentId]);

  const loadScores = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/bowls/scores?tournament_id=${tournamentId}&round=${round}`
      );
      if (res.ok) {
        const data: TournamentScore[] = await res.json();
        if (data.length > 0) {
          const entries: RinkScoreEntry[] = data.map((s) => ({
            rink: s.rink,
            teamAScores: s.team_a_scores,
            teamBScores: s.team_b_scores,
            teamAPlayers: s.team_a_players,
            teamBPlayers: s.team_b_players,
            isFinalized: s.is_finalized,
            id: s.id,
          }));
          setRinkScores(entries);
          setAllFinalized(entries.every((e) => e.isFinalized));
        } else {
          // Initialize empty rinks from draw data if no scores yet
          await initializeFromDraw();
        }
      }
    } catch {
      // Will retry
    }
    setLoading(false);
  }, [tournamentId, round]);

  const initializeFromDraw = useCallback(async () => {
    // Try to get draw info from the bowls_checkins / draw
    // For now, create placeholder rinks that can be populated
    const supabase = createClient();
    const { count } = await supabase
      .from("bowls_checkins")
      .select("id", { count: "exact", head: true })
      .eq("tournament_id", tournamentId);

    // Estimate rink count from checked-in players (assume fours by default)
    const playerCount = count ?? 0;
    const estimatedRinks = Math.max(1, Math.floor(playerCount / 8));

    const entries: RinkScoreEntry[] = [];
    for (let i = 1; i <= estimatedRinks; i++) {
      entries.push({
        rink: i,
        teamAScores: [],
        teamBScores: [],
        teamAPlayers: [],
        teamBPlayers: [],
        isFinalized: false,
      });
    }
    setRinkScores(entries);
  }, [tournamentId]);

  // Subscribe to realtime updates on tournament_scores
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`scores-${tournamentId}-${round}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_scores",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          // Reload scores when changes detected
          loadScores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, round, loadScores]);

  useEffect(() => {
    loadTournament();
    loadScores();
  }, [loadTournament, loadScores]);

  function addEnd(rinkIndex: number) {
    setRinkScores((prev) => {
      const updated = [...prev];
      const entry = { ...updated[rinkIndex] };
      entry.teamAScores = [...entry.teamAScores, 0];
      entry.teamBScores = [...entry.teamBScores, 0];
      updated[rinkIndex] = entry;
      return updated;
    });
  }

  function removeEnd(rinkIndex: number) {
    setRinkScores((prev) => {
      const updated = [...prev];
      const entry = { ...updated[rinkIndex] };
      if (entry.teamAScores.length === 0) return prev;
      entry.teamAScores = entry.teamAScores.slice(0, -1);
      entry.teamBScores = entry.teamBScores.slice(0, -1);
      updated[rinkIndex] = entry;
      return updated;
    });
  }

  function updateEndScore(
    rinkIndex: number,
    team: "a" | "b",
    endIndex: number,
    value: number
  ) {
    setRinkScores((prev) => {
      const updated = [...prev];
      const entry = { ...updated[rinkIndex] };
      if (team === "a") {
        const scores = [...entry.teamAScores];
        scores[endIndex] = value;
        entry.teamAScores = scores;
        // In lawn bowls, only one team scores per end
        // If team A scores, team B gets 0 for that end
        if (value > 0) {
          const bScores = [...entry.teamBScores];
          bScores[endIndex] = 0;
          entry.teamBScores = bScores;
        }
      } else {
        const scores = [...entry.teamBScores];
        scores[endIndex] = value;
        entry.teamBScores = scores;
        if (value > 0) {
          const aScores = [...entry.teamAScores];
          aScores[endIndex] = 0;
          entry.teamAScores = aScores;
        }
      }
      updated[rinkIndex] = entry;
      return updated;
    });
  }

  async function saveRinkScore(rinkIndex: number) {
    const entry = rinkScores[rinkIndex];
    setSaving(true);

    try {
      await fetch("/api/bowls/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          round,
          rink: entry.rink,
          team_a_players: entry.teamAPlayers,
          team_b_players: entry.teamBPlayers,
          team_a_scores: entry.teamAScores,
          team_b_scores: entry.teamBScores,
        }),
      });
    } catch {
      // Handle error
    }
    setSaving(false);
  }

  async function finalizeRound() {
    setFinalizing(true);
    try {
      // Save all unsaved scores first
      for (let i = 0; i < rinkScores.length; i++) {
        if (!rinkScores[i].isFinalized) {
          await saveRinkScore(i);
        }
      }

      // Then finalize the round
      await fetch("/api/bowls/scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          round,
        }),
      });

      await loadScores();
    } catch {
      // Handle error
    }
    setFinalizing(false);
  }

  function addRink() {
    const maxRink = rinkScores.reduce((max, r) => Math.max(max, r.rink), 0);
    setRinkScores((prev) => [
      ...prev,
      {
        rink: maxRink + 1,
        teamAScores: [],
        teamBScores: [],
        teamAPlayers: [],
        teamBPlayers: [],
        isFinalized: false,
      },
    ]);
  }

  function getTotal(scores: number[]): number {
    return scores.reduce((sum, s) => sum + s, 0);
  }

  function getEndsWon(scoresA: number[], scoresB: number[]): [number, number] {
    let wonA = 0;
    let wonB = 0;
    const ends = Math.min(scoresA.length, scoresB.length);
    for (let i = 0; i < ends; i++) {
      if (scoresA[i] > scoresB[i]) wonA++;
      else if (scoresB[i] > scoresA[i]) wonB++;
    }
    return [wonA, wonB];
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                Score Entry
              </h1>
              <p className="text-sm text-zinc-500">
                {tournamentName} &middot; Round {round}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/bowls/${tournamentId}`)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 min-h-[44px] touch-manipulation"
              >
                Back
              </button>
              <button
                onClick={() => router.push(`/bowls/${tournamentId}/results`)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 min-h-[44px] touch-manipulation"
              >
                Results
              </button>
            </div>
          </div>

          {/* Round selector */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-500">Round:</span>
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRound(r);
                  setActiveRink(null);
                  setLoading(true);
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors touch-manipulation",
                  round === r
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Rink grid overview */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {rinkScores.map((entry, idx) => {
            const totalA = getTotal(entry.teamAScores);
            const totalB = getTotal(entry.teamBScores);
            const hasScores = entry.teamAScores.length > 0;
            const isActive = activeRink === idx;

            return (
              <motion.button
                key={entry.rink}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveRink(isActive ? null : idx)}
                className={cn(
                  "relative rounded-2xl p-4 text-left transition-all min-h-[120px] touch-manipulation",
                  entry.isFinalized
                    ? "bg-emerald-50 border-2 border-emerald-200"
                    : isActive
                      ? "bg-blue-50 border-2 border-blue-400 shadow-lg"
                      : "bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Rink {entry.rink}
                  </span>
                  {entry.isFinalized && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Final
                    </span>
                  )}
                </div>

                {hasScores ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-600">
                        Team A
                      </span>
                      <span
                        className={cn(
                          "text-2xl font-black tabular-nums",
                          totalA > totalB
                            ? "text-emerald-600"
                            : totalA < totalB
                              ? "text-zinc-400"
                              : "text-zinc-700"
                        )}
                      >
                        {totalA}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-600">
                        Team B
                      </span>
                      <span
                        className={cn(
                          "text-2xl font-black tabular-nums",
                          totalB > totalA
                            ? "text-emerald-600"
                            : totalB < totalA
                              ? "text-zinc-400"
                              : "text-zinc-700"
                        )}
                      >
                        {totalB}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      {entry.teamAScores.length} end
                      {entry.teamAScores.length !== 1 ? "s" : ""} played
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 mt-2">
                    Tap to enter scores
                  </p>
                )}
              </motion.button>
            );
          })}

          {/* Add rink button */}
          {!allFinalized && (
            <button
              onClick={addRink}
              className="flex min-h-[120px] items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-500 transition-colors touch-manipulation"
            >
              <span className="text-3xl font-light">+</span>
            </button>
          )}
        </div>

        {/* Active rink score entry */}
        <AnimatePresence mode="wait">
          {activeRink !== null && rinkScores[activeRink] && (
            <motion.div
              key={`rink-${activeRink}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl bg-white border border-zinc-200 shadow-xl overflow-hidden"
            >
              <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-zinc-900">
                    Rink {rinkScores[activeRink].rink} - End by End
                  </h2>
                  <div className="flex items-center gap-2">
                    {!rinkScores[activeRink].isFinalized && (
                      <>
                        <button
                          onClick={() => removeEnd(activeRink)}
                          disabled={
                            rinkScores[activeRink].teamAScores.length === 0
                          }
                          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 min-h-[44px] touch-manipulation"
                        >
                          - End
                        </button>
                        <button
                          onClick={() => addEnd(activeRink)}
                          className="rounded-xl bg-blue-500 px-3 py-2 text-sm font-bold text-white hover:bg-blue-600 min-h-[44px] touch-manipulation"
                        >
                          + End
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setActiveRink(null)}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 min-h-[44px] touch-manipulation"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {rinkScores[activeRink].teamAScores.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-lg font-semibold text-zinc-400">
                      No ends recorded yet
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Tap &quot;+ End&quot; to start scoring
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                            &nbsp;
                          </th>
                          {rinkScores[activeRink].teamAScores.map((_, i) => (
                            <th
                              key={i}
                              className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-400 min-w-[56px]"
                            >
                              E{i + 1}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-700 border-l border-zinc-200">
                            Total
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-700">
                            Ends
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Team A row */}
                        <tr className="border-t border-zinc-100">
                          <td className="px-3 py-3 text-sm font-bold text-blue-600 whitespace-nowrap">
                            Team A
                          </td>
                          {rinkScores[activeRink].teamAScores.map(
                            (score, endIdx) => (
                              <td key={endIdx} className="px-1 py-2">
                                <ScoreInput
                                  value={score}
                                  onChange={(v) =>
                                    updateEndScore(activeRink, "a", endIdx, v)
                                  }
                                  disabled={
                                    rinkScores[activeRink].isFinalized
                                  }
                                  isWinning={
                                    score >
                                    rinkScores[activeRink].teamBScores[endIdx]
                                  }
                                />
                              </td>
                            )
                          )}
                          <td className="px-3 py-3 text-center border-l border-zinc-200">
                            <span className="text-xl font-black text-zinc-900 tabular-nums">
                              {getTotal(rinkScores[activeRink].teamAScores)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="text-lg font-bold text-zinc-600 tabular-nums">
                              {
                                getEndsWon(
                                  rinkScores[activeRink].teamAScores,
                                  rinkScores[activeRink].teamBScores
                                )[0]
                              }
                            </span>
                          </td>
                        </tr>

                        {/* Team B row */}
                        <tr className="border-t border-zinc-100">
                          <td className="px-3 py-3 text-sm font-bold text-purple-600 whitespace-nowrap">
                            Team B
                          </td>
                          {rinkScores[activeRink].teamBScores.map(
                            (score, endIdx) => (
                              <td key={endIdx} className="px-1 py-2">
                                <ScoreInput
                                  value={score}
                                  onChange={(v) =>
                                    updateEndScore(activeRink, "b", endIdx, v)
                                  }
                                  disabled={
                                    rinkScores[activeRink].isFinalized
                                  }
                                  isWinning={
                                    score >
                                    rinkScores[activeRink].teamAScores[endIdx]
                                  }
                                />
                              </td>
                            )
                          )}
                          <td className="px-3 py-3 text-center border-l border-zinc-200">
                            <span className="text-xl font-black text-zinc-900 tabular-nums">
                              {getTotal(rinkScores[activeRink].teamBScores)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="text-lg font-bold text-zinc-600 tabular-nums">
                              {
                                getEndsWon(
                                  rinkScores[activeRink].teamAScores,
                                  rinkScores[activeRink].teamBScores
                                )[1]
                              }
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Save button for this rink */}
                {!rinkScores[activeRink].isFinalized &&
                  rinkScores[activeRink].teamAScores.length > 0 && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => saveRinkScore(activeRink)}
                        disabled={saving}
                        className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50 min-h-[48px] touch-manipulation"
                      >
                        {saving ? "Saving..." : "Save Rink Score"}
                      </button>
                    </div>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Finalize Round */}
        {rinkScores.length > 0 && !allFinalized && (
          <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-amber-800">
                  Finalize Round {round}
                </h3>
                <p className="text-sm text-amber-600 mt-1">
                  Lock all scores for this round. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={finalizeRound}
                disabled={finalizing}
                className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50 min-h-[48px] touch-manipulation"
              >
                {finalizing ? "Finalizing..." : "Finalize Round"}
              </button>
            </div>
          </div>
        )}

        {allFinalized && (
          <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
            <p className="text-lg font-bold text-emerald-800">
              Round {round} is finalized
            </p>
            <p className="text-sm text-emerald-600 mt-1">
              All scores have been locked.
            </p>
            <button
              onClick={() => router.push(`/bowls/${tournamentId}/results`)}
              className="mt-4 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600 min-h-[48px] touch-manipulation"
            >
              View Results
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

/**
 * ScoreInput - Large touch-friendly number input for end scores.
 * Uses increment/decrement buttons for iPad kiosk mode.
 */
function ScoreInput({
  value,
  onChange,
  disabled,
  isWinning,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  isWinning: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {!disabled && (
        <button
          onClick={() => onChange(Math.min(value + 1, 9))}
          className="flex h-8 w-12 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 active:bg-zinc-300 touch-manipulation"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black tabular-nums transition-colors",
          disabled
            ? "bg-zinc-50 text-zinc-400"
            : isWinning
              ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300"
              : value === 0
                ? "bg-zinc-50 text-zinc-300"
                : "bg-blue-50 text-blue-700"
        )}
      >
        {value}
      </div>
      {!disabled && (
        <button
          onClick={() => onChange(Math.max(value - 1, 0))}
          className="flex h-8 w-12 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 active:bg-zinc-300 touch-manipulation"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
