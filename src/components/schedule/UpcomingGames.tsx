"use client";

import type { ScheduledGame } from "@/lib/types";
import { GameCard } from "./GameCard";
import { Calendar } from "lucide-react";

interface UpcomingGamesProps {
  games: ScheduledGame[];
  currentPlayerId?: string;
}

export function UpcomingGames({ games, currentPlayerId }: UpcomingGamesProps) {
  if (games.length === 0) {
    return (
      <div className="rounded-2xl glass p-8 text-center">
        <Calendar className="w-8 h-8 mx-auto mb-2 text-zinc-400" strokeWidth={1.5} />
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
