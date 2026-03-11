"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { PennantStanding } from "@/lib/pennant-engine";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DivisionLadderProps {
  standings: PennantStanding[];
  userTeamId?: string | null;
  compact?: boolean;
  tvMode?: boolean;
  divisionName?: string;
}

export function DivisionLadder({
  standings,
  userTeamId,
  compact = false,
  tvMode = false,
  divisionName,
}: DivisionLadderProps) {
  if (standings.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        tvMode ? "text-zinc-500" : "text-zinc-400 dark:text-zinc-500"
      )}>
        <Trophy className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-lg font-semibold">No standings yet</p>
        <p className="mt-1 text-sm opacity-70">Results will appear here once fixtures are played</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "overflow-hidden rounded-2xl border",
      tvMode
        ? "border-white/10 bg-zinc-900"
        : "border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900"
    )}>
      {/* Header */}
      {divisionName && (
        <div className={cn(
          "border-b px-4 py-3 sm:px-6",
          tvMode
            ? "border-white/10 bg-zinc-800/50"
            : "border-zinc-100 bg-zinc-50/80 dark:border-white/5 dark:bg-zinc-800/50"
        )}>
          <h3 className={cn(
            "text-sm font-bold uppercase tracking-wider",
            tvMode ? "text-emerald-400" : "text-[#1B5E20] dark:text-emerald-400"
          )}>
            {divisionName}
          </h3>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label={`${divisionName ?? "Division"} standings`}>
          <thead>
            <tr className={cn(
              "border-b text-xs font-bold uppercase tracking-wider",
              tvMode
                ? "border-white/10 bg-zinc-800/80 text-zinc-400"
                : "border-zinc-100 bg-zinc-50/50 text-zinc-500 dark:border-white/5 dark:bg-zinc-800/30 dark:text-zinc-400"
            )}>
              <th className="whitespace-nowrap px-3 py-3 text-center w-10" scope="col">#</th>
              <th className="whitespace-nowrap px-3 py-3 text-left" scope="col">Team</th>
              {!compact && (
                <>
                  <th className="whitespace-nowrap px-3 py-3 text-center" scope="col">P</th>
                  <th className="whitespace-nowrap px-3 py-3 text-center" scope="col">W</th>
                  <th className="whitespace-nowrap px-3 py-3 text-center" scope="col">D</th>
                  <th className="whitespace-nowrap px-3 py-3 text-center" scope="col">L</th>
                  <th className="whitespace-nowrap px-3 py-3 text-center hidden sm:table-cell" scope="col">SF</th>
                  <th className="whitespace-nowrap px-3 py-3 text-center hidden sm:table-cell" scope="col">SA</th>
                </>
              )}
              <th className="whitespace-nowrap px-3 py-3 text-center" scope="col">+/-</th>
              <th className="whitespace-nowrap px-3 py-3 text-center" scope="col">Pts</th>
            </tr>
          </thead>
          <AnimatePresence mode="popLayout">
            <tbody>
              {standings.map((standing) => {
                const isUserTeam = userTeamId === standing.teamId;
                const isTop = standing.position <= 1;

                return (
                  <motion.tr
                    key={standing.teamId}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={cn(
                      "border-b transition-colors",
                      tvMode
                        ? "border-white/5"
                        : "border-zinc-50 dark:border-white/5",
                      isUserTeam && (
                        tvMode
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                      ),
                      isTop && !isUserTeam && (
                        tvMode
                          ? "bg-amber-500/5"
                          : "bg-amber-50/50 dark:bg-amber-500/5"
                      )
                    )}
                    role="row"
                  >
                    {/* Position */}
                    <td className="px-3 py-3 text-center">
                      <span className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black",
                        isTop
                          ? tvMode
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          : tvMode
                            ? "bg-zinc-800 text-zinc-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      )}>
                        {standing.position}
                      </span>
                    </td>

                    {/* Team Name */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-semibold truncate max-w-[180px]",
                          isUserTeam
                            ? tvMode
                              ? "text-emerald-400"
                              : "text-emerald-700 dark:text-emerald-400"
                            : tvMode
                              ? "text-white"
                              : "text-zinc-800 dark:text-white"
                        )}>
                          {standing.teamName}
                        </span>
                        {isUserTeam && (
                          <span className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase",
                            tvMode
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          )}>
                            You
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stats */}
                    {!compact && (
                      <>
                        <td className={cn(
                          "px-3 py-3 text-center tabular-nums",
                          tvMode ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-300"
                        )}>
                          {standing.played}
                        </td>
                        <td className={cn(
                          "px-3 py-3 text-center tabular-nums font-medium",
                          tvMode ? "text-emerald-400" : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {standing.wins}
                        </td>
                        <td className={cn(
                          "px-3 py-3 text-center tabular-nums",
                          tvMode ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
                        )}>
                          {standing.draws}
                        </td>
                        <td className={cn(
                          "px-3 py-3 text-center tabular-nums",
                          tvMode ? "text-red-400" : "text-red-500 dark:text-red-400"
                        )}>
                          {standing.losses}
                        </td>
                        <td className={cn(
                          "px-3 py-3 text-center tabular-nums hidden sm:table-cell",
                          tvMode ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
                        )}>
                          {standing.shotsFor}
                        </td>
                        <td className={cn(
                          "px-3 py-3 text-center tabular-nums hidden sm:table-cell",
                          tvMode ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
                        )}>
                          {standing.shotsAgainst}
                        </td>
                      </>
                    )}

                    {/* Shot Difference */}
                    <td className="px-3 py-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-0.5 tabular-nums font-semibold",
                        standing.shotDifference > 0
                          ? tvMode ? "text-emerald-400" : "text-emerald-600 dark:text-emerald-400"
                          : standing.shotDifference < 0
                            ? tvMode ? "text-red-400" : "text-red-500 dark:text-red-400"
                            : tvMode ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
                      )}>
                        {standing.shotDifference > 0 && (
                          <TrendingUp className="h-3 w-3" />
                        )}
                        {standing.shotDifference < 0 && (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {standing.shotDifference === 0 && (
                          <Minus className="h-3 w-3" />
                        )}
                        {standing.shotDifference > 0 ? "+" : ""}
                        {standing.shotDifference}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="px-3 py-3 text-center">
                      <span className={cn(
                        "inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg text-sm font-black",
                        tvMode
                          ? "bg-zinc-800 text-white"
                          : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-white",
                        isUserTeam && (
                          tvMode
                            ? "bg-emerald-500/30 text-emerald-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300"
                        )
                      )}>
                        {standing.points}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </AnimatePresence>
        </table>
      </div>

      {/* Legend */}
      {!tvMode && !compact && (
        <div className="border-t border-zinc-100 px-4 py-2.5 dark:border-white/5">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            P = Played, W = Won, D = Drawn, L = Lost, SF = Shots For, SA = Shots Against, +/- = Shot Difference, Pts = Points (W=2, D=1, L=0)
          </p>
        </div>
      )}
    </div>
  );
}
