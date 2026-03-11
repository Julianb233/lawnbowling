"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, ChevronDown } from "lucide-react";
import { ALL_SPORTS, SPORT_LABELS } from "@/lib/types";
import { SportIcon } from "@/components/icons/SportIcon";
import type { PlayerStats, Sport, BowlsLeaderboardCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ANIMATIONS } from "@/lib/design";
import { getRatingTier } from "@/lib/elo";

type LeaderboardEntry = PlayerStats & {
  player: { id: string; name: string; avatar_url: string | null; skill_level: string; sports: string[] };
};

interface BowlsLeaderboardEntry {
  player_id: string;
  position: string;
  elo_rating: number;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  shot_differential: number;
  ends_won_pct: number;
  player: { id: string; display_name: string; avatar_url: string | null };
}

interface LeaderboardProps {
  currentUserId?: string | null;
  clubId?: string | null;
}

const BOWLS_CATEGORIES: { key: BowlsLeaderboardCategory; label: string }[] = [
  { key: "overall", label: "Overall" },
  { key: "skip", label: "Skip Rating" },
  { key: "lead", label: "Lead Rating" },
  { key: "ends_pct", label: "Ends Win %" },
];

const TIER_COLORS: Record<string, string> = {
  expert: "text-amber-600",
  advanced: "text-purple-600",
  intermediate: "text-blue-600",
  beginner: "text-zinc-500",
};

export function Leaderboard({ currentUserId, clubId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [bowlsEntries, setBowlsEntries] = useState<BowlsLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<string | "all">("all");
  const [bowlsCategory, setBowlsCategory] = useState<BowlsLeaderboardCategory>("overall");
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);

  const currentYear = new Date().getFullYear();
  const availableSeasons = Array.from({ length: 5 }, (_, i) =>
    (currentYear - i).toString()
  );

  const isBowls = sportFilter === "lawn_bowling";

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      if (isBowls && bowlsCategory !== "overall") {
        const params = new URLSearchParams();
        params.set("category", bowlsCategory);
        params.set("season", season);
        if (clubId) params.set("club_id", clubId);
        const res = await fetch(`/api/stats/leaderboard/bowls?${params}`);
        if (res.ok) {
          const data = await res.json();
          setBowlsEntries(data.leaderboard ?? []);
          setEntries([]);
        }
      } else {
        const params = new URLSearchParams();
        if (sportFilter !== "all") params.set("sport", sportFilter);
        if (clubId) params.set("club_id", clubId);
        const res = await fetch(`/api/stats/leaderboard?${params}`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data.leaderboard ?? []);
          setBowlsEntries([]);
        }
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [sportFilter, clubId, isBowls, bowlsCategory, season]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-amber-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-zinc-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{rank}</span>;
  };

  return (
    <div>
      {/* Sport filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setSportFilter("all"); setBowlsCategory("overall"); }}
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
              onClick={() => { setSportFilter(s); setBowlsCategory("overall"); }}
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

      {/* Bowls category tabs */}
      {isBowls && (
        <div className="mb-4 flex gap-1.5 overflow-x-auto rounded-lg bg-zinc-100 p-1">
          {BOWLS_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setBowlsCategory(cat.key)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                bowlsCategory === cat.key
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      ) : (isBowls && bowlsCategory !== "overall") ? (
        bowlsEntries.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No rated players in this category yet
          </div>
        ) : (
          <motion.div className="space-y-2" {...ANIMATIONS.staggerChildren} initial="initial" animate="animate">
            {bowlsEntries.map((entry, i) => {
              const rank = i + 1;
              const isMe = entry.player_id === currentUserId;
              const tier = getRatingTier(entry.elo_rating);
              return (
                <motion.div
                  key={entry.player_id}
                  {...ANIMATIONS.fadeInUp}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3",
                    isMe
                      ? "border-[#1B5E20]/30 bg-[#1B5E20]/5"
                      : "border-zinc-200 bg-zinc-50 dark:bg-white/5"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center">
                    {getRankDisplay(rank)}
                  </div>

                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                    {entry.player?.avatar_url ? (
                      <img src={entry.player.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-400">
                        {entry.player?.display_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-700">
                      {entry.player?.display_name}
                      {isMe && <span className="ml-1 text-xs text-[#1B5E20]">(You)</span>}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {entry.games_played} games &middot; {entry.wins}W/{entry.losses}L
                      {entry.draws > 0 ? `/${entry.draws}D` : ""}
                      {bowlsCategory !== "ends_pct" && (
                        <span className="ml-1">
                          &middot; <span className={TIER_COLORS[tier]}>{tier}</span>
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    {bowlsCategory === "ends_pct" ? (
                      <p className="text-lg font-bold text-[#1B5E20]">
                        {entry.ends_won_pct}%
                      </p>
                    ) : (
                      <div>
                        <p className="text-lg font-bold text-[#1B5E20] tabular-nums">
                          {Math.round(entry.elo_rating)}
                        </p>
                        <p className="text-xs text-zinc-400">ELO</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )
      ) : entries.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-600 dark:text-zinc-400">
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
                    : "border-zinc-200 bg-zinc-50 dark:bg-white/5"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center">
                  {getRankDisplay(rank)}
                </div>

                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                  {entry.player?.avatar_url ? (
                    <img src={entry.player.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-400">
                      {entry.player?.display_name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-700">
                    {entry.player?.display_name}
                    {isMe && <span className="ml-1 text-xs text-[#1B5E20]">(You)</span>}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
