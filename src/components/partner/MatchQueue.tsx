"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { SPORT_LABELS } from "@/lib/types";
import type { Sport } from "@/lib/types";

interface MatchQueuePlayer {
  player_id: string;
  team: number | null;
  player: {
    id: string;
    display_name?: string;
    name?: string;
    avatar_url: string | null;
    skill_level: string;
  };
}

interface QueuedMatch {
  id: string;
  sport: string;
  status: string;
  court_id: string | null;
  created_at: string;
  match_players: MatchQueuePlayer[];
  courts?: { name: string } | null;
}

function PlayerPill({ player }: { player: MatchQueuePlayer["player"] }) {
  const displayName = player.display_name || player.name || "Unknown";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2">
      {player.avatar_url ? (
        <img
          src={player.avatar_url}
          alt={displayName}
          className="h-8 w-8 rounded-full object-cover ring-1 ring-zinc-200"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs font-bold text-white ring-1 ring-zinc-200">
          {initials}
        </div>
      )}
      <span className="text-sm font-medium text-zinc-900 truncate">{displayName}</span>
    </div>
  );
}

export function MatchQueue() {
  const [matches, setMatches] = useState<QueuedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchMatches = useCallback(async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("*, match_players(player_id, team, player:players(id, display_name, name, avatar_url, skill_level)), courts(name)")
      .eq("status", "queued")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMatches(data as unknown as QueuedMatch[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMatches();

    const channel = supabase
      .channel("match-queue")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMatches, supabase]);

  if (loading) {
    return (
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Ready to Play
        </h2>
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Ready to Play ({matches.length})
      </h2>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-3xl">{"\u{1F4CB}"}</p>
          <p className="mt-2 text-sm text-zinc-400">
            No pairs waiting yet
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match, index) => {
            const players = match.match_players;
            const player1 = players[0]?.player;
            const player2 = players[1]?.player;
            const sportInfo = SPORT_LABELS[match.sport as Sport];

            return (
              <div
                key={match.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-emerald-600">
                    #{index + 1} in queue
                  </span>
                  <span className="text-xs text-zinc-400">
                    {sportInfo?.emoji || ""} {sportInfo?.label || match.sport}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {player1 && <PlayerPill player={player1} />}
                  <span className="text-xs font-bold text-zinc-300">+</span>
                  {player2 && <PlayerPill player={player2} />}
                </div>

                <div className="mt-2 text-xs text-zinc-400">
                  {match.courts
                    ? `Assigned to ${match.courts.name}`
                    : "Waiting for court"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
