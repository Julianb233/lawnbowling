"use client";

import { cn } from "@/lib/utils";
import { SPORT_LABELS, SKILL_LABELS } from "@/lib/types";
import type { Player, Sport } from "@/lib/types";

interface PlayerCardProps {
  player: Player;
  onPickMe?: (player: Player) => void;
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

function SkillStars({ level }: { level: string }) {
  const info = SKILL_LABELS[level as keyof typeof SKILL_LABELS];
  if (!info) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400" title={info.label} role="img" aria-label={`Skill: ${info.label}`}>
      {Array.from({ length: info.stars }, (_, i) => (
        <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-sm font-bold text-white ring-2 ring-white shadow">
      {initials}
    </div>
  );
}

export function PlayerCard({ player, onPickMe }: PlayerCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        "lg:p-5"
      )}
    >
      {/* Player info */}
      <div className="flex items-start gap-3">
        <Avatar name={player.name} url={player.avatar_url} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-zinc-900">{player.name}</h3>
          <div className="mt-0.5 flex items-center gap-2">
            <SkillStars level={player.skill_level} />
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {player.sports.map((sport) => {
              const info = SPORT_LABELS[sport as Sport];
              return info ? (
                <span key={sport} className="text-base" title={info.label}>
                  {info.emoji}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Check-in time */}
      <p className="mt-2 text-xs text-zinc-400">
        Checked in {timeAgo(player.checked_in_at)}
      </p>

      {/* Pick Me button */}
      <button
        onClick={() => onPickMe?.(player)}
        aria-label={`Pick ${player.name} as partner`}
        className={cn(
          "mt-3 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all",
          "hover:bg-emerald-600 active:scale-95",
          "touch-manipulation"
        )}
      >
        PICK ME
      </button>
    </div>
  );
}
