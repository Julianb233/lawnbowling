"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { cn } from "@/lib/utils";

interface PlayerBowlsStats {
  player_id: string;
  display_name: string;
  avatar_url: string | null;
  tournaments_played: number;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  total_shots_for: number;
  total_shots_against: number;
  shot_difference: number;
  total_ends_won: number;
  positions_played: Set<string>;
}

export default function BowlsStatsPage() {
  const [players, setPlayers] = useState<PlayerBowlsStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"wins" | "games" | "winrate" | "shots">("wins");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerBowlsStats | null>(null);

  const loadStats = useCallback(async () => {
    const supabase = createClient();

    // Get all lawn bowling tournament scores
    const { data: scores } = await supabase
      .from("tournament_scores")
      .select("tournament_id, round, rink, team_a_players, team_b_players, total_a, total_b, ends_won_a, ends_won_b, winner, is_finalized")
      .eq("is_finalized", true);

    if (!scores || scores.length === 0) {
      setLoading(false);
      return;
    }

    // Build per-player stats across all tournaments
    const statsMap = new Map<string, PlayerBowlsStats>();
    const tournamentsPerPlayer = new Map<string, Set<string>>();

    for (const score of scores) {
      // Process team A players
      if (score.team_a_players) {
        for (const p of score.team_a_players as { player_id: string; display_name: string }[]) {
          const existing = statsMap.get(p.player_id) ?? {
            player_id: p.player_id,
            display_name: p.display_name,
            avatar_url: null,
            tournaments_played: 0,
            games_played: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            win_rate: 0,
            total_shots_for: 0,
            total_shots_against: 0,
            shot_difference: 0,
            total_ends_won: 0,
            positions_played: new Set<string>(),
          };

          existing.games_played++;
          existing.total_shots_for += score.total_a;
          existing.total_shots_against += score.total_b;
          existing.total_ends_won += score.ends_won_a;
          if (score.winner === "team_a") existing.wins++;
          else if (score.winner === "team_b") existing.losses++;
          else if (score.winner === "draw") existing.draws++;

          statsMap.set(p.player_id, existing);

          // Track tournaments
          const tSet = tournamentsPerPlayer.get(p.player_id) ?? new Set<string>();
          tSet.add(score.tournament_id);
          tournamentsPerPlayer.set(p.player_id, tSet);
        }
      }

      // Process team B players
      if (score.team_b_players) {
        for (const p of score.team_b_players as { player_id: string; display_name: string }[]) {
          const existing = statsMap.get(p.player_id) ?? {
            player_id: p.player_id,
            display_name: p.display_name,
            avatar_url: null,
            tournaments_played: 0,
            games_played: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            win_rate: 0,
            total_shots_for: 0,
            total_shots_against: 0,
            shot_difference: 0,
            total_ends_won: 0,
            positions_played: new Set<string>(),
          };

          existing.games_played++;
          existing.total_shots_for += score.total_b;
          existing.total_shots_against += score.total_a;
          existing.total_ends_won += score.ends_won_b;
          if (score.winner === "team_b") existing.wins++;
          else if (score.winner === "team_a") existing.losses++;
          else if (score.winner === "draw") existing.draws++;

          statsMap.set(p.player_id, existing);

          const tSet = tournamentsPerPlayer.get(p.player_id) ?? new Set<string>();
          tSet.add(score.tournament_id);
          tournamentsPerPlayer.set(p.player_id, tSet);
        }
      }
    }

    // Finalize computed fields
    const allPlayers: PlayerBowlsStats[] = [];
    for (const [playerId, stat] of statsMap.entries()) {
      stat.tournaments_played = tournamentsPerPlayer.get(playerId)?.size ?? 0;
      stat.win_rate = stat.games_played > 0 ? Math.round((stat.wins / stat.games_played) * 100) : 0;
      stat.shot_difference = stat.total_shots_for - stat.total_shots_against;
      allPlayers.push(stat);
    }

    setPlayers(allPlayers);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const sortedPlayers = [...players].sort((a, b) => {
    switch (sortBy) {
      case "wins": return b.wins - a.wins || b.shot_difference - a.shot_difference;
      case "games": return b.games_played - a.games_played;
      case "winrate": return b.win_rate - a.win_rate || b.games_played - a.games_played;
      case "shots": return b.shot_difference - a.shot_difference;
      default: return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#1a3d28]/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                Player Statistics
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Lawn bowls career stats
              </p>
            </div>
            <Link
              href="/bowls"
              className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 min-h-[44px] touch-manipulation inline-flex items-center"
            >
              Back to Bowls
            </Link>
          </div>

          {/* Sort options */}
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {(
              [
                { key: "wins" as const, label: "Most Wins" },
                { key: "games" as const, label: "Most Games" },
                { key: "winrate" as const, label: "Win Rate" },
                { key: "shots" as const, label: "Shot Diff" },
              ] as const
            ).map((option) => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap min-h-[40px] touch-manipulation ${
                  sortBy === option.key
                    ? "bg-[#1B5E20] text-white"
                    : "text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {sortedPlayers.length === 0 ? (
          <div className="rounded-2xl bg-white border border-zinc-200 p-12 text-center">
            <p className="text-lg font-semibold text-zinc-500">
              No player stats yet
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Stats will appear once tournament scores are finalized
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPlayers.map((player, idx) => {
              const initials = player.display_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <motion.button
                  key={player.player_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() =>
                    setSelectedPlayer(
                      selectedPlayer?.player_id === player.player_id
                        ? null
                        : player
                    )
                  }
                  className="w-full rounded-2xl bg-white border border-zinc-200 p-4 text-left transition-all hover:border-zinc-300 hover:shadow-sm touch-manipulation"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                      <span className={cn(
                        "text-lg font-black tabular-nums",
                        idx === 0 ? "text-amber-500" :
                        idx === 1 ? "text-zinc-400" :
                        idx === 2 ? "text-amber-700" :
                        "text-zinc-300"
                      )}>
                        {idx + 1}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1B5E20] to-[#1B5E20] text-sm font-bold text-white">
                      {initials}
                    </div>

                    {/* Name and quick stats */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-zinc-900 truncate">
                        {player.display_name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {player.tournaments_played} tournament{player.tournaments_played !== 1 ? "s" : ""} &middot;{" "}
                        {player.games_played} game{player.games_played !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Key stat */}
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-[#1B5E20]">{player.wins}</p>
                      <p className="text-sm text-zinc-500">
                        {player.win_rate}% win rate
                      </p>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {selectedPlayer?.player_id === player.player_id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 border-t border-zinc-100 pt-4"
                    >
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl bg-[#1B5E20]/5 p-3 text-center">
                          <p className="text-2xl font-black text-[#1B5E20]">{player.wins}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Wins</p>
                        </div>
                        <div className="rounded-xl bg-red-50 p-3 text-center">
                          <p className="text-2xl font-black text-red-500">{player.losses}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Losses</p>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-3 text-center">
                          <p className="text-2xl font-black text-amber-600">{player.draws}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Draws</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-center">
                          <p className="text-2xl font-black text-[#1B5E20]">{player.win_rate}%</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Win Rate</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-zinc-50 p-3 text-center">
                          <p className="text-lg font-black text-zinc-700 tabular-nums">{player.total_shots_for}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Shots For</p>
                        </div>
                        <div className="rounded-xl bg-zinc-50 p-3 text-center">
                          <p className="text-lg font-black text-zinc-700 tabular-nums">{player.total_shots_against}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Shots Against</p>
                        </div>
                        <div className="rounded-xl bg-zinc-50 p-3 text-center">
                          <p className={cn(
                            "text-lg font-black tabular-nums",
                            player.shot_difference > 0 ? "text-[#1B5E20]" :
                            player.shot_difference < 0 ? "text-red-500" : "text-zinc-400"
                          )}>
                            {player.shot_difference > 0 ? "+" : ""}{player.shot_difference}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Shot Diff</p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-center">
                        <p className="text-lg font-black text-purple-600 tabular-nums">{player.total_ends_won}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Ends Won</p>
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
