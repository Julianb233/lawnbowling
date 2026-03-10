"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { ALL_SPORTS, SPORT_LABELS } from "@/lib/types";
import type { PlayerStats } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ANIMATIONS } from "@/lib/design";

type LeaderboardEntry = PlayerStats & {
  player: { id: string; name: string; avatar_url: string | null; skill_level: string; sports: string[] };
};

interface LeaderboardProps {
  currentUserId?: string | null;
}

export function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<string | "all">("all");

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sportFilter !== "all") params.set("sport", sportFilter);
      const res = await fetch(`/api/stats/leaderboard?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.leaderboard ?? []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [sportFilter]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-amber-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-zinc-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-zinc-600">{rank}</span>;
  };

  return (
    <div>
      {/* Sport filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSportFilter("all")}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            sportFilter === "all"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          )}
        >
          All Sports
        </button>
        {ALL_SPORTS.map((s) => {
          const label = SPORT_LABELS[s];
          return (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                sportFilter === s
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              )}
            >
              {label.emoji} {label.short}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-800/50" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-600">
          No players with 5+ games yet
        </div>
      ) : (
        <motion.div className="space-y-2" {...ANIMATIONS.staggerChildren} initial="initial" animate="animate">
          {entries.map((entry, i) => {
            const rank = i + 1;
            const isMe = entry.player_id === currentUserId;
            return (
              <motion.div
                key={entry.player_id}
                {...ANIMATIONS.fadeInUp}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3",
                  isMe
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-zinc-800 bg-zinc-900/50"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center">
                  {getRankDisplay(rank)}
                </div>

                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                  {entry.player?.avatar_url ? (
                    <img src={entry.player.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500">
                      {entry.player?.display_name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-200">
                    {entry.player?.display_name}
                    {isMe && <span className="ml-1 text-xs text-emerald-400">(You)</span>}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {entry.games_played} games &middot; {entry.wins}W/{entry.losses}L
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">{Math.round(entry.win_rate)}%</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
