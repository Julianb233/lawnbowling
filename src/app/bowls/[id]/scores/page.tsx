"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { cn } from "@/lib/utils";
import { NumberFlip, EndPulse, MatchWon, MatchPoint } from "@/components/animations";
import type { TournamentScore } from "@/lib/types";

interface RinkScoreEntry {
  rink: number;
  teamAScores: number[];
  teamBScores: number[];
  teamAPlayers: { player_id: string; display_name: string }[];
  teamBPlayers: { player_id: string; display_name: string }[];
  isFinalized: boolean;
  id?: string;
  updatedAt?: string;
  dirty?: boolean;
}

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;

export default function ScoreEntryPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = (params?.id ?? "") as string;

  const [tournamentName, setTournamentName] = useState("Tournament");
  const [round, setRound] = useState(1);
  const [rinkScores, setRinkScores] = useState<RinkScoreEntry[]>([]);
  const [activeRink, setActiveRink] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [allFinalized, setAllFinalized] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [matchWonRink, setMatchWonRink] = useState<{ show: boolean; teamName: string } | null>(null);
  const [lastSavedEnd, setLastSavedEnd] = useState<{ rink: number; endIdx: number } | null>(null);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>(""); // JSON of last saved state

  function addToast(message: string, type: ToastType = "info") {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

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
            updatedAt: s.updated_at,
            dirty: false,
          }));
          setRinkScores(entries);
          setAllFinalized(entries.every((e) => e.isFinalized));
          lastSavedRef.current = JSON.stringify(
            entries.map((e) => ({ a: e.teamAScores, b: e.teamBScores }))
          );
        } else {
          await initializeFromDraw();
        }
      }
    } catch {
      addToast("Failed to load scores", "error");
    }
    setLoading(false);
  }, [tournamentId, round]);

  const initializeFromDraw = useCallback(async () => {
    const supabase = createClient();
    const { count } = await supabase
      .from("bowls_checkins")
      .select("id", { count: "exact", head: true })
      .eq("tournament_id", tournamentId);

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
        dirty: false,
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
        (payload) => {
          // Only reload if changes came from another session
          const changed = payload.new as TournamentScore | undefined;
          if (changed) {
            setRinkScores((prev) => {
              const idx = prev.findIndex(
                (r) => r.rink === changed.rink && !r.dirty
              );
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = {
                  ...updated[idx],
                  teamAScores: changed.team_a_scores,
                  teamBScores: changed.team_b_scores,
                  teamAPlayers: changed.team_a_players,
                  teamBPlayers: changed.team_b_players,
                  isFinalized: changed.is_finalized,
                  id: changed.id,
                  updatedAt: changed.updated_at,
                  dirty: false,
                };
                setAllFinalized(updated.every((e) => e.isFinalized));
                return updated;
              }
              return prev;
            });
          }
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, round]);

  useEffect(() => {
    loadTournament();
    loadScores();
  }, [loadTournament, loadScores]);

  // Auto-save: debounce 1.5s after last change
  useEffect(() => {
    const dirtyRinks = rinkScores.filter((r) => r.dirty && !r.isFinalized);
    if (dirtyRinks.length === 0) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      for (const entry of dirtyRinks) {
        const idx = rinkScores.findIndex((r) => r.rink === entry.rink);
        if (idx >= 0 && entry.teamAScores.length > 0) {
          await saveRinkScore(idx, true);
        }
      }
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [rinkScores]);

  function addEnd(rinkIndex: number) {
    setRinkScores((prev) => {
      const updated = [...prev];
      const entry = { ...updated[rinkIndex] };
      entry.teamAScores = [...entry.teamAScores, 0];
      entry.teamBScores = [...entry.teamBScores, 0];
      entry.dirty = true;
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
      entry.dirty = true;
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
      entry.dirty = true;
      updated[rinkIndex] = entry;
      return updated;
    });
  }

  async function saveRinkScore(rinkIndex: number, isAutoSave = false) {
    const entry = rinkScores[rinkIndex];
    if (!isAutoSave) setSaving(true);

    try {
      const res = await fetch("/api/bowls/scores", {
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
          expected_updated_at: entry.updatedAt,
        }),
      });

      if (res.status === 409) {
        addToast("Score conflict detected. Refreshing...", "error");
        await loadScores();
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        addToast(err.error || "Failed to save score", "error");
        return;
      }

      const saved = await res.json();
      setRinkScores((prev) => {
        const updated = [...prev];
        if (updated[rinkIndex]) {
          updated[rinkIndex] = {
            ...updated[rinkIndex],
            id: saved.id,
            updatedAt: saved.updated_at,
            dirty: false,
          };
        }
        return updated;
      });

      // Trigger end pulse on save
      const endCount = entry.teamAScores.length;
      if (endCount > 0) {
        setLastSavedEnd({ rink: entry.rink, endIdx: endCount - 1 });
        setTimeout(() => setLastSavedEnd(null), 500);
      }

      if (!isAutoSave) addToast("Score saved", "success");
    } catch {
      addToast("Network error saving score", "error");
    }
    if (!isAutoSave) setSaving(false);
  }

  async function finalizeRound() {
    setFinalizing(true);
    setConfirmFinalize(false);
    try {
      // Save all unsaved scores first
      for (let i = 0; i < rinkScores.length; i++) {
        if (!rinkScores[i].isFinalized && rinkScores[i].teamAScores.length > 0) {
          await saveRinkScore(i, true);
        }
      }

      const res = await fetch("/api/bowls/scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          round,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        addToast(err.error || "Failed to finalize round", "error");
      } else {
        addToast(`Round ${round} finalized`, "success");
        await loadScores();
        // Show celebration for the first finalized rink with a winner
        const winningRink = rinkScores.find((r) => {
          const tA = getTotal(r.teamAScores);
          const tB = getTotal(r.teamBScores);
          return tA !== tB;
        });
        if (winningRink) {
          const tA = getTotal(winningRink.teamAScores);
          const tB = getTotal(winningRink.teamBScores);
          setMatchWonRink({
            show: true,
            teamName: tA > tB ? `Rink ${winningRink.rink} Team A` : `Rink ${winningRink.rink} Team B`,
          });
        }
      }
    } catch {
      addToast("Network error finalizing round", "error");
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
        dirty: false,
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

  // Match point: a team is 1 point away from a typical winning score (21 for bowls)
  // or leads by enough in ends that one more end would clinch it
  function isMatchPoint(scoresA: number[], scoresB: number[]): "a" | "b" | null {
    const totalA = getTotal(scoresA);
    const totalB = getTotal(scoresB);
    const TARGET = 21; // standard bowls target score
    if (totalA >= TARGET - 1 && totalA > totalB) return "a";
    if (totalB >= TARGET - 1 && totalB > totalA) return "b";
    return null;
  }

  const dirtyCount = rinkScores.filter((r) => r.dirty).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0f2518]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] dark:border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0f2518] pb-20 lg:pb-0">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={cn(
                "rounded-xl px-4 py-3 text-sm font-semibold shadow-lg",
                toast.type === "success" && "bg-[#1B5E20] text-white",
                toast.type === "error" && "bg-red-600 text-white",
                toast.type === "info" && "bg-zinc-800 text-white"
              )}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#1a3d28]/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                  Score Entry
                </h1>
                {/* Realtime connection indicator */}
                <span
                  className={cn(
                    "inline-block h-2.5 w-2.5 rounded-full",
                    realtimeConnected ? "bg-[#1B5E20]" : "bg-zinc-300"
                  )}
                  title={realtimeConnected ? "Live updates active" : "Connecting..."}
                />
                {dirtyCount > 0 && (
                  <span className="text-xs font-medium text-amber-600">
                    Unsaved
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {tournamentName} &middot; Round {round}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/bowls/${tournamentId}`)}
                className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 min-h-[44px] touch-manipulation"
              >
                Back
              </button>
              <button
                onClick={() => router.push(`/bowls/${tournamentId}/live`)}
                className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-[#1B5E20] hover:bg-[#1B5E20]/5 min-h-[44px] touch-manipulation"
              >
                Live View
              </button>
              <button
                onClick={() => router.push(`/bowls/${tournamentId}/results`)}
                className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-[#1B5E20] hover:bg-blue-50 min-h-[44px] touch-manipulation"
              >
                Results
              </button>
            </div>
          </div>

          {/* Round selector */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Round:</span>
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
                    ? "bg-[#1B5E20] text-white"
                    : "bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/15"
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
                    ? "bg-[#1B5E20]/5 border-2 border-[#1B5E20]/20"
                    : isActive
                      ? "bg-[#1B5E20]/5 border-2 border-[#1B5E20] shadow-lg"
                      : "bg-white dark:bg-[#1a3d28] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-sm"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Rink {entry.rink}
                  </span>
                  <div className="flex items-center gap-1">
                    {entry.dirty && !entry.isFinalized && (
                      <span className="h-2 w-2 rounded-full bg-amber-400" title="Unsaved changes" />
                    )}
                    {entry.isFinalized && (
                      <span className="rounded-full bg-[#1B5E20]/10 px-2 py-0.5 text-[10px] font-bold text-[#2E7D32]">
                        Final
                      </span>
                    )}
                  </div>
                </div>

                {hasScores ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                        Team A
                      </span>
                      <MatchPoint isMatchPoint={isMatchPoint(entry.teamAScores, entry.teamBScores) === "a"}>
                        <span
                          className={cn(
                            "text-2xl font-black tabular-nums",
                            totalA > totalB
                              ? "text-[#1B5E20]"
                              : totalA < totalB
                                ? "text-zinc-400"
                                : "text-zinc-700"
                          )}
                        >
                          <NumberFlip value={totalA} />
                        </span>
                      </MatchPoint>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                        Team B
                      </span>
                      <MatchPoint isMatchPoint={isMatchPoint(entry.teamAScores, entry.teamBScores) === "b"}>
                        <span
                          className={cn(
                            "text-2xl font-black tabular-nums",
                            totalB > totalA
                              ? "text-[#1B5E20]"
                              : totalB < totalA
                                ? "text-zinc-400"
                                : "text-zinc-700"
                          )}
                        >
                          <NumberFlip value={totalB} />
                        </span>
                      </MatchPoint>
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
              className="flex min-h-[120px] items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors touch-manipulation"
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
              className="rounded-3xl bg-white dark:bg-[#1a3d28] border border-zinc-200 dark:border-white/10 shadow-xl overflow-hidden"
            >
              <div className="bg-zinc-50 dark:bg-[#0f2518] border-b border-zinc-200 dark:border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                      Rink {rinkScores[activeRink].rink} &mdash; End by End
                    </h2>
                    {rinkScores[activeRink].teamAScores.length > 0 && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Currently on End {rinkScores[activeRink].teamAScores.length}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!rinkScores[activeRink].isFinalized && (
                      <>
                        <button
                          onClick={() => removeEnd(activeRink)}
                          disabled={
                            rinkScores[activeRink].teamAScores.length === 0
                          }
                          className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 min-h-[44px] touch-manipulation"
                        >
                          - End
                        </button>
                        <button
                          onClick={() => addEnd(activeRink)}
                          className="rounded-xl bg-[#1B5E20] px-3 py-2 text-sm font-bold text-white hover:bg-[#145218] min-h-[44px] touch-manipulation"
                        >
                          + End
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setActiveRink(null)}
                      className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 min-h-[44px] touch-manipulation"
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
                              className={cn(
                                "px-2 py-2 text-center text-xs font-bold uppercase tracking-wider min-w-[56px]",
                                i === rinkScores[activeRink].teamAScores.length - 1
                                  ? "text-[#1B5E20]"
                                  : "text-zinc-400"
                              )}
                            >
                              E{i + 1}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 border-l border-zinc-200 dark:border-white/10">
                            Total
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            Ends
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Team A row */}
                        <tr className="border-t border-zinc-100 dark:border-white/5">
                          <td className="px-3 py-3 text-sm font-bold text-[#1B5E20] whitespace-nowrap">
                            Team A
                          </td>
                          {rinkScores[activeRink].teamAScores.map(
                            (score, endIdx) => (
                              <td key={endIdx} className="px-1 py-2">
                                <EndPulse
                                  active={
                                    lastSavedEnd !== null &&
                                    lastSavedEnd.rink === rinkScores[activeRink].rink &&
                                    lastSavedEnd.endIdx === endIdx
                                  }
                                >
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
                                    isCurrent={
                                      endIdx === rinkScores[activeRink].teamAScores.length - 1
                                    }
                                  />
                                </EndPulse>
                              </td>
                            )
                          )}
                          <td className="px-3 py-3 text-center border-l border-zinc-200 dark:border-white/10">
                            <MatchPoint isMatchPoint={isMatchPoint(rinkScores[activeRink].teamAScores, rinkScores[activeRink].teamBScores) === "a"}>
                              <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                                <NumberFlip value={getTotal(rinkScores[activeRink].teamAScores)} />
                              </span>
                            </MatchPoint>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="text-lg font-bold text-zinc-600 dark:text-zinc-400 tabular-nums">
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
                        <tr className="border-t border-zinc-100 dark:border-white/5">
                          <td className="px-3 py-3 text-sm font-bold text-purple-600 whitespace-nowrap">
                            Team B
                          </td>
                          {rinkScores[activeRink].teamBScores.map(
                            (score, endIdx) => (
                              <td key={endIdx} className="px-1 py-2">
                                <EndPulse
                                  active={
                                    lastSavedEnd !== null &&
                                    lastSavedEnd.rink === rinkScores[activeRink].rink &&
                                    lastSavedEnd.endIdx === endIdx
                                  }
                                >
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
                                    isCurrent={
                                      endIdx === rinkScores[activeRink].teamBScores.length - 1
                                    }
                                  />
                                </EndPulse>
                              </td>
                            )
                          )}
                          <td className="px-3 py-3 text-center border-l border-zinc-200 dark:border-white/10">
                            <MatchPoint isMatchPoint={isMatchPoint(rinkScores[activeRink].teamAScores, rinkScores[activeRink].teamBScores) === "b"}>
                              <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                                <NumberFlip value={getTotal(rinkScores[activeRink].teamBScores)} />
                              </span>
                            </MatchPoint>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="text-lg font-bold text-zinc-600 dark:text-zinc-400 tabular-nums">
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
                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-xs text-zinc-400">
                        Auto-saves after changes
                      </p>
                      <button
                        onClick={() => saveRinkScore(activeRink)}
                        disabled={saving}
                        className="rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218] disabled:opacity-50 min-h-[48px] touch-manipulation"
                      >
                        {saving ? "Saving..." : "Save Now"}
                      </button>
                    </div>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Finalize Round */}
        {rinkScores.length > 0 && !allFinalized && (
          <div className="mt-8 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 p-6">
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
                onClick={() => setConfirmFinalize(true)}
                disabled={finalizing}
                className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50 min-h-[48px] touch-manipulation"
              >
                {finalizing ? "Finalizing..." : "Finalize Round"}
              </button>
            </div>
          </div>
        )}

        {/* Finalize confirmation dialog */}
        <AnimatePresence>
          {confirmFinalize && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setConfirmFinalize(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a3d28] p-6 shadow-2xl"
              >
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  Finalize Round {round}?
                </h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  All scores for {rinkScores.length} rink{rinkScores.length !== 1 ? "s" : ""} will be locked permanently. This cannot be undone.
                </p>
                <div className="mt-6 flex items-center gap-3 justify-end">
                  <button
                    onClick={() => setConfirmFinalize(false)}
                    className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 min-h-[44px] touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={finalizeRound}
                    className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 min-h-[44px] touch-manipulation"
                  >
                    Finalize
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {allFinalized && (
          <div className="mt-8 rounded-2xl bg-[#1B5E20]/5 border border-[#1B5E20]/20 p-6 text-center">
            <p className="text-lg font-bold text-[#2E7D32]">
              Round {round} is finalized
            </p>
            <p className="text-sm text-[#1B5E20] mt-1">
              All scores have been locked.
            </p>
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => router.push(`/bowls/${tournamentId}/results`)}
                className="rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#1B5E20] min-h-[48px] touch-manipulation"
              >
                View Results
              </button>
              <button
                onClick={() => {
                  setRound(round + 1);
                  setActiveRink(null);
                  setLoading(true);
                }}
                className="rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218] min-h-[48px] touch-manipulation"
              >
                {"Enter Round " + (round + 1) + " Scores"}
              </button>
            </div>
          </div>
        )}
        {/* Match won celebration overlay */}
        <MatchWon
          show={matchWonRink?.show ?? false}
          teamName={matchWonRink?.teamName ?? "Winner"}
          onDismiss={() => setMatchWonRink(null)}
        />
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
  isCurrent,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  isWinning: boolean;
  isCurrent: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {!disabled && (
        <button
          onClick={() => onChange(Math.min(value + 1, 9))}
          className="flex h-8 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/15 active:bg-zinc-300 dark:active:bg-white/20 touch-manipulation"
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
            ? "bg-zinc-50 dark:bg-white/5 text-zinc-400"
            : isWinning
              ? "bg-[#1B5E20]/10 dark:bg-emerald-900/30 text-[#2E7D32] dark:text-emerald-400 ring-2 ring-[#1B5E20] dark:ring-emerald-500"
              : value === 0
                ? "bg-zinc-50 dark:bg-white/5 text-zinc-300 dark:text-zinc-500 dark:text-muted-foreground"
                : "bg-blue-50 dark:bg-emerald-900/20 text-[#2E7D32] dark:text-emerald-400",
          isCurrent && !disabled && "ring-2 ring-[#1B5E20]/30"
        )}
      >
        <NumberFlip value={value} />
      </div>
      {!disabled && (
        <button
          onClick={() => onChange(Math.max(value - 1, 0))}
          className="flex h-8 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/15 active:bg-zinc-300 dark:active:bg-white/20 touch-manipulation"
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
