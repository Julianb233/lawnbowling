"use client";

import Link from "next/link";
import { SPORT_LABELS, type Sport, type ScheduledGame } from "@/lib/types";
import { RSVPButton } from "./RSVPButton";

interface GameCardProps {
  game: ScheduledGame;
  currentPlayerId?: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function GameCard({ game, currentPlayerId }: GameCardProps) {
  const sportInfo = SPORT_LABELS[game.sport as Sport];
  const goingCount =
    game.rsvps?.filter((r) => r.status === "going").length || 0;
  const currentRSVP = game.rsvps?.find(
    (r) => r.player_id === currentPlayerId
  );
  const spotsLeft = game.max_players - goingCount;

  return (
    <div className="rounded-2xl glass p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <Link
            href={`/schedule/${game.id}`}
            className="text-base font-semibold text-zinc-100 hover:text-emerald-400 transition-colors"
          >
            {game.title}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">
              {sportInfo?.emoji || ""} {sportInfo?.label || game.sport}
            </span>
            {game.is_recurring && (
              <span className="text-xs text-blue-400 bg-blue-400/10 rounded-full px-2 py-0.5">
                Recurring
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-emerald-400">
            {formatDate(game.scheduled_at)}
          </p>
          <p className="text-xs text-zinc-400">{formatTime(game.scheduled_at)}</p>
        </div>
      </div>

      {game.description && (
        <p className="text-sm text-zinc-400 mb-3">{game.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            {goingCount}/{game.max_players} players
          </span>
          {spotsLeft <= 2 && spotsLeft > 0 && (
            <span className="text-xs text-amber-400">
              {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
            </span>
          )}
          {spotsLeft <= 0 && (
            <span className="text-xs text-red-400">Full</span>
          )}
        </div>
        {currentPlayerId && (
          <RSVPButton gameId={game.id} currentStatus={currentRSVP?.status} />
        )}
      </div>
    </div>
  );
}
