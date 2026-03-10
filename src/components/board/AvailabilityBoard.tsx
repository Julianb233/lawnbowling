"use client";

import { PlayerCard } from "./PlayerCard";
import type { Player } from "@/lib/types";

interface AvailabilityBoardProps {
  players: Player[];
  loading: boolean;
  onPickMe?: (player: Player) => void;
}

export function AvailabilityBoard({ players, loading, onPickMe }: AvailabilityBoardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-zinc-500">Loading players...</p>
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 py-16 text-center">
        <p className="text-4xl">🏓</p>
        <p className="mt-3 text-lg font-semibold text-zinc-700">No players available</p>
        <p className="mt-1 text-sm text-zinc-400">
          Check in to be the first on the board!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} onPickMe={onPickMe} />
      ))}
    </div>
  );
}
