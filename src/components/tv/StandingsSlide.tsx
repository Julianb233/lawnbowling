"use client";

import { cn } from "@/lib/utils";
import type { TournamentScore } from "@/lib/types";

interface PlayerStanding {
  playerId: string;
  displayName: string;
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
  differential: number;
}

interface StandingsSlideProps {
  scores: TournamentScore[];
  tournamentName?: string;
}

function computeStandings(scores: TournamentScore[]): PlayerStanding[] {
  const map = new Map<string, PlayerStanding>();

  for (const score of scores) {
    if (!score.is_finalized) continue;

    const teamAWon = score.total_a > score.total_b;
    const teamBWon = score.total_b > score.total_a;
    const isDraw = score.total_a === score.total_b;

    for (const p of score.team_a_players ?? []) {
      if (!map.has(p.player_id)) {
        map.set(p.player_id, {
          playerId: p.player_id, displayName: p.display_name,
          wins: 0, losses: 0, draws: 0, pointsFor: 0, pointsAgainst: 0, differential: 0,
        });
      }
      const s = map.get(p.player_id)!;
      s.pointsFor += score.total_a;
      s.pointsAgainst += score.total_b;
      s.differential += score.total_a - score.total_b;
      if (teamAWon) s.wins++; else if (teamBWon) s.losses++; else if (isDraw) s.draws++;
    }

    for (const p of score.team_b_players ?? []) {
      if (!map.has(p.player_id)) {
        map.set(p.player_id, {
          playerId: p.player_id, displayName: p.display_name,
          wins: 0, losses: 0, draws: 0, pointsFor: 0, pointsAgainst: 0, differential: 0,
        });
      }
      const s = map.get(p.player_id)!;
      s.pointsFor += score.total_b;
      s.pointsAgainst += score.total_a;
      s.differential += score.total_b - score.total_a;
      if (teamBWon) s.wins++; else if (teamAWon) s.losses++; else if (isDraw) s.draws++;
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.differential - a.differential;
  });
}

export default function StandingsSlide({ scores, tournamentName }: StandingsSlideProps) {
  const standings = computeStandings(scores);

  if (standings.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p style={{ fontSize: "clamp(1.25rem, 2vw, 2rem)" }} className="font-bold text-zinc-500">
          No finalized results yet
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2
        className="mb-6 font-bold uppercase tracking-widest text-emerald-400"
        style={{ fontSize: "clamp(0.875rem, 1.2vw, 1.125rem)" }}
      >
        {tournamentName ? `${tournamentName} - Standings` : "Tournament Standings"}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-zinc-800/50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 w-12">#</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Player</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400 w-16">W</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400 w-16">L</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400 w-16">D</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400 w-20">PF</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400 w-20">+/-</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr
                key={s.playerId}
                className={cn(
                  "border-b border-white/5 transition-colors",
                  i < 3 && "bg-emerald-500/5"
                )}
              >
                <td className="px-4 py-3">
                  <span className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black",
                    i === 0 ? "bg-amber-500 text-black"
                      : i === 1 ? "bg-zinc-300 text-black"
                        : i === 2 ? "bg-amber-700 text-white"
                          : "bg-zinc-800 text-zinc-400"
                  )}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-white">{s.displayName}</td>
                <td className="px-4 py-3 text-center text-sm font-bold text-emerald-400 tabular-nums">{s.wins}</td>
                <td className="px-4 py-3 text-center text-sm font-bold text-red-400 tabular-nums">{s.losses}</td>
                <td className="px-4 py-3 text-center text-sm font-bold text-zinc-400 tabular-nums">{s.draws}</td>
                <td className="px-4 py-3 text-center text-sm font-medium text-zinc-300 tabular-nums">{s.pointsFor}</td>
                <td className={cn(
                  "px-4 py-3 text-center text-sm font-bold tabular-nums",
                  s.differential > 0 ? "text-emerald-400" : s.differential < 0 ? "text-red-400" : "text-zinc-400"
                )}>
                  {s.differential > 0 ? "+" : ""}{s.differential}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
