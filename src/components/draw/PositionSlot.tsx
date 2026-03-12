"use client";

import { cn } from "@/lib/utils";
import type { BowlsPosition } from "@/lib/types";
import { BOWLS_POSITION_LABELS } from "@/lib/types";

/** Position color palette per REQ-DS-03 */
const POSITION_COLORS: Record<BowlsPosition, { bg: string; text: string; border: string; print: string }> = {
  skip: {
    bg: "bg-[#1B5E20]/10",
    text: "text-[#1B5E20]",
    border: "border-[#1B5E20]/30",
    print: "font-bold",
  },
  vice: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-300",
    print: "",
  },
  second: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",
    print: "",
  },
  lead: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-300",
    print: "",
  },
};

interface PositionSlotProps {
  position: BowlsPosition;
  playerName: string;
  isCurrentUser: boolean;
  playerId?: string;
}

export function PositionSlot({ position, playerName, isCurrentUser, playerId }: PositionSlotProps) {
  const colors = POSITION_COLORS[position];
  const label = BOWLS_POSITION_LABELS[position].label;

  return (
    <div
      data-position={position}
      data-player-id={playerId}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 border transition-colors",
        colors.bg,
        colors.border,
        isCurrentUser && "ring-2 ring-[#1B5E20] ring-offset-1 bg-[#1B5E20]/15 border-[#1B5E20]",
        // Print styles: no background colors, use borders and bold
        "print:bg-white print:ring-0 print:ring-offset-0",
        isCurrentUser && "print:border-2 print:border-black print:font-bold"
      )}
    >
      <span
        className={cn(
          "shrink-0 text-xs font-bold uppercase tracking-wider w-12",
          colors.text,
          "print:text-black"
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-medium text-[#0A2E12] truncate flex-1",
          isCurrentUser && "font-bold text-[#1B5E20]",
          "print:text-black",
          isCurrentUser && "print:font-bold"
        )}
        title={playerName}
      >
        {playerName}
      </span>
      {isCurrentUser && (
        <span className="shrink-0 rounded-full bg-[#1B5E20] px-1.5 py-0.5 text-xs font-bold text-white print:bg-black print:text-white">
          You
        </span>
      )}
    </div>
  );
}

export { POSITION_COLORS };
