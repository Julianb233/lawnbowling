"use client";

import { cn } from "@/lib/utils";
import type { PennantSeason } from "@/lib/types";
import { Calendar, CheckCircle2, Clock, PlayCircle } from "lucide-react";

interface SeasonTimelineProps {
  season: PennantSeason;
  currentRound?: number;
}

export function SeasonTimeline({ season, currentRound }: SeasonTimelineProps) {
  const startDate = new Date(season.starts_at);
  const endDate = new Date(season.ends_at);
  const now = new Date();

  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = Math.max(0, now.getTime() - startDate.getTime());
  const progressPct = totalDuration > 0
    ? Math.min(100, Math.round((elapsed / totalDuration) * 100))
    : 0;

  const roundProgress = currentRound
    ? Math.round((currentRound / season.rounds_total) * 100)
    : 0;

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    draft: { icon: <Clock className="h-4 w-4" />, color: "text-zinc-400", label: "Draft" },
    registration: { icon: <Calendar className="h-4 w-4" />, color: "text-blue-500", label: "Registration" },
    in_progress: { icon: <PlayCircle className="h-4 w-4" />, color: "text-emerald-500", label: "In Progress" },
    completed: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600", label: "Completed" },
    cancelled: { icon: <Clock className="h-4 w-4" />, color: "text-red-500", label: "Cancelled" },
  };

  const status = statusConfig[season.status] ?? statusConfig.draft;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      {/* Status & Dates */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn("flex items-center gap-1.5 text-sm font-semibold", status.color)}>
          {status.icon}
          {status.label}
        </div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500">
          {startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          {" - "}
          {endDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
            season.status === "completed"
              ? "bg-emerald-500"
              : season.status === "in_progress"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                : "bg-zinc-300 dark:bg-zinc-600"
          )}
          style={{ width: `${season.status === "completed" ? 100 : progressPct}%` }}
        />
      </div>

      {/* Round progress */}
      {season.status === "in_progress" && currentRound !== undefined && (
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Round {currentRound} of {season.rounds_total}</span>
          <span>{roundProgress}% complete</span>
        </div>
      )}
    </div>
  );
}
