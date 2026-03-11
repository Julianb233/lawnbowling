"use client";

import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Flame } from "lucide-react";
import { SPORT_LABELS } from "@/lib/types";
import { SportIcon } from "@/components/icons/SportIcon";
import type { PlayerStats, Sport } from "@/lib/types";

interface PlayerStatsCardProps {
  stats: PlayerStats | null;
}

export function PlayerStatsCard({ stats }: PlayerStatsCardProps) {
  if (!stats) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 text-center">
        <Target className="mx-auto mb-2 h-10 w-10 text-zinc-700" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No stats yet. Play some games!</p>
      </div>
    );
  }

  const winRateAngle = (stats.win_rate / 100) * 360;
  const circumference = 2 * Math.PI * 38;
  const strokeDasharray = `${(stats.win_rate / 100) * circumference} ${circumference}`;

  const statItems = [
    { label: "Played", value: stats.games_played, icon: Target, color: "text-blue-400" },
    { label: "Wins", value: stats.wins, icon: Trophy, color: "text-[#1B5E20]" },
    { label: "Losses", value: stats.losses, icon: TrendingUp, color: "text-red-400" },
  ];

  const sportLabel = stats.favorite_sport
    ? SPORT_LABELS[stats.favorite_sport as keyof typeof SPORT_LABELS]
    : null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6">
      {/* Win rate circle */}
      <div className="mb-6 flex items-center justify-center">
        <div className="relative">
          <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
            <circle
              cx="50" cy="50" r="38"
              fill="none"
              stroke="rgb(39 39 42)"
              strokeWidth="8"
            />
            <motion.circle
              cx="50" cy="50" r="38"
              fill="none"
              stroke="rgb(16 185 129)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{Math.round(stats.win_rate)}%</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Win Rate</span>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="rounded-xl bg-zinc-100 p-3 text-center">
            <item.icon className={`mx-auto mb-1 h-4 w-4 ${item.color}`} />
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{item.value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Favorite sport */}
      {sportLabel && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-zinc-50 py-2 text-sm text-zinc-400">
          <Flame className="h-4 w-4 text-amber-400" />
          Favorite: <SportIcon sport={stats.favorite_sport as Sport} className="w-4 h-4 inline-block" /> {sportLabel.label}
        </div>
      )}
    </div>
  );
}
