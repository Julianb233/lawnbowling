"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RRMatch {
  id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  score: string | null;
  status: string;
  player1?: Pick<Player, "id" | "display_name" | "avatar_url"> | null;
  player2?: Pick<Player, "id" | "display_name" | "avatar_url"> | null;
}

interface RoundRobinViewProps {
  matches: RRMatch[];
  onReportResult?: (matchId: string) => void;
  currentPlayerId?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

interface PlayerInfo {
  id: string;
  name: string;
}

interface CellData {
  matchId: string;
  result: "win" | "loss" | "draw" | "pending" | "in_progress";
  score: string | null;
}

function buildGrid(matches: RRMatch[]) {
  // Collect all unique players
  const playerMap = new Map<string, PlayerInfo>();

  for (const m of matches) {
    if (m.player1_id && m.player1) {
      playerMap.set(m.player1_id, { id: m.player1_id, name: m.player1.display_name });
    }
    if (m.player2_id && m.player2) {
      playerMap.set(m.player2_id, { id: m.player2_id, name: m.player2.display_name });
    }
  }

  const players = Array.from(playerMap.values());

  // Build the grid: grid[rowPlayer][colPlayer] = CellData | null
  const grid = new Map<string, Map<string, CellData>>();

  for (const m of matches) {
    if (!m.player1_id || !m.player2_id) continue;

    const resultForP1 = (): CellData["result"] => {
      if (m.status === "in_progress") return "in_progress";
      if (m.status !== "completed") return "pending";
      if (!m.winner_id) return "draw";
      return m.winner_id === m.player1_id ? "win" : "loss";
    };

    const resultForP2 = (): CellData["result"] => {
      if (m.status === "in_progress") return "in_progress";
      if (m.status !== "completed") return "pending";
      if (!m.winner_id) return "draw";
      return m.winner_id === m.player2_id ? "win" : "loss";
    };

    // p1 row, p2 col
    if (!grid.has(m.player1_id)) grid.set(m.player1_id, new Map());
    grid.get(m.player1_id)!.set(m.player2_id, {
      matchId: m.id,
      result: resultForP1(),
      score: m.score,
    });

    // p2 row, p1 col
    if (!grid.has(m.player2_id)) grid.set(m.player2_id, new Map());
    grid.get(m.player2_id)!.set(m.player1_id, {
      matchId: m.id,
      result: resultForP2(),
      score: m.score,
    });
  }

  // Tally wins for sorting
  const tallies = players.map((p) => {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    const row = grid.get(p.id);
    if (row) {
      for (const cell of row.values()) {
        if (cell.result === "win") wins++;
        else if (cell.result === "loss") losses++;
        else if (cell.result === "draw") draws++;
      }
    }
    return { ...p, wins, losses, draws };
  });

  tallies.sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  return { players: tallies, grid };
}

/* ------------------------------------------------------------------ */
/*  Cell component                                                     */
/* ------------------------------------------------------------------ */

function GridCell({ cell }: { cell: CellData | undefined }) {
  if (!cell) {
    return (
      <td className="border border-[#0A2E12]/5 bg-[#0A2E12]/[0.02] p-0">
        <div className="flex h-10 w-16 items-center justify-center text-[10px] text-[#3D5A3E]/30">
          -
        </div>
      </td>
    );
  }

  const bg =
    cell.result === "win"
      ? "bg-[#1B5E20]/10"
      : cell.result === "loss"
        ? "bg-red-500/8"
        : cell.result === "draw"
          ? "bg-amber-500/8"
          : cell.result === "in_progress"
            ? "bg-[#1B5E20]/5"
            : "bg-transparent";

  const text =
    cell.result === "win"
      ? "W"
      : cell.result === "loss"
        ? "L"
        : cell.result === "draw"
          ? "D"
          : cell.result === "in_progress"
            ? "..."
            : "-";

  const textColor =
    cell.result === "win"
      ? "text-[#1B5E20] font-semibold"
      : cell.result === "loss"
        ? "text-red-600/70 font-semibold"
        : cell.result === "draw"
          ? "text-amber-600/70 font-medium"
          : "text-[#3D5A3E]/40";

  return (
    <td className={cn("border border-[#0A2E12]/5 p-0", bg)}>
      <div className="flex h-10 w-16 flex-col items-center justify-center">
        <span className={cn("text-xs", textColor)}>{text}</span>
        {cell.score && cell.result !== "pending" && (
          <span className="text-[9px] text-[#3D5A3E]/50">{cell.score}</span>
        )}
      </div>
    </td>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function RoundRobinView({ matches }: RoundRobinViewProps) {
  const { players, grid } = useMemo(() => buildGrid(matches), [matches]);

  if (matches.length === 0 || players.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-[#3D5A3E]">
        No round-robin matches yet.
      </div>
    );
  }

  // Stats summary
  const completed = matches.filter((m) => m.status === "completed").length;
  const total = matches.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-[#0A2E12]">Progress</span>
          <span className="text-[#3D5A3E]">
            {completed}/{total} matches ({pct}%)
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#0A2E12]/5">
          <div
            className="h-full rounded-full bg-[#1B5E20] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Grid table */}
      <div className="overflow-x-auto -mx-4 px-4 pb-2">
        <table className="border-collapse">
          <thead>
            <tr>
              {/* Corner cell */}
              <th className="sticky left-0 z-10 border border-[#0A2E12]/5 bg-[#FEFCF9] p-2">
                <span className="sr-only">Player</span>
              </th>
              {players.map((p) => (
                <th
                  key={p.id}
                  className="border border-[#0A2E12]/5 bg-[#FEFCF9] p-2 text-[10px] font-medium text-[#3D5A3E]"
                >
                  <div className="w-16 truncate text-center" title={p.name}>
                    {p.name.split(" ")[0]}
                  </div>
                </th>
              ))}
              {/* Summary columns */}
              <th className="border border-[#0A2E12]/5 bg-[#FEFCF9] p-2 text-[10px] font-medium text-[#1B5E20]">W</th>
              <th className="border border-[#0A2E12]/5 bg-[#FEFCF9] p-2 text-[10px] font-medium text-red-500">L</th>
              <th className="border border-[#0A2E12]/5 bg-[#FEFCF9] p-2 text-[10px] font-medium text-amber-500">D</th>
            </tr>
          </thead>
          <tbody>
            {players.map((rowPlayer) => (
              <tr key={rowPlayer.id}>
                {/* Row header — player name */}
                <td className="sticky left-0 z-10 border border-[#0A2E12]/5 bg-[#FEFCF9] px-3 py-2">
                  <span className="block max-w-[120px] truncate text-xs font-medium text-[#0A2E12]" title={rowPlayer.name}>
                    {rowPlayer.name}
                  </span>
                </td>
                {players.map((colPlayer) => {
                  // Diagonal — can't play yourself
                  if (rowPlayer.id === colPlayer.id) {
                    return (
                      <td
                        key={colPlayer.id}
                        className="border border-[#0A2E12]/5 bg-[#0A2E12]/[0.04] p-0"
                      >
                        <div className="flex h-10 w-16 items-center justify-center">
                          <div className="h-[1px] w-6 rotate-45 bg-[#0A2E12]/10" />
                        </div>
                      </td>
                    );
                  }

                  const cell = grid.get(rowPlayer.id)?.get(colPlayer.id);
                  return <GridCell key={colPlayer.id} cell={cell} />;
                })}
                {/* Summary cells */}
                <td className="border border-[#0A2E12]/5 bg-[#1B5E20]/5 p-0">
                  <div className="flex h-10 w-10 items-center justify-center text-xs font-semibold text-[#1B5E20]">
                    {rowPlayer.wins}
                  </div>
                </td>
                <td className="border border-[#0A2E12]/5 bg-red-500/5 p-0">
                  <div className="flex h-10 w-10 items-center justify-center text-xs font-semibold text-red-600/70">
                    {rowPlayer.losses}
                  </div>
                </td>
                <td className="border border-[#0A2E12]/5 bg-amber-500/5 p-0">
                  <div className="flex h-10 w-10 items-center justify-center text-xs font-semibold text-amber-600/70">
                    {rowPlayer.draws}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px] text-[#3D5A3E]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#1B5E20]/10 border border-[#1B5E20]/20" />
          Win
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-500/10 border border-red-500/20" />
          Loss
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-amber-500/10 border border-amber-500/20" />
          Draw
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#0A2E12]/[0.04] border border-[#0A2E12]/10" />
          Not played
        </span>
      </div>
    </div>
  );
}
