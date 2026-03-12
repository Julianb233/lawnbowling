"use client";

import { cn } from "@/lib/utils";
import { Calendar, MapPin, Trophy, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { PennantFixture, PennantFixtureResult } from "@/lib/types";

interface FixtureCardProps {
  fixture: PennantFixture & {
    home_team?: { id: string; name: string; club_id: string | null };
    away_team?: { id: string; name: string; club_id: string | null };
    result?: PennantFixtureResult[] | PennantFixtureResult | null;
  };
  seasonId: string;
  showRound?: boolean;
  compact?: boolean;
}

function getResult(fixture: FixtureCardProps["fixture"]): PennantFixtureResult | null {
  if (!fixture.result) return null;
  if (Array.isArray(fixture.result)) return fixture.result[0] ?? null;
  return fixture.result;
}

export function FixtureCard({
  fixture,
  seasonId,
  showRound = true,
  compact = false,
}: FixtureCardProps) {
  const result = getResult(fixture);
  const isCompleted = fixture.status === "completed" && result;
  const isInProgress = fixture.status === "in_progress";
  const isPostponed = fixture.status === "postponed";

  const homeWon = result?.winner_team_id === fixture.home_team_id;
  const awayWon = result?.winner_team_id === fixture.away_team_id;
  const isDraw = isCompleted && result?.winner_team_id === null;

  const fixtureDate = fixture.scheduled_at
    ? new Date(fixture.scheduled_at)
    : null;

  return (
    <Link
      href={`/pennant/${seasonId}/fixtures/${fixture.id}`}
      className={cn(
        "group block rounded-xl border transition-all hover:shadow-md",
        isCompleted
          ? "border-[#0A2E12]/10 bg-white"
          : isInProgress
            ? "border-amber-200 bg-amber-50/50"
            : isPostponed
              ? "border-red-200 bg-red-50/50"
              : "border-[#0A2E12]/10 bg-white"
      )}
    >
      {/* Top bar */}
      <div className={cn(
        "flex items-center justify-between border-b px-4 py-2",
        "border-[#0A2E12]/10"
      )}>
        <div className="flex items-center gap-2">
          {showRound && (
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D5A3E]">
              Round {fixture.round}
            </span>
          )}
          {fixtureDate && (
            <span className="flex items-center gap-1 text-xs text-[#3D5A3E]">
              <Calendar className="h-3 w-3" />
              {fixtureDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Status badge */}
        {isCompleted ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold uppercase text-emerald-700">
            <Trophy className="h-2.5 w-2.5" />
            Final
          </span>
        ) : isInProgress ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold uppercase text-amber-700">
            <Clock className="h-2.5 w-2.5" />
            Live
          </span>
        ) : isPostponed ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold uppercase text-red-700">
            Postponed
          </span>
        ) : (
          <span className="rounded-full bg-[#0A2E12]/5 px-2 py-0.5 text-xs font-bold uppercase text-[#3D5A3E]">
            Upcoming
          </span>
        )}
      </div>

      {/* Match body */}
      <div className={cn("p-4", compact ? "py-3" : "py-4")}>
        <div className="flex items-center gap-3">
          {/* Home team */}
          <div className={cn("flex-1 text-right", compact ? "min-w-0" : "")}>
            <p className={cn(
              "font-semibold truncate",
              homeWon
                ? "text-emerald-700"
                : "text-[#0A2E12]"
            )}>
              {fixture.home_team?.name ?? "TBD"}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#3D5A3E]">
              Home
            </p>
          </div>

          {/* Score / VS */}
          <div className="flex shrink-0 items-center gap-2">
            {isCompleted && result ? (
              <div className="flex items-center gap-1.5 rounded-xl bg-[#0A2E12]/5 px-3 py-2">
                <span className={cn(
                  "text-xl font-black tabular-nums",
                  homeWon ? "text-emerald-600" : "text-[#3D5A3E]"
                )}>
                  {result.home_shot_total}
                </span>
                <span className="text-xs font-bold text-[#3D5A3E]">-</span>
                <span className={cn(
                  "text-xl font-black tabular-nums",
                  awayWon ? "text-emerald-600" : "text-[#3D5A3E]"
                )}>
                  {result.away_shot_total}
                </span>
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A2E12]/5">
                <span className="text-xs font-black text-[#3D5A3E]">VS</span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className={cn("flex-1 text-left", compact ? "min-w-0" : "")}>
            <p className={cn(
              "font-semibold truncate",
              awayWon
                ? "text-emerald-700"
                : "text-[#0A2E12]"
            )}>
              {fixture.away_team?.name ?? "TBD"}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#3D5A3E]">
              Away
            </p>
          </div>
        </div>

        {/* Rink wins detail (if completed) */}
        {isCompleted && result && !compact && (
          <div className="mt-3 flex items-center justify-center gap-4 text-sm text-[#3D5A3E]">
            <span>Rinks: {result.home_rink_wins} - {result.away_rink_wins}</span>
            {isDraw && <span className="font-semibold text-amber-600">Draw</span>}
          </div>
        )}

        {/* Venue */}
        {fixture.venue && !compact && (
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-[#3D5A3E]">
            <MapPin className="h-3 w-3" />
            <span>{fixture.venue}</span>
          </div>
        )}
      </div>

      {/* Link indicator */}
      {fixture.tournament_id && (
        <div className="border-t border-[#0A2E12]/10 px-4 py-2">
          <span className="flex items-center gap-1 text-xs font-medium text-[#1B5E20]">
            View Draw <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      )}
    </Link>
  );
}
