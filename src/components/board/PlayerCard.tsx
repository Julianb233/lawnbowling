"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPORT_LABELS, SKILL_LABELS } from "@/lib/types";
import { getSportColor } from "@/lib/design";
import { SportIcon } from "@/components/icons/SportIcon";
import type { Player, Sport } from "@/lib/types";

interface PlayerCardProps {
  player: Player;
  onPickMe?: (player: Player) => void;
  index?: number;
  isPending?: boolean;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function SkillStars({ level, index }: { level: string; index?: number }) {
  const info = SKILL_LABELS[level as keyof typeof SKILL_LABELS];
  if (!info) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400" title={info.label} role="img" aria-label={`Skill: ${info.label}`}>
      {Array.from({ length: info.stars }, (_, i) => (
        <motion.svg
          key={i}
          className="h-4 w-4 fill-current"
          viewBox="0 0 20 20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: (index ?? 0) * 0.08 + i * 0.1, type: "spring", stiffness: 400 }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </motion.svg>
      ))}
    </span>
  );
}

function Avatar({ name, url, primarySport }: { name: string; url: string | null; primarySport?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sportColor = primarySport ? getSportColor(primarySport) : getSportColor("pickleball");

  if (url) {
    return (
      <div className="relative">
        <img
          src={url}
          alt={name}
          className={cn("h-12 w-12 rounded-full object-cover ring-2 shadow-lg", sportColor.ring)}
        />
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-[#1a3d28]" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ring-2 shadow-lg",
        `bg-gradient-to-br ${sportColor.gradient}`,
        sportColor.ring
      )}>
        {initials}
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-[#1a3d28]" />
    </div>
  );
}

export function PlayerCard({ player, onPickMe, index = 0, isPending = false }: PlayerCardProps) {
  const primarySport = player.sports[0];
  const sportColor = primarySport ? getSportColor(primarySport) : getSportColor("pickleball");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative flex flex-col rounded-2xl p-4 transition-all duration-200 cursor-pointer touch-manipulation",
        "glass",
        "hover:border-zinc-300 dark:hover:border-white/20",
        "lg:p-5"
      )}
      style={{
        boxShadow: `0 0 0 rgba(0,0,0,0)`,
      }}
      onHoverStart={(e) => {
        const el = e.target as HTMLElement;
        if (el.closest('.group')) {
          el.closest('.group')!.setAttribute('style', `box-shadow: 0 0 25px ${sportColor.glow}, 0 4px 20px rgba(0,0,0,0.3)`);
        }
      }}
      onHoverEnd={(e) => {
        const el = e.target as HTMLElement;
        if (el.closest('.group')) {
          el.closest('.group')!.setAttribute('style', '');
        }
      }}
    >
      {/* Sport accent line */}
      <div
        className="absolute left-0 top-4 h-8 w-1 rounded-r-full opacity-60 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: sportColor.primary }}
      />

      {/* Pending request indicator */}
      {isPending && (
        <div className="absolute right-3 top-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending
          </span>
        </div>
      )}

      {/* Player info */}
      <div className="flex items-start gap-3">
        <Avatar name={player.display_name} url={player.avatar_url} primarySport={primarySport} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">{player.display_name}</h3>
          <div className="mt-0.5 flex items-center gap-2">
            <SkillStars level={player.skill_level} index={index} />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {player.sports.map((sport, i) => {
              const info = SPORT_LABELS[sport as Sport];
              return info ? (
                <motion.span
                  key={sport}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    getSportColor(sport).bg,
                    "text-zinc-600 dark:text-zinc-400"
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08 + i * 0.05 + 0.2 }}
                >
                  <SportIcon sport={sport as Sport} className="w-3 h-3" />
                  <span className="hidden sm:inline">{info.short}</span>
                </motion.span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Check-in time */}
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Checked in {timeAgo(player.checked_in_at)}
      </p>

      {/* Pick Me button */}
      <motion.button
        onClick={() => !isPending && onPickMe?.(player)}
        disabled={isPending}
        aria-label={isPending ? `Request sent to ${player.display_name}` : `Pick ${player.display_name} as partner`}
        whileHover={isPending ? {} : { scale: 1.02 }}
        whileTap={isPending ? {} : { scale: 0.95 }}
        className={cn(
          "mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all btn-press min-h-[44px]",
          `bg-gradient-to-r ${sportColor.gradient}`,
          "hover:shadow-xl",
          "touch-manipulation",
          isPending && "opacity-60 cursor-not-allowed"
        )}
      >
        {isPending ? "REQUEST SENT" : "PICK ME"}
      </motion.button>
    </motion.div>
  );
}
