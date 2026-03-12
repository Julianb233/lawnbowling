"use client";

import { Trophy, Target, TrendingUp, Flame, Users } from "lucide-react";
import { SPORT_LABELS } from "@/lib/types";
import { SportIcon } from "@/components/icons/SportIcon";
import type { PlayerStats, FavoritePartner, Sport } from "@/lib/types";
import * as Avatar from "@radix-ui/react-avatar";
import Link from "next/link";

interface ProfileStatsSectionProps {
  stats: PlayerStats | null;
  favoritePartners: FavoritePartner[];
}

export function ProfileStatsSection({ stats, favoritePartners }: ProfileStatsSectionProps) {
  return (
    <div className="space-y-4">
      {/* Game Stats */}
      <div>
        <h2 className="mb-2 text-sm font-medium text-[#3D5A3E]">Game Stats</h2>
        {stats && stats.games_played > 0 ? (
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <Target className="mx-auto mb-1 h-4 w-4 text-blue-400" />
                <p className="text-lg font-bold text-[#0A2E12]">{stats.games_played}</p>
                <p className="text-xs text-[#3D5A3E]">Played</p>
              </div>
              <div>
                <Trophy className="mx-auto mb-1 h-4 w-4 text-[#1B5E20]" />
                <p className="text-lg font-bold text-[#0A2E12]">{stats.wins}</p>
                <p className="text-xs text-[#3D5A3E]">Wins</p>
              </div>
              <div>
                <TrendingUp className="mx-auto mb-1 h-4 w-4 text-red-400" />
                <p className="text-lg font-bold text-[#0A2E12]">{stats.losses}</p>
                <p className="text-xs text-[#3D5A3E]">Losses</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="text-sm font-semibold text-[#2D4A30]">
                {Math.round(stats.win_rate)}% Win Rate
              </span>
              {stats.favorite_sport && (
                <>
                  <span className="text-[#3D5A3E]">|</span>
                  <span className="flex items-center gap-1 text-sm text-[#3D5A3E]">
                    <Flame className="h-3 w-3 text-amber-400" />
                    <SportIcon sport={stats.favorite_sport as Sport} className="w-3.5 h-3.5 inline-block" />{" "}
                    {SPORT_LABELS[stats.favorite_sport as keyof typeof SPORT_LABELS]?.label ?? stats.favorite_sport}
                  </span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4 text-center">
            <Target className="mx-auto mb-1 h-8 w-8 text-[#3D5A3E]" />
            <p className="text-sm text-[#3D5A3E]">No games played yet</p>
          </div>
        )}
      </div>

      {/* Favorite Partners */}
      <div>
        <h2 className="mb-2 text-sm font-medium text-[#3D5A3E]">Favorite Partners</h2>
        {favoritePartners.length > 0 ? (
          <div className="space-y-2">
            {favoritePartners.map((fp) => {
              const initials = fp.partner?.display_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) ?? "?";

              return (
                <Link
                  key={fp.partner_id}
                  href={`/profile/${fp.partner_id}`}
                  className="flex items-center gap-3 rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-3 transition-colors hover:bg-[#0A2E12]/5"
                >
                  <Avatar.Root className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#0A2E12]/5">
                    <Avatar.Image
                      src={fp.partner?.avatar_url ?? undefined}
                      alt={fp.partner?.display_name ?? ""}
                      className="h-full w-full object-cover"
                    />
                    <Avatar.Fallback className="flex h-full w-full items-center justify-center text-xs font-bold text-[#3D5A3E]">
                      {initials}
                    </Avatar.Fallback>
                  </Avatar.Root>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#0A2E12]">
                      {fp.partner?.display_name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-[#3D5A3E]">
                      {fp.games_together} game{fp.games_together !== 1 ? "s" : ""} &middot;{" "}
                      {Math.round(fp.win_rate_together)}% win rate
                    </p>
                  </div>

                  <Trophy className="h-4 w-4 text-[#1B5E20]" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4 text-center">
            <Users className="mx-auto mb-1 h-8 w-8 text-[#3D5A3E]" />
            <p className="text-sm text-[#3D5A3E]">No partners yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
