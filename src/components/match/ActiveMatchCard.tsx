"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface ActiveMatch {
  id: string;
  status: string;
  started_at: string | null;
  courts?: { name: string } | null;
  match_players: Array<{
    player_id: string;
    team: number | null;
    player: {
      id: string;
      display_name: string;
      avatar_url: string | null;
    };
  }>;
  match_results?: Array<{
    team1_score: number | null;
    team2_score: number | null;
  }>;
}

interface ActiveMatchCardProps {
  playerId: string;
}

export function ActiveMatchCard({ playerId }: ActiveMatchCardProps) {
  const [activeMatch, setActiveMatch] = useState<ActiveMatch | null>(null);
  const supabase = createClient();

  const fetchActiveMatch = useCallback(async () => {
    // Find matches where this player is participating and status is "playing"
    const { data: matchPlayerData } = await supabase
      .from("match_players")
      .select("match_id")
      .eq("player_id", playerId);

    if (!matchPlayerData || matchPlayerData.length === 0) return;

    const matchIds = matchPlayerData.map((mp) => mp.match_id);

    const { data } = await supabase
      .from("matches")
      .select(
        "id, status, started_at, courts(name), match_players(player_id, team, player:players(id, display_name, avatar_url)), match_results(team1_score, team2_score)"
      )
      .in("id", matchIds)
      .eq("status", "playing")
      .limit(1)
      .single();

    if (data) {
      setActiveMatch(data as unknown as ActiveMatch);
    } else {
      setActiveMatch(null);
    }
  }, [playerId, supabase]);

  useEffect(() => {
    fetchActiveMatch();

    const channel = supabase
      .channel(`active-match-${playerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => fetchActiveMatch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActiveMatch, supabase, playerId]);

  if (!activeMatch) return null;

  const result = activeMatch.match_results?.[0];
  const team1Score = result?.team1_score ?? 0;
  const team2Score = result?.team2_score ?? 0;

  const team1Players = activeMatch.match_players.filter((p) => p.team === 1);
  const team2Players = activeMatch.match_players.filter((p) => p.team === 2);

  const team1Name =
    team1Players.length > 0
      ? team1Players
          .map((p) => p.player.display_name.split(" ")[0])
          .join(" & ")
      : "Team 1";
  const team2Name =
    team2Players.length > 0
      ? team2Players
          .map((p) => p.player.display_name.split(" ")[0])
          .join(" & ")
      : "Team 2";

  return (
    <Link href={`/match/${activeMatch.id}`}>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="rounded-2xl p-4 shadow-md cursor-pointer transition hover:shadow-lg"
        style={{
          background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Play className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Your Active Match
              </p>
              <p className="text-xs text-white/70">
                {activeMatch.courts?.name ?? "Tap to view"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Score */}
            <div className="text-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white tabular-nums">
                  {team1Score}
                </span>
                <span className="text-sm text-white/50">-</span>
                <span className="text-2xl font-bold text-white tabular-nums">
                  {team2Score}
                </span>
              </div>
              <p className="text-[10px] text-white/60">
                {team1Name} vs {team2Name}
              </p>
            </div>

            <ArrowRight className="h-5 w-5 text-white/60" />
          </div>
        </div>

        {/* Live indicator */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-200" />
          </span>
          <span className="text-xs font-medium text-white/80">Live</span>
        </div>
      </motion.div>
    </Link>
  );
}
