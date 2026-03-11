"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { ALL_SPORTS, SPORT_LABELS } from "@/lib/types";
import { SportIcon } from "@/components/icons/SportIcon";
import type { PlayerStats, Sport } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ANIMATIONS } from "@/lib/design";

type LeaderboardEntry = PlayerStats & {
  player: { id: string; name: string; avatar_url: string | null; skill_level: string; sports: string[] };
};

interface LeaderboardProps {
  currentUserId?: string | null;
  clubId?: string | null;
}

export function Leaderboard({ currentUserId, clubId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<string | "all">("all");

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sportFilter !== "all") params.set("sport", sportFilter);
      if (clubId) params.set("club_id", clubId);
      const res = await fetch(`/api/stats/leaderboard?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.leaderboard ?? []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [sportFilter, clubId]);

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
              ? "bg-[#1B5E20] text-white"
              : "bg-zinc-100 text-zinc-400 hover:text-zinc-700"
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
                  ? "bg-[#1B5E20] text-white"
                  : "bg-zinc-100 text-zinc-400 hover:text-zinc-700"
              )}
            >
              <SportIcon sport={s} className="w-3.5 h-3.5 inline-block" /> {label.short}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-100" />
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
                    ? "border-[#1B5E20]/30 bg-[#1B5E20]/5"
                    : "border-zinc-200 bg-zinc-50"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center">
                  {getRankDisplay(rank)}
                </div>

                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                  {entry.player?.avatar_url ? (
                    <img src={entry.player.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500">
                      {entry.player?.display_name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-700">
                    {entry.player?.display_name}
                    {isMe && <span className="ml-1 text-xs text-[#1B5E20]">(You)</span>}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {entry.games_played} games &middot; {entry.wins}W/{entry.losses}L
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-[#1B5E20]">{Math.round(entry.win_rate)}%</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
