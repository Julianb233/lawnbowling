"use client";

import { MatchTimer } from "./MatchTimer";
import { Button } from "@/components/ui/button";

interface MatchPlayer {
  player_id: string;
  team: number | null;
  players: { display_name: string; avatar_url: string | null };
}

interface CourtCardProps {
  court: {
    id: string;
    name: string;
    sport: string;
    is_available: boolean;
  };
  activeMatch?: {
    id: string;
    status: "queued" | "playing" | "completed";
    started_at: string | null;
    match_players: MatchPlayer[];
  } | null;
  queuedMatch?: {
    id: string;
    match_players: MatchPlayer[];
  } | null;
  onAssign?: (courtId: string) => void;
  onComplete?: (matchId: string) => void;
  durationMinutes?: number;
}

function StatusIndicator({
  status,
}: {
  status: "open" | "queued" | "playing";
}) {
  const config = {
    open: { color: "bg-[#1B5E20]", label: "Open" },
    queued: { color: "bg-yellow-500", label: "Queued" },
    playing: { color: "bg-red-500", label: "Playing" },
  };
  const { color, label } = config[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function PlayerList({ players }: { players: MatchPlayer[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {players.map((mp) => (
        <span
          key={mp.player_id}
          className="inline-flex items-center rounded-md bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400"
        >
          {mp.players.display_name}
        </span>
      ))}
    </div>
  );
}

export function CourtCard({
  court,
  activeMatch,
  queuedMatch,
  onAssign,
  onComplete,
  durationMinutes,
}: CourtCardProps) {
  const status: "open" | "queued" | "playing" = activeMatch?.status === "playing"
    ? "playing"
    : queuedMatch
      ? "queued"
      : "open";

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{court.name}</h3>
          <p className="text-xs text-zinc-500 capitalize">
            {court.sport.replace("_", " ")}
          </p>
        </div>
        <StatusIndicator status={status} />
      </div>

      {activeMatch?.status === "playing" && (
        <div className="space-y-2">
          <PlayerList players={activeMatch.match_players} />
          {activeMatch.started_at && (
            <MatchTimer
              startedAt={activeMatch.started_at}
              durationMinutes={durationMinutes}
            />
          )}
          {onComplete && (
            <Button
              size="sm"
              variant="destructive"
              className="w-full mt-2"
              onClick={() => onComplete(activeMatch.id)}
            >
              End Match
            </Button>
          )}
        </div>
      )}

      {status === "queued" && queuedMatch && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Next up:</p>
          <PlayerList players={queuedMatch.match_players} />
          {onAssign && (
            <Button
              size="sm"
              className="w-full mt-2"
              onClick={() => onAssign(court.id)}
            >
              Assign Court
            </Button>
          )}
        </div>
      )}

      {status === "open" && (
        <p className="text-sm text-zinc-600 italic">Available</p>
      )}
    </div>
  );
}
