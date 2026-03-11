"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Crown } from "lucide-react";
import { SPORT_LABELS } from "@/lib/types";
import { SportIcon } from "@/components/icons/SportIcon";
import { getSportColor } from "@/lib/design";
import type { Sport } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    sport: string;
    description: string | null;
    captain?: { id: string; name: string; avatar_url: string | null };
  };
  memberCount?: number;
  role?: string;
}

export function TeamCard({ team, memberCount, role }: TeamCardProps) {
  const sportColor = getSportColor(team.sport);
  const sportLabel = SPORT_LABELS[team.sport as keyof typeof SPORT_LABELS];

  return (
    <Link href={`/teams/${team.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "rounded-2xl border border-zinc-200 bg-white/80 p-4 transition-colors hover:border-zinc-200",
          "cursor-pointer"
        )}
      >
        <div className="mb-3 flex items-start justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${sportColor.primary}15` }}
          >
            <SportIcon sport={team.sport as Sport} className="w-6 h-6" />
          </div>
          {role === "captain" && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
              <Crown className="h-3 w-3" /> Captain
            </span>
          )}
        </div>

        <h3 className="mb-1 font-bold text-zinc-900 dark:text-zinc-100">{team.name}</h3>
        {team.description && (
          <p className="mb-3 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{team.description}</p>
        )}

        <div className="flex items-center justify-between text-sm">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${sportColor.primary}15`,
              color: sportColor.primary,
            }}
          >
            {sportLabel?.label ?? team.sport}
          </span>
          {memberCount !== undefined && (
            <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
              <Users className="h-3.5 w-3.5" />
              {memberCount}
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
