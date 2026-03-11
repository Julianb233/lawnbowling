"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { BOWLS_FORMAT_LABELS } from "@/lib/types";
import type { BowlsGameFormat } from "@/lib/types";

interface HistoricalTournament {
  id: string;
  name: string;
  format: string;
  status: string;
  max_players: number;
  starts_at: string | null;
  created_at: string;
  creator?: { display_name: string } | null;
  checkin_count: number;
  rounds_played: number;
  total_rinks: number;
  winner_name: string | null;
}

export default function BowlsHistoryPage() {
  const [tournaments, setTournaments] = useState<HistoricalTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "active">("all");

  const loadTournaments = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tournaments")
      .select("*, creator:players!tournaments_created_by_fkey(display_name)")
      .eq("sport", "lawn_bowling")
      .order("created_at", { ascending: false });

    if (data) {
      const enriched = await Promise.all(
        data.map(async (t) => {
          // Get checkin count
          const { count: checkinCount } = await supabase
            .from("bowls_checkins")
            .select("id", { count: "exact", head: true })
            .eq("tournament_id", t.id);

          // Get rounds played (distinct round numbers in scores)
          const { data: scoreData } = await supabase
            .from("tournament_scores")
            .select("round, rink")
            .eq("tournament_id", t.id);

          const rounds = new Set((scoreData ?? []).map((s: { round: number }) => s.round));
          const totalRinks = (scoreData ?? []).length;

          // Calculate winner from finalized scores (most wins, then shot diff)
          let winnerName: string | null = null;
          if (t.status === "completed" && scoreData && scoreData.length > 0) {
            try {
              const res = await fetch(`/api/bowls/results?tournament_id=${t.id}`);
              if (res.ok) {
                const results = await res.json();
                if (results.player_standings?.length > 0) {
                  winnerName = results.player_standings[0].display_name;
                }
              }
            } catch {
              // Non-critical
            }
          }

          return {
            ...t,
            checkin_count: checkinCount ?? 0,
            rounds_played: rounds.size,
            total_rinks: totalRinks,
            winner_name: winnerName,
          } as HistoricalTournament;
        })
      );
      setTournaments(enriched);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const filtered = tournaments.filter((t) => {
    if (filter === "completed") return t.status === "completed";
    if (filter === "active") return t.status !== "completed";
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#1a3d28]/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                Tournament History
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""} total
              </p>
            </div>
            <Link
              href="/bowls"
              className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 min-h-[44px] touch-manipulation inline-flex items-center"
            >
              Back to Bowls
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="mt-3 flex gap-2">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors min-h-[40px] touch-manipulation ${
                  filter === f
                    ? "bg-[#1B5E20] text-white"
                    : "text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                {f === "all" ? "All" : f === "active" ? "Active" : "Completed"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border border-zinc-200 p-12 text-center">
            <p className="text-lg font-semibold text-zinc-400">
              No tournaments found
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {filter === "completed"
                ? "No completed tournaments yet"
                : filter === "active"
                  ? "No active tournaments right now"
                  : "Create your first tournament to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t, i) => {
              const formatLabel =
                BOWLS_FORMAT_LABELS[t.format as BowlsGameFormat]?.label ?? t.format;
              const isCompleted = t.status === "completed";

              return (
                <Link key={t.id} href={`/bowls/${t.id}/results`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl bg-white border border-zinc-200 p-5 transition-all hover:border-zinc-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-zinc-900 truncate">
                          {t.name}
                        </h3>
                        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                          {formatLabel}
                          {t.starts_at && (
                            <>
                              {" \u00B7 "}
                              {new Date(t.starts_at).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </>
                          )}
                          {!t.starts_at && (
                            <>
                              {" \u00B7 "}
                              {new Date(t.created_at).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </>
                          )}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold shrink-0 ml-3 ${
                          isCompleted
                            ? "bg-zinc-100 text-zinc-500 dark:text-zinc-400"
                            : "bg-[#1B5E20]/10 text-[#2E7D32]"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Active"}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <span className="font-bold text-[#1B5E20]">{t.checkin_count}</span> players
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-bold text-[#1B5E20]">{t.rounds_played}</span> round{t.rounds_played !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-bold text-purple-600">{t.total_rinks}</span> rink game{t.total_rinks !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {t.winner_name && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                        <span className="text-xs font-bold text-amber-700">Winner:</span>
                        <span className="text-xs font-semibold text-amber-900">{t.winner_name}</span>
                      </div>
                    )}

                    {t.creator?.display_name && (
                      <p className="mt-2 text-xs text-zinc-400">
                        Created by {t.creator.display_name}
                      </p>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
