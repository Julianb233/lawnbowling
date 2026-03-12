"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, ArrowUpDown, Flame, Target, Gamepad2, Zap, ChevronDown } from "lucide-react";
import { ALL_SKILLS, SKILL_LABELS } from "@/lib/types";
import type { SkillLevel, BowlsLeaderboardCategory } from "@/lib/types";
import { getRatingTier } from "@/lib/elo";
import { cn } from "@/lib/utils";
import { ANIMATIONS } from "@/lib/design";
import Link from "next/link";

type LeaderboardSortBy = "win_rate" | "games_played" | "wins" | "elo_rating";

interface LeaderboardEntry {
  player_id: string;
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  elo_rating: number | null;
  favorite_sport: string | null;
  player: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    skill_level: string;
    sports: string[];
  };
}

const SORT_OPTIONS: { value: LeaderboardSortBy; label: string; icon: React.ReactNode }[] = [
  { value: "win_rate", label: "Win Rate", icon: <Target className="h-3.5 w-3.5" /> },
  { value: "games_played", label: "Games Played", icon: <Gamepad2 className="h-3.5 w-3.5" /> },
  { value: "wins", label: "Total Wins", icon: <Flame className="h-3.5 w-3.5" /> },
  { value: "elo_rating", label: "ELO Rating", icon: <Zap className="h-3.5 w-3.5" /> },
];

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
  beginner: "text-[#3D5A3E]",
};

interface LeaderboardProps {
  currentUserId?: string | null;
}

export function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [bowlsEntries, setBowlsEntries] = useState<BowlsLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter] = useState<string>("lawn_bowling");
  const [skillFilter, setSkillFilter] = useState<string | "all">("all");
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>("win_rate");
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
        const res = await fetch(`/api/stats/leaderboard/bowls?${params}`);
        if (res.ok) {
          const data = await res.json();
          setBowlsEntries(data.leaderboard ?? []);
          setEntries([]);
        }
      } else {
        const params = new URLSearchParams();
        params.set("sport", sportFilter);
        if (skillFilter !== "all") params.set("skill_level", skillFilter);
        params.set("sort_by", sortBy);
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
  }, [sportFilter, skillFilter, sortBy, isBowls, bowlsCategory, season]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankDisplay = (rank: number) => {
    if (rank === 1)
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
          <Trophy className="h-4 w-4 text-amber-500" />
        </div>
      );
    if (rank === 2)
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A2E12]/5">
          <Medal className="h-4 w-4 text-[#3D5A3E]" />
        </div>
      );
    if (rank === 3)
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
          <Medal className="h-4 w-4 text-amber-700" />
        </div>
      );
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        <span className="text-sm font-bold text-[#3D5A3E]">{rank}</span>
      </div>
    );
  };

  const getStatDisplay = (entry: LeaderboardEntry) => {
    switch (sortBy) {
      case "elo_rating":
        return (
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-500">{entry.elo_rating ?? "—"}</p>
            <p className="text-[10px] uppercase tracking-wide text-[#3D5A3E]">ELO</p>
          </div>
        );
      case "games_played":
        return (
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-500">{entry.games_played}</p>
            <p className="text-[10px] uppercase tracking-wide text-[#3D5A3E]">Games</p>
          </div>
        );
      case "wins":
        return (
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-500">{entry.wins}</p>
            <p className="text-[10px] uppercase tracking-wide text-[#3D5A3E]">Wins</p>
          </div>
        );
      default:
        return (
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-500">{Math.round(entry.win_rate)}%</p>
            <p className="text-[10px] uppercase tracking-wide text-[#3D5A3E]">Win Rate</p>
          </div>
        );
    }
  };

  const skillStars = (level: string) => {
    const info = SKILL_LABELS[level as SkillLevel];
    if (!info) return null;
    return "⭐".repeat(info.stars);
  };

  return (
    <div className="space-y-4">
      {/* Skill level filter */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#3D5A3E]">Skill Level</p>
        <div className="flex gap-2">
          <button
            onClick={() => setSkillFilter("all")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              skillFilter === "all"
                ? "bg-violet-600 text-white"
                : "bg-[#0A2E12]/5 text-[#3D5A3E] hover:text-[#2D4A30]"
            )}
          >
            All Levels
          </button>
          {ALL_SKILLS.map((level) => (
            <button
              key={level}
              onClick={() => setSkillFilter(level)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                skillFilter === level
                  ? "bg-violet-600 text-white"
                  : "bg-[#0A2E12]/5 text-[#3D5A3E] hover:text-[#2D4A30]"
              )}
            >
              {SKILL_LABELS[level].label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort options */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#3D5A3E]">
          <ArrowUpDown className="mr-1 inline h-3 w-3" />
          Rank By
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                sortBy === opt.value
                  ? "bg-[#0A2E12] text-white"
                  : "bg-[#0A2E12]/5 text-[#3D5A3E] hover:text-[#2D4A30]"
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bowls category tabs + season selector */}
      {isBowls && (
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5 overflow-x-auto rounded-lg bg-[#0A2E12]/5 p-1">
            {BOWLS_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setBowlsCategory(cat.key)}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  bowlsCategory === cat.key
                    ? "bg-white text-[#0A2E12] shadow-sm"
                    : "text-[#3D5A3E] hover:text-[#2D4A30]"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSeasonPicker(!showSeasonPicker)}
              className="flex items-center gap-1 rounded-lg border border-[#0A2E12]/10 bg-white px-3 py-1.5 text-xs font-medium text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03]"
            >
              {season}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showSeasonPicker && (
              <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-[#0A2E12]/10 bg-white py-1 shadow-lg">
                {availableSeasons.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSeason(s);
                      setShowSeasonPicker(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-1.5 text-left text-xs",
                      s === season
                        ? "bg-emerald-500/5 font-bold text-emerald-600"
                        : "text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03]"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[#0A2E12]/5" />
          ))}
        </div>
      ) : (isBowls && bowlsCategory !== "overall") ? (
        bowlsEntries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#0A2E12]/10 py-16 text-center">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-[#3D5A3E]" />
            <p className="text-sm font-medium text-[#3D5A3E]">No rated players in this category yet</p>
          </div>
        ) : (
          <motion.div className="space-y-2" {...ANIMATIONS.staggerChildren} initial="initial" animate="animate">
            {bowlsEntries.map((entry, i) => {
              const rank = i + 1;
              const isMe = entry.player_id === currentUserId;
              const tier = getRatingTier(entry.elo_rating);
              return (
                <motion.div key={entry.player_id} {...ANIMATIONS.fadeInUp}>
                  <Link
                    href={`/profile/${entry.player_id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-[#0A2E12]/[0.03]",
                      isMe
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-[#0A2E12]/10 bg-white"
                    )}
                  >
                    {getRankDisplay(rank)}

                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#0A2E12]/5">
                      {entry.player?.avatar_url ? (
                        <img src={entry.player.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#3D5A3E]">
                          {entry.player?.display_name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#2D4A30]">
                        {entry.player?.display_name}
                        {isMe && <span className="ml-1 text-xs text-emerald-500">(You)</span>}
                      </p>
                      <p className="text-xs text-[#3D5A3E]">
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
                        <div>
                          <p className="text-lg font-bold text-emerald-500">{entry.ends_won_pct}%</p>
                          <p className="text-[10px] uppercase tracking-wide text-[#3D5A3E]">Ends</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-bold text-emerald-500 tabular-nums">
                            {Math.round(entry.elo_rating)}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide text-[#3D5A3E]">ELO</p>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#0A2E12]/10 py-16 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-[#3D5A3E]" />
          <p className="text-sm font-medium text-[#3D5A3E]">No players ranked yet</p>
          <p className="mt-1 text-xs text-[#3D5A3E]">
            Play at least 3 games to appear on the leaderboard
          </p>
        </div>
      ) : (
        <motion.div className="space-y-2" {...ANIMATIONS.staggerChildren} initial="initial" animate="animate">
          {/* Top 3 podium for larger lists */}
          {entries.length >= 3 && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {[1, 0, 2].map((idx) => {
                const entry = entries[idx];
                if (!entry) return null;
                const rank = idx + 1;
                const isMe = entry.player_id === currentUserId;
                return (
                  <Link
                    key={entry.player_id}
                    href={`/profile/${entry.player_id}`}
                    className={cn(
                      "flex flex-col items-center rounded-xl border p-3 transition-colors hover:bg-[#0A2E12]/[0.03]",
                      rank === 1 ? "order-2 border-amber-200 bg-amber-50/50" : "",
                      rank === 2 ? "order-1 border-[#0A2E12]/10 bg-[#0A2E12]/[0.03]" : "",
                      rank === 3 ? "order-3 border-amber-100 bg-orange-50/30" : "",
                      isMe ? "ring-2 ring-emerald-500/30" : ""
                    )}
                  >
                    <div className="relative">
                      <div
                        className={cn(
                          "h-12 w-12 overflow-hidden rounded-full border-2",
                          rank === 1 ? "border-amber-400" : rank === 2 ? "border-[#0A2E12]/10" : "border-amber-600"
                        )}
                      >
                        {entry.player?.avatar_url ? (
                          <img src={entry.player.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#0A2E12]/5 text-base font-bold text-[#3D5A3E]">
                            {entry.player?.display_name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
                          rank === 1 ? "bg-amber-500" : rank === 2 ? "bg-[#0A2E12]/5" : "bg-amber-700"
                        )}
                      >
                        {rank}
                      </div>
                    </div>
                    <p className="mt-2 max-w-full truncate text-xs font-semibold text-[#2D4A30]">
                      {entry.player?.display_name}
                    </p>
                    <p className="text-[10px] text-[#3D5A3E]">
                      {entry.games_played}G &middot; {entry.wins}W
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-emerald-500">
                      {sortBy === "elo_rating"
                        ? entry.elo_rating ?? "—"
                        : sortBy === "games_played"
                        ? entry.games_played
                        : sortBy === "wins"
                        ? entry.wins
                        : `${Math.round(entry.win_rate)}%`}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Full list */}
          {entries.map((entry, i) => {
            const rank = i + 1;
            const isMe = entry.player_id === currentUserId;
            // Skip top 3 if podium is shown
            if (entries.length >= 3 && rank <= 3) return null;
            return (
              <motion.div key={entry.player_id} {...ANIMATIONS.fadeInUp}>
                <Link
                  href={`/profile/${entry.player_id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-[#0A2E12]/[0.03]",
                    isMe
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-[#0A2E12]/10 bg-white"
                  )}
                >
                  {getRankDisplay(rank)}

                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#0A2E12]/5">
                    {entry.player?.avatar_url ? (
                      <img src={entry.player.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#3D5A3E]">
                        {entry.player?.display_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#2D4A30]">
                      {entry.player?.display_name}
                      {isMe && <span className="ml-1 text-xs text-emerald-500">(You)</span>}
                    </p>
                    <p className="text-xs text-[#3D5A3E]">
                      {skillStars(entry.player?.skill_level)} {entry.games_played} games &middot;{" "}
                      {entry.wins}W/{entry.losses}L
                    </p>
                  </div>

                  {getStatDisplay(entry)}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
