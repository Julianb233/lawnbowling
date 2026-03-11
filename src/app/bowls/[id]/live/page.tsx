"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { TournamentScore, ScoreWinner } from "@/lib/types";

export default function LiveScoresPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = (params?.id ?? "") as string;

  const [tournamentName, setTournamentName] = useState("Tournament");
  const [scores, setScores] = useState<TournamentScore[]>([]);
  const [round, setRound] = useState(1);
  const [maxRound, setMaxRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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
        `/api/bowls/scores?tournament_id=${tournamentId}`
      );
      if (res.ok) {
        const data: TournamentScore[] = await res.json();
        const maxR = data.reduce((max, s) => Math.max(max, s.round), 1);
        setMaxRound(maxR);
        setRound((prev) => Math.min(prev, maxR) || maxR);
        setScores(data);
        setLastUpdate(new Date());
      }
    } catch {
      // Will retry via realtime
    }
    setLoading(false);
  }, [tournamentId]);

  // Subscribe to realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`live-scores-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_scores",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          loadScores();
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, loadScores]);

  useEffect(() => {
    loadTournament();
    loadScores();
  }, [loadTournament, loadScores]);

  const roundScores = scores
    .filter((s) => s.round === round)
    .sort((a, b) => a.rink - b.rink);

  const allFinalized = roundScores.length > 0 && roundScores.every((s) => s.is_finalized);

  function getWinnerLabel(winner: ScoreWinner): string {
    if (winner === "team_a") return "Team A wins";
    if (winner === "team_b") return "Team B wins";
    if (winner === "draw") return "Draw";
    return "In progress";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight">
                  {tournamentName}
                </h1>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-block h-2.5 w-2.5 rounded-full",
                      connected ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                    )}
                  />
                  <span className="text-xs font-medium text-zinc-400">
                    {connected ? "LIVE" : "Connecting"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-500 mt-0.5">
                Round {round}
                {allFinalized && " — Final"}
                {lastUpdate && (
                  <span className="ml-2">
                    Updated {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => router.push(`/bowls/${tournamentId}`)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5 min-h-[44px] touch-manipulation"
            >
              Back
            </button>
          </div>

          {/* Round selector */}
          {maxRound > 1 && (
            <div className="mt-3 flex items-center gap-2">
              {Array.from({ length: maxRound }, (_, i) => i + 1).map((r) => (
                <button
                  key={r}
                  onClick={() => setRound(r)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors touch-manipulation",
                    round === r
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-zinc-400 hover:bg-white/20"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {roundScores.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-12 text-center">
            <p className="text-lg font-semibold text-zinc-500">
              No scores for this round yet
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Scores will appear here in real-time as they are entered
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {roundScores.map((score) => (
                <motion.div
                  key={`${score.round}-${score.rink}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "rounded-2xl border overflow-hidden",
                    score.is_finalized
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-white/10 bg-white/[0.03]"
                  )}
                >
                  {/* Rink header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                      Rink {score.rink}
                    </span>
                    <div className="flex items-center gap-2">
                      {!score.is_finalized && score.team_a_scores.length > 0 && (
                        <span className="text-xs font-medium text-zinc-500">
                          End {score.team_a_scores.length}
                        </span>
                      )}
                      {score.is_finalized ? (
                        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          Final
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                          Live
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Score display */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div
                        className={cn(
                          "text-center p-3 rounded-xl",
                          score.winner === "team_a"
                            ? "bg-blue-500/10 ring-1 ring-blue-500/30"
                            : "bg-white/5"
                        )}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                          Team A
                        </p>
                        <motion.p
                          key={score.total_a}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            "text-4xl font-black tabular-nums",
                            score.winner === "team_a"
                              ? "text-blue-400"
                              : "text-zinc-300"
                          )}
                        >
                          {score.total_a}
                        </motion.p>
                        <p className="text-xs text-zinc-600 mt-1">
                          {score.ends_won_a} ends
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-zinc-700">
                          vs
                        </span>
                        <p className={cn(
                          "text-[10px] font-bold mt-1",
                          score.winner === "team_a" ? "text-blue-400" :
                          score.winner === "team_b" ? "text-purple-400" :
                          score.winner === "draw" ? "text-amber-400" :
                          "text-zinc-600"
                        )}>
                          {getWinnerLabel(score.winner)}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "text-center p-3 rounded-xl",
                          score.winner === "team_b"
                            ? "bg-purple-500/10 ring-1 ring-purple-500/30"
                            : "bg-white/5"
                        )}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
                          Team B
                        </p>
                        <motion.p
                          key={score.total_b}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            "text-4xl font-black tabular-nums",
                            score.winner === "team_b"
                              ? "text-purple-400"
                              : "text-zinc-300"
                          )}
                        >
                          {score.total_b}
                        </motion.p>
                        <p className="text-xs text-zinc-600 mt-1">
                          {score.ends_won_b} ends
                        </p>
                      </div>
                    </div>

                    {/* End-by-end mini scoreboard */}
                    {score.team_a_scores.length > 0 && (
                      <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/5">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/5">
                              <th className="px-2.5 py-1.5 text-left font-bold text-zinc-600">
                                &nbsp;
                              </th>
                              {score.team_a_scores.map((_, i) => (
                                <th
                                  key={i}
                                  className={cn(
                                    "px-1.5 py-1.5 text-center font-bold",
                                    i === score.team_a_scores.length - 1
                                      ? "text-zinc-300"
                                      : "text-zinc-600"
                                  )}
                                >
                                  {i + 1}
                                </th>
                              ))}
                              <th className="px-2.5 py-1.5 text-center font-bold text-zinc-400 border-l border-white/5">
                                T
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-white/5">
                              <td className="px-2.5 py-1.5 font-bold text-blue-400">
                                A
                              </td>
                              {score.team_a_scores.map((s, i) => (
                                <td
                                  key={i}
                                  className={cn(
                                    "px-1.5 py-1.5 text-center font-bold tabular-nums",
                                    s > score.team_b_scores[i]
                                      ? "text-emerald-400"
                                      : s === 0
                                        ? "text-zinc-700"
                                        : "text-zinc-400"
                                  )}
                                >
                                  {s}
                                </td>
                              ))}
                              <td className="px-2.5 py-1.5 text-center font-black text-white border-l border-white/5 tabular-nums">
                                {score.total_a}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-2.5 py-1.5 font-bold text-purple-400">
                                B
                              </td>
                              {score.team_b_scores.map((s, i) => (
                                <td
                                  key={i}
                                  className={cn(
                                    "px-1.5 py-1.5 text-center font-bold tabular-nums",
                                    s > score.team_a_scores[i]
                                      ? "text-emerald-400"
                                      : s === 0
                                        ? "text-zinc-700"
                                        : "text-zinc-400"
                                  )}
                                >
                                  {s}
                                </td>
                              ))}
                              <td className="px-2.5 py-1.5 text-center font-black text-white border-l border-white/5 tabular-nums">
                                {score.total_b}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Player names */}
                    {(score.team_a_players?.length > 0 ||
                      score.team_b_players?.length > 0) && (
                      <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-zinc-600">
                        <div>
                          {score.team_a_players.map((p) => (
                            <p key={p.player_id}>{p.display_name}</p>
                          ))}
                        </div>
                        <div className="text-right">
                          {score.team_b_players.map((p) => (
                            <p key={p.player_id}>{p.display_name}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
