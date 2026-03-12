"use client";

import { Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Standing {
  player_id: string;
  wins: number;
  losses: number;
  eliminated: boolean;
  player: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    skill_level?: string;
  };
}

interface TournamentStandingsProps {
  standings: Standing[];
}

export function TournamentStandings({ standings }: TournamentStandingsProps) {
  if (standings.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[#3D5A3E]">
        No participants yet
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#0A2E12]/10">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#0A2E12]/10 bg-[#0A2E12]/[0.03]">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#3D5A3E]">#</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#3D5A3E]">Player</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase text-[#3D5A3E]">W</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase text-[#3D5A3E]">L</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase text-[#3D5A3E]">Status</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr
              key={s.player_id}
              className={cn(
                "border-b border-[#0A2E12]/10/50 transition-colors hover:bg-[#0A2E12]/[0.03]",
                i === 0 && "bg-amber-500/5"
              )}
            >
              <td className="px-4 py-3">
                {i === 0 ? (
                  <Trophy className="h-4 w-4 text-amber-400" />
                ) : i === 1 ? (
                  <Medal className="h-4 w-4 text-[#3D5A3E]" />
                ) : i === 2 ? (
                  <Medal className="h-4 w-4 text-amber-600" />
                ) : (
                  <span className="text-sm text-[#3D5A3E]">{i + 1}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A2E12]/5 text-xs font-medium text-[#3D5A3E]">
                    {s.player.display_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm font-medium text-[#2D4A30]">
                    {s.player.display_name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center text-sm font-medium text-green-400">{s.wins}</td>
              <td className="px-4 py-3 text-center text-sm font-medium text-red-400">{s.losses}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    s.eliminated
                      ? "bg-red-500/10 text-red-400"
                      : "bg-green-500/10 text-green-400"
                  )}
                >
                  {s.eliminated ? "Out" : "Active"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
