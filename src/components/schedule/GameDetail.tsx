"use client";

import Link from "next/link";
import { SPORT_LABELS, type Sport, type ScheduledGame } from "@/lib/types";
import { RSVPButton } from "./RSVPButton";

interface GameDetailProps {
  game: ScheduledGame;
  currentPlayerId?: string;
}

export function GameDetail({ game, currentPlayerId }: GameDetailProps) {
  const sportInfo = SPORT_LABELS[game.sport as Sport];
  const goingRSVPs = game.rsvps?.filter((r) => r.status === "going") || [];
  const maybeRSVPs = game.rsvps?.filter((r) => r.status === "maybe") || [];
  const currentRSVP = game.rsvps?.find(
    (r) => r.player_id === currentPlayerId
  );

  const gameDate = new Date(game.scheduled_at);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{game.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-lg">
            {sportInfo?.emoji} {sportInfo?.label || game.sport}
          </span>
          {game.is_recurring && (
            <span className="text-xs text-blue-400 bg-blue-400/10 rounded-full px-2 py-0.5">
              Recurring: {game.recurrence_rule}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl glass p-4">
          <p className="text-xs text-zinc-500">Date</p>
          <p className="text-sm font-medium text-zinc-900 mt-1">
            {gameDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="rounded-xl glass p-4">
          <p className="text-xs text-zinc-500">Time</p>
          <p className="text-sm font-medium text-zinc-900 mt-1">
            {gameDate.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="rounded-xl glass p-4">
          <p className="text-xs text-zinc-500">Duration</p>
          <p className="text-sm font-medium text-zinc-900 mt-1">
            {game.duration_minutes} min
          </p>
        </div>
        <div className="rounded-xl glass p-4">
          <p className="text-xs text-zinc-500">Spots</p>
          <p className="text-sm font-medium text-zinc-900 mt-1">
            {goingRSVPs.length}/{game.max_players}
          </p>
        </div>
      </div>

      {game.description && (
        <div className="rounded-xl glass p-4">
          <p className="text-xs text-zinc-500 mb-1">Description</p>
          <p className="text-sm text-zinc-600">{game.description}</p>
        </div>
      )}

      {game.organizer && (
        <div className="rounded-xl glass p-4">
          <p className="text-xs text-zinc-500 mb-1">Organized by</p>
          <Link
            href={`/profile/${game.organizer.id}`}
            className="text-sm font-medium text-emerald-400 hover:underline"
          >
            {game.organizer.display_name}
          </Link>
        </div>
      )}

      {currentPlayerId && (
        <div className="rounded-xl glass p-4">
          <p className="text-xs text-zinc-500 mb-2">Your RSVP</p>
          <RSVPButton gameId={game.id} currentStatus={currentRSVP?.status} />
        </div>
      )}

      {/* Going */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Going ({goingRSVPs.length})
        </h3>
        {goingRSVPs.length === 0 ? (
          <p className="text-sm text-zinc-500">No one yet - be the first!</p>
        ) : (
          <div className="space-y-2">
            {goingRSVPs.map((rsvp) => (
              <Link
                key={rsvp.id}
                href={`/profile/${rsvp.player_id}`}
                className="flex items-center gap-3 rounded-xl glass p-3 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  {rsvp.player?.display_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="text-sm text-zinc-700">
                  {rsvp.player?.display_name || "Unknown"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Maybe */}
      {maybeRSVPs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Maybe ({maybeRSVPs.length})
          </h3>
          <div className="space-y-2">
            {maybeRSVPs.map((rsvp) => (
              <div
                key={rsvp.id}
                className="flex items-center gap-3 rounded-xl glass p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                  {rsvp.player?.display_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="text-sm text-zinc-600">
                  {rsvp.player?.display_name || "Unknown"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
