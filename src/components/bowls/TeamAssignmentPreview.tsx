"use client";

import { motion } from "framer-motion";
import type { RinkAssignment, TeamSlot } from "@/lib/team-assignment-engine";
import type { BowlsPosition } from "@/lib/types";
import { BOWLS_POSITION_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lock, ArrowRightLeft } from "lucide-react";

const POSITION_COLORS: Record<BowlsPosition, string> = {
  skip: "bg-blue-500",
  vice: "bg-purple-500",
  second: "bg-amber-500",
  lead: "bg-emerald-500",
};

const POSITION_TEXT_COLORS: Record<BowlsPosition, string> = {
  skip: "text-blue-600",
  vice: "text-purple-600",
  second: "text-amber-600",
  lead: "text-emerald-600",
};

const POSITION_RING_COLORS: Record<BowlsPosition, string> = {
  skip: "ring-blue-400/40",
  vice: "ring-purple-400/40",
  second: "ring-amber-400/40",
  lead: "ring-emerald-400/40",
};

interface TeamAssignmentPreviewProps {
  rinks: RinkAssignment[];
  selectedPlayerId: string | null;
  lockedPlayerIds: Set<string>;
  onPlayerClick: (playerId: string) => void;
  onToggleLock: (playerId: string) => void;
}

function PlayerCard({
  slot,
  isSelected,
  isLocked,
  isSwapTarget,
  onPlayerClick,
  onToggleLock,
}: {
  slot: TeamSlot;
  isSelected: boolean;
  isLocked: boolean;
  isSwapTarget: boolean;
  onPlayerClick: (id: string) => void;
  onToggleLock: (id: string) => void;
}) {
  const initials = slot.display_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative flex items-center gap-2 rounded-xl border px-3 py-2 transition-all cursor-pointer",
        isSelected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/30"
          : isSwapTarget
          ? "border-blue-300 bg-blue-50/50 ring-1 ring-blue-300/30"
          : "border-[#0A2E12]/10 bg-white hover:border-[#0A2E12]/20 hover:bg-[#F5F0E8]/50"
      )}
      onClick={() => onPlayerClick(slot.player_id)}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-2",
          POSITION_COLORS[slot.position],
          POSITION_RING_COLORS[slot.position]
        )}
      >
        {slot.avatar_url ? (
          <img
            src={slot.avatar_url}
            alt={slot.display_name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#0A2E12]">
          {slot.display_name}
        </p>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium", POSITION_TEXT_COLORS[slot.position])}>
            {BOWLS_POSITION_LABELS[slot.position].label}
          </span>
          <span className="text-xs text-[#3D5A3E]/60">
            {slot.elo_rating} ELO
          </span>
        </div>
      </div>

      {/* Lock button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleLock(slot.player_id);
        }}
        className={cn(
          "rounded-lg p-1.5 transition-colors",
          isLocked
            ? "bg-amber-100 text-amber-600"
            : "text-[#3D5A3E]/30 hover:bg-[#0A2E12]/5 hover:text-[#3D5A3E]/60"
        )}
        title={isLocked ? "Unlock player" : "Lock player in place"}
      >
        <Lock className="h-3.5 w-3.5" />
      </button>

      {/* Swap indicator */}
      {isSelected && (
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
          <ArrowRightLeft className="h-3 w-3" />
        </div>
      )}
    </motion.div>
  );
}

export function TeamAssignmentPreview({
  rinks,
  selectedPlayerId,
  lockedPlayerIds,
  onPlayerClick,
  onToggleLock,
}: TeamAssignmentPreviewProps) {
  if (rinks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#0A2E12]/20 bg-[#F5F0E8]/30 p-8 text-center">
        <p className="text-sm text-[#3D5A3E]">
          No team assignments yet. Click &quot;Do the Draw&quot; to create balanced matchups.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rinks.map((rink) => (
        <motion.div
          key={rink.rink}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rink.rink * 0.05 }}
          className="overflow-hidden rounded-2xl border border-[#0A2E12]/10 bg-white shadow-sm"
        >
          {/* Rink header */}
          <div className="flex items-center justify-between border-b border-[#0A2E12]/5 bg-[#F5F0E8]/50 px-4 py-2.5">
            <h3 className="text-sm font-bold text-[#0A2E12]">
              Rink {rink.rink}
            </h3>
            <span className="rounded-full bg-[#0A2E12]/5 px-2.5 py-0.5 text-xs font-medium text-[#3D5A3E]">
              Score: {rink.rinkScore}
            </span>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-2 divide-x divide-[#0A2E12]/5">
            {/* Team A */}
            <div className="p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="text-xs font-semibold text-[#0A2E12]/70">Team A</span>
              </div>
              <div className="space-y-1.5">
                {rink.teamA.map((slot) => (
                  <PlayerCard
                    key={slot.player_id}
                    slot={slot}
                    isSelected={selectedPlayerId === slot.player_id}
                    isLocked={lockedPlayerIds.has(slot.player_id)}
                    isSwapTarget={selectedPlayerId !== null && selectedPlayerId !== slot.player_id}
                    onPlayerClick={onPlayerClick}
                    onToggleLock={onToggleLock}
                  />
                ))}
              </div>
            </div>

            {/* Team B */}
            <div className="p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                <span className="text-xs font-semibold text-[#0A2E12]/70">Team B</span>
              </div>
              <div className="space-y-1.5">
                {rink.teamB.map((slot) => (
                  <PlayerCard
                    key={slot.player_id}
                    slot={slot}
                    isSelected={selectedPlayerId === slot.player_id}
                    isLocked={lockedPlayerIds.has(slot.player_id)}
                    isSwapTarget={selectedPlayerId !== null && selectedPlayerId !== slot.player_id}
                    onPlayerClick={onPlayerClick}
                    onToggleLock={onToggleLock}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
