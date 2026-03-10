"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { SPORT_LABELS } from "@/lib/types";
import { getSportColor } from "@/lib/design";
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
          className="h-8 w-8 rounded-full object-cover ring-1 ring-zinc-600"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs font-bold text-white ring-1 ring-zinc-600">
          {initials}
        </div>
      )}
      <span className="text-sm font-medium text-zinc-200 truncate">{displayName}</span>
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
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Ready to Play
        </h2>
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl p-3 skeleton h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Ready to Play ({matches.length})
      </h2>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <motion.p
            className="text-3xl"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {"\u{1F4CB}"}
          </motion.p>
          <p className="mt-2 text-sm text-zinc-500">
            No pairs waiting yet
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {matches.map((match, index) => {
              const players = match.match_players;
              const player1 = players[0]?.player;
              const player2 = players[1]?.player;
              const sportInfo = SPORT_LABELS[match.sport as Sport];
              const sportColor = getSportColor(match.sport);

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl glass-light p-3"
                  style={{ borderLeft: `3px solid ${sportColor.primary}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-bold tracking-wider"
                      style={{ color: sportColor.primary }}
                    >
                      #{index + 1} in queue
                    </span>
                    <span className="text-xs text-zinc-500">
                      {sportInfo?.emoji || ""} {sportInfo?.label || match.sport}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {player1 && <PlayerPill player={player1} />}
                    <span className="text-xs font-bold text-zinc-600">VS</span>
                    {player2 && <PlayerPill player={player2} />}
                  </div>

                  <div className="mt-2 text-xs text-zinc-500">
                    {match.courts
                      ? `Assigned to ${match.courts.name}`
                      : (
                        <span className="inline-flex items-center gap-1">
                          <span className="live-dot !h-1.5 !w-1.5" />
                          Waiting for court
                        </span>
                      )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
