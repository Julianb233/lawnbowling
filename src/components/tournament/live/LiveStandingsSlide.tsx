"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StandingData {
  player_id: string;
  wins: number;
  losses: number;
  eliminated: boolean;
  player: { id: string; display_name: string; avatar_url: string | null; skill_level?: string };
}

interface MatchData {
  id: string;
  round: number;
  winner_id: string | null;
  status: string;
  player1_id: string | null;
  player2_id: string | null;
}

interface LiveStandingsSlideProps {
  standings: StandingData[];
  matches: MatchData[];
  tournamentName: string;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function LiveStandingsSlide({ standings, matches, tournamentName }: LiveStandingsSlideProps) {
  // Sort by wins desc, losses asc
  const sorted = useMemo(
    () =>
      [...standings].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
      }),
    [standings],
  );

  // Calculate active match count per player
  const activeMatchPlayers = useMemo(() => {
    const set = new Set<string>();
    for (const m of matches) {
      if (m.status === "in_progress") {
        if (m.player1_id) set.add(m.player1_id);
        if (m.player2_id) set.add(m.player2_id);
      }
    }
    return set;
  }, [matches]);

  if (sorted.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p
          className="font-bold text-[#3D5A3E]"
          style={{ fontSize: "clamp(1.25rem, 2vw, 2rem)" }}
        >
          No standings available yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <h2
        className="mb-[clamp(0.5rem,1vh,1rem)] font-black uppercase tracking-wider text-emerald-400"
        style={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)" }}
      >
        {tournamentName} — Standings
      </h2>

      <div className="flex-1 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-[#0A2E12]/50">
              <th
                className="px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.4rem,0.8vh,0.75rem)] text-left font-bold uppercase tracking-wider text-[#3D5A3E] w-[clamp(2rem,4vw,3rem)]"
                style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)" }}
              >
                #
              </th>
              <th
                className="px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.4rem,0.8vh,0.75rem)] text-left font-bold uppercase tracking-wider text-[#3D5A3E]"
                style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)" }}
              >
                Player
              </th>
              <th
                className="px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.4rem,0.8vh,0.75rem)] text-center font-bold uppercase tracking-wider text-[#3D5A3E] w-[clamp(3rem,5vw,4rem)]"
                style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)" }}
              >
                W
              </th>
              <th
                className="px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.4rem,0.8vh,0.75rem)] text-center font-bold uppercase tracking-wider text-[#3D5A3E] w-[clamp(3rem,5vw,4rem)]"
                style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)" }}
              >
                L
              </th>
              <th
                className="px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.4rem,0.8vh,0.75rem)] text-center font-bold uppercase tracking-wider text-[#3D5A3E] w-[clamp(4rem,7vw,6rem)]"
                style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)" }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const isPlaying = activeMatchPlayers.has(s.player_id);
              const winRate = s.wins + s.losses > 0
                ? Math.round((s.wins / (s.wins + s.losses)) * 100)
                : 0;

              return (
                <tr
                  key={s.player_id}
                  className={cn(
                    "border-b border-white/5 transition-colors",
                    i < 3 && "bg-emerald-500/5",
                    isPlaying && "bg-amber-500/5",
                    s.eliminated && "opacity-50",
                  )}
                >
                  {/* Rank */}
                  <td className="px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.4rem,0.8vh,0.75rem)]">
                    {i === 0 ? (
                      <div
                        className="flex items-center justify-center rounded-full bg-amber-500 text-black font-black"
                        style={{
                          width: "clamp(1.5rem, 2.5vw, 2rem)",
                          height: "clamp(1.5rem, 2.5vw, 2rem)",
                          fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)",
                        }}
                      >
                        1
                      </div>
                    ) : i === 1 ? (
                      <div
                        className="flex items-center justify-center rounded-full bg-gray-400 text-black font-black"
                        style={{
                          width: "clamp(1.5rem, 2.5vw, 2rem)",
                          height: "clamp(1.5rem, 2.5vw, 2rem)",
                          fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)",
                        }}
                      >
                        2
                      </div>
                    ) : i === 2 ? (
                      <div
                        className="flex items-center justify-center rounded-full bg-amber-700 text-white font-black"
                        style={{
                          width: "clamp(1.5rem, 2.5vw, 2rem)",
                          height: "clamp(1.5rem, 2.5vw, 2rem)",
                          fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)",
                        }}
                      >
                        3
                      </div>
                    ) : (
                      <span
                        className="text-[#3D5A3E] font-bold tabular-nums"
                        style={{ fontSize: "clamp(0.6rem, 1vw, 0.875rem)" }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </td>

                  {/* Player */}
                  <td className="px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.4rem,0.8vh,0.75rem)]">
                    <div className="flex items-center gap-[clamp(0.3rem,0.6vw,0.5rem)]">
                      <div
                        className="flex items-center justify-center rounded-full bg-white/10 font-medium text-[#a8c8b4]"
                        style={{
                          width: "clamp(1.5rem, 2.5vw, 2rem)",
                          height: "clamp(1.5rem, 2.5vw, 2rem)",
                          fontSize: "clamp(0.45rem, 0.7vw, 0.6rem)",
                        }}
                      >
                        {s.player.display_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <span
                          className="font-semibold text-white"
                          style={{ fontSize: "clamp(0.6rem, 1vw, 0.875rem)" }}
                        >
                          {s.player.display_name}
                        </span>
                        {isPlaying && (
                          <span className="ml-2">
                            <span className="live-dot inline-block" style={{ width: 6, height: 6 }} />
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Wins */}
                  <td className="px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.4rem,0.8vh,0.75rem)] text-center">
                    <span
                      className="font-bold text-emerald-400 tabular-nums"
                      style={{ fontSize: "clamp(0.65rem, 1.1vw, 0.95rem)" }}
                    >
                      {s.wins}
                    </span>
                  </td>

                  {/* Losses */}
                  <td className="px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.4rem,0.8vh,0.75rem)] text-center">
                    <span
                      className="font-bold text-red-400 tabular-nums"
                      style={{ fontSize: "clamp(0.65rem, 1.1vw, 0.95rem)" }}
                    >
                      {s.losses}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.4rem,0.8vh,0.75rem)] text-center">
                    {s.eliminated ? (
                      <span
                        className="rounded-full bg-red-500/15 px-[clamp(0.4rem,0.8vw,0.6rem)] py-0.5 font-bold text-red-400"
                        style={{ fontSize: "clamp(0.45rem, 0.7vw, 0.6rem)" }}
                      >
                        Eliminated
                      </span>
                    ) : isPlaying ? (
                      <span
                        className="rounded-full bg-amber-500/15 px-[clamp(0.4rem,0.8vw,0.6rem)] py-0.5 font-bold text-amber-400"
                        style={{ fontSize: "clamp(0.45rem, 0.7vw, 0.6rem)" }}
                      >
                        Playing
                      </span>
                    ) : (
                      <span
                        className="rounded-full bg-emerald-500/15 px-[clamp(0.4rem,0.8vw,0.6rem)] py-0.5 font-bold text-emerald-400"
                        style={{ fontSize: "clamp(0.45rem, 0.7vw, 0.6rem)" }}
                      >
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
