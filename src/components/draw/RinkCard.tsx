"use client";

import { cn } from "@/lib/utils";
import { BOWLS_POSITION_LABELS } from "@/lib/types";
import type { BowlsPosition, BowlsTeamAssignment } from "@/lib/types";
import { PositionSlot } from "./PositionSlot";

interface RinkCardProps {
  rinkNumber: number;
  rinkLocation?: string;
  assignments: BowlsTeamAssignment[];
  highlightUserId?: string;
  /** For reveal animation: delay in ms before this card appears */
  animationDelay?: number;
  revealMode?: boolean;
}

export function RinkCard({
  rinkNumber,
  rinkLocation,
  assignments,
  highlightUserId,
  animationDelay = 0,
  revealMode = false,
}: RinkCardProps) {
  const team1 = assignments
    .filter((a) => a.team === 1)
    .sort(
      (a, b) =>
        BOWLS_POSITION_LABELS[b.position].order -
        BOWLS_POSITION_LABELS[a.position].order
    );
  const team2 = assignments
    .filter((a) => a.team === 2)
    .sort(
      (a, b) =>
        BOWLS_POSITION_LABELS[b.position].order -
        BOWLS_POSITION_LABELS[a.position].order
    );

  const hasCurrentUser = highlightUserId
    ? assignments.some((a) => a.player_id === highlightUserId)
    : false;

  // Determine animation style
  const animStyle = revealMode
    ? {
        animationName: "drawSheetFadeUp",
        animationDuration: "300ms",
        animationDelay: `${animationDelay}ms`,
        animationFillMode: "both" as const,
        animationTimingFunction: "ease-out",
      }
    : undefined;

  return (
    <div
      id={`rink-card-${rinkNumber}`}
      className={cn(
        "draw-rink-card rounded-2xl border bg-white dark:bg-card overflow-hidden transition-shadow",
        hasCurrentUser
          ? "border-[#1B5E20] shadow-md shadow-[#1B5E20]/10"
          : "border-zinc-200 dark:border-white/10",
        revealMode && "draw-reveal-card",
        // Print styles
        "print:rounded-none print:border print:border-black print:shadow-none print:break-inside-avoid"
      )}
      style={animStyle}
    >
      {/* Rink Header */}
      <div
        className={cn(
          "flex items-baseline gap-2 border-b px-4 py-2.5",
          hasCurrentUser
            ? "bg-[#1B5E20]/5 border-[#1B5E20]/20"
            : "bg-zinc-50 dark:bg-background border-zinc-200 dark:border-white/10",
          "print:bg-white dark:bg-card print:border-black"
        )}
      >
        <span className="text-2xl font-black text-zinc-900 dark:text-foreground print:text-black">
          {rinkNumber}
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 print:text-black">
          Rink
        </span>
        {rinkLocation && (
          <span className="ml-auto text-xs text-zinc-500 print:text-black">
            {rinkLocation}
          </span>
        )}
        {hasCurrentUser && (
          <span className="ml-auto rounded-full bg-[#1B5E20] px-2 py-0.5 text-xs font-bold text-white no-print">
            Your Rink
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-2 divide-x divide-zinc-100 print:divide-black">
        {/* Team 1 */}
        <div className="p-3 space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2 print:text-black">
            Team 1
          </p>
          {team1.map((a) => (
            <PositionSlot
              key={a.player_id}
              position={a.position}
              playerName={a.player?.display_name ?? "TBD"}
              isCurrentUser={a.player_id === highlightUserId}
              playerId={a.player_id}
            />
          ))}
        </div>

        {/* Team 2 */}
        <div className="p-3 space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 print:text-black">
            Team 2
          </p>
          {team2.map((a) => (
            <PositionSlot
              key={a.player_id}
              position={a.position}
              playerName={a.player?.display_name ?? "TBD"}
              isCurrentUser={a.player_id === highlightUserId}
              playerId={a.player_id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
