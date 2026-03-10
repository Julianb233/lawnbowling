"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Trophy, X as XIcon } from "lucide-react";
import { SPORT_LABELS } from "@/lib/types";
import { getSportColor, ANIMATIONS } from "@/lib/design";
import { cn } from "@/lib/utils";

interface MatchHistoryEntry {
  id: string;
  sport: string;
  started_at: string | null;
  ended_at: string | null;
  courts: { name: string } | null;
  match_players: {
    player_id: string;
    team: number | null;
    players: { id: string; name: string; avatar_url: string | null };
  }[];
  match_results: {
    winner_team: number | null;
    team1_score: number | null;
    team2_score: number | null;
  }[];
}

interface MatchHistoryProps {
  playerId: string;
}

export function MatchHistory({ playerId }: MatchHistoryProps) {
  const [matches, setMatches] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/stats/${playerId}?history=true`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data.history ?? []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [playerId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-800/50" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-zinc-600">
        No match history yet
      </div>
    );
  }

  return (
    <motion.div className="space-y-2" {...ANIMATIONS.staggerChildren} initial="initial" animate="animate">
      {matches.map((match) => {
        const sportLabel = SPORT_LABELS[match.sport as keyof typeof SPORT_LABELS];
        const sportColor = getSportColor(match.sport);
        const result = match.match_results?.[0];
        const myTeam = match.match_players.find((mp) => mp.player_id === playerId)?.team;
        const isWin = result && result.winner_team !== null && myTeam === result.winner_team;
        const isLoss = result && result.winner_team !== null && myTeam !== null && myTeam !== result.winner_team;

        return (
          <motion.div
            key={match.id}
            {...ANIMATIONS.fadeInUp}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${sportColor.primary}15`,
                    color: sportColor.primary,
                  }}
                >
                  {sportLabel?.emoji} {sportLabel?.short ?? match.sport}
                </span>
                {isWin && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <Trophy className="h-3 w-3" /> WIN
                  </span>
                )}
                {isLoss && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
                    <XIcon className="h-3 w-3" /> LOSS
                  </span>
                )}
              </div>
              {result && result.team1_score !== null && (
                <span className="text-sm font-bold text-zinc-300">
                  {result.team1_score} - {result.team2_score}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-500">
              {match.ended_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(match.ended_at).toLocaleDateString()}
                </span>
              )}
              {match.courts?.name && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {match.courts.name}
                </span>
              )}
            </div>

            {/* Players */}
            <div className="mt-2 flex -space-x-1">
              {match.match_players.slice(0, 6).map((mp) => (
                <div
                  key={mp.player_id}
                  className={cn(
                    "h-6 w-6 overflow-hidden rounded-full border-2",
                    mp.player_id === playerId ? "border-emerald-500" : "border-zinc-900"
                  )}
                >
                  {mp.players?.avatar_url ? (
                    <img src={mp.players.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-[10px] text-zinc-500">
                      {mp.players?.name?.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
