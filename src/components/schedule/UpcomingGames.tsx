"use client";

import type { ScheduledGame } from "@/lib/types";
import { GameCard } from "./GameCard";

interface UpcomingGamesProps {
  games: ScheduledGame[];
  currentPlayerId?: string;
}

export function UpcomingGames({ games, currentPlayerId }: UpcomingGamesProps) {
  if (games.length === 0) {
    return (
      <div className="rounded-2xl glass p-8 text-center">
        <p className="text-3xl mb-2">{"\uD83D\uDCC5"}</p>
        <p className="text-zinc-400">No upcoming games. Schedule one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          currentPlayerId={currentPlayerId}
        />
      ))}
    </div>
  );
}
