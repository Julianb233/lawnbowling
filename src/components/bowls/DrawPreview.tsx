"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft,
  Check,
  RefreshCw,
  Search,
  X,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BowlsTeamAssignment,
  BowlsCheckin,
  BowlsGameFormat,
  BowlsPosition,
} from "@/lib/types";
import { BOWLS_FORMAT_LABELS, BOWLS_POSITION_LABELS } from "@/lib/types";

export interface DrawPreviewData {
  rinks: BowlsTeamAssignment[][];
  unassigned: BowlsCheckin[];
  rinkCount: number;
  format: BowlsGameFormat;
}

interface DrawPreviewProps {
  /** The preview draw data (not yet saved) */
  preview: DrawPreviewData;
  /** Called when user confirms the draw (saves to DB) */
  onConfirm: (preview: DrawPreviewData) => void;
  /** Called when user wants a fresh random draw */
  onRegenerate: () => void;
  /** Loading state for confirm action */
  confirmLoading: boolean;
  /** Loading state for regenerate action */
  regenerateLoading: boolean;
}

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

export function DrawPreview({
  preview,
  onConfirm,
  onRegenerate,
  confirmLoading,
  regenerateLoading,
}: DrawPreviewProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: string;
    name: string;
    rinkIndex: number;
    assignmentIndex: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [localPreview, setLocalPreview] = useState<DrawPreviewData>(preview);

  // Reset local preview when a new preview comes in (regenerate)
  const previewKey = useMemo(
    () =>
      preview.rinks
        .flat()
        .map((a) => a.player_id)
        .join(","),
    [preview]
  );
  useState(() => {
    setLocalPreview(preview);
    setSelectedPlayer(null);
  });

  // Keep local preview in sync when preview prop changes
  useMemo(() => {
    setLocalPreview(preview);
    setSelectedPlayer(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey]);

  const filteredRinkIndices = useMemo(() => {
    if (!searchQuery.trim()) return localPreview.rinks.map((_, i) => i);
    const q = searchQuery.toLowerCase();
    return localPreview.rinks
      .map((rink, i) => {
        const match = rink.some(
          (a) =>
            a.player?.display_name?.toLowerCase().includes(q) ||
            a.position.toLowerCase().includes(q) ||
            `rink ${i + 1}`.includes(q)
        );
        return match ? i : -1;
      })
      .filter((i) => i >= 0);
  }, [localPreview.rinks, searchQuery]);

  function handlePlayerClick(
    playerId: string,
    playerName: string,
    rinkIndex: number,
    assignmentIndex: number
  ) {
    if (!selectedPlayer) {
      // First click: select this player
      setSelectedPlayer({ id: playerId, name: playerName, rinkIndex, assignmentIndex });
      return;
    }

    if (selectedPlayer.id === playerId) {
      // Click same player: deselect
      setSelectedPlayer(null);
      return;
    }

    // Second click on a different player: swap them
    const newRinks = localPreview.rinks.map((rink) => rink.map((a) => ({ ...a })));

    const srcRink = newRinks[selectedPlayer.rinkIndex];
    const dstRink = newRinks[rinkIndex];
    const srcAssignment = srcRink[selectedPlayer.assignmentIndex];
    const dstAssignment = dstRink[assignmentIndex];

    // Swap player_id and player data; keep rink, team, and position in place
    const tmpPlayerId = srcAssignment.player_id;
    const tmpPlayer = srcAssignment.player;

    srcAssignment.player_id = dstAssignment.player_id;
    srcAssignment.player = dstAssignment.player;
    dstAssignment.player_id = tmpPlayerId;
    dstAssignment.player = tmpPlayer;

    setLocalPreview({ ...localPreview, rinks: newRinks });
    setSelectedPlayer(null);
  }

  function handleCancelSelect() {
    setSelectedPlayer(null);
  }

  const totalPlayers = localPreview.rinks.reduce((sum, r) => sum + r.length, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#1B5E20]" />
          <span className="text-sm font-semibold text-[#0A2E12]">
            {localPreview.rinkCount} Rink{localPreview.rinkCount !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-[#3D5A3E]">
            {totalPlayers} players &middot;{" "}
            {BOWLS_FORMAT_LABELS[localPreview.format].label}
          </span>
        </div>
        {localPreview.unassigned.length > 0 && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            {localPreview.unassigned.length} unassigned
          </span>
        )}
      </div>

      {/* Swap indicator */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">
                  Swapping: {selectedPlayer.name}
                </p>
                <p className="text-xs text-blue-700">
                  Click another player to swap positions
                </p>
              </div>
              <button
                onClick={handleCancelSelect}
                className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-100 hover:text-blue-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]/50" />
        <input
          type="text"
          placeholder="Search players, positions, rinks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-[#0A2E12]/10 bg-white py-2.5 pl-10 pr-4 text-sm text-[#0A2E12] placeholder-[#3D5A3E]/40 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#3D5A3E]/40 hover:text-[#3D5A3E]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Rink cards (scrollable) */}
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        {filteredRinkIndices.map((rinkIndex) => {
          const rink = localPreview.rinks[rinkIndex];
          const teamA = rink.filter((a) => a.team === 1);
          const teamB = rink.filter((a) => a.team === 2);

          return (
            <motion.div
              key={rinkIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rinkIndex * 0.03 }}
              className="overflow-hidden rounded-2xl border border-[#0A2E12]/10 bg-white shadow-sm"
            >
              {/* Rink header */}
              <div className="flex items-center justify-between border-b border-[#0A2E12]/5 bg-[#F5F0E8]/50 px-4 py-2.5">
                <h3 className="text-sm font-bold text-[#0A2E12]">
                  Rink {rinkIndex + 1}
                </h3>
                <span className="rounded-full bg-[#0A2E12]/5 px-2.5 py-0.5 text-xs font-medium text-[#3D5A3E]">
                  {rink.length} players
                </span>
              </div>

              {/* Teams grid */}
              <div className="grid grid-cols-2 divide-x divide-[#0A2E12]/5">
                <TeamColumn
                  label="Team A"
                  dotColor="bg-red-400"
                  players={teamA}
                  rinkIndex={rinkIndex}
                  allAssignments={rink}
                  selectedPlayer={selectedPlayer}
                  onPlayerClick={handlePlayerClick}
                />
                <TeamColumn
                  label="Team B"
                  dotColor="bg-blue-400"
                  players={teamB}
                  rinkIndex={rinkIndex}
                  allAssignments={rink}
                  selectedPlayer={selectedPlayer}
                  onPlayerClick={handlePlayerClick}
                />
              </div>
            </motion.div>
          );
        })}

        {filteredRinkIndices.length === 0 && searchQuery && (
          <div className="rounded-xl border border-dashed border-[#0A2E12]/20 bg-[#F5F0E8]/30 p-6 text-center">
            <p className="text-sm text-[#3D5A3E]">
              No rinks match &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Unassigned players */}
      {localPreview.unassigned.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-700">
            Unassigned Players
          </p>
          <div className="flex flex-wrap gap-2">
            {localPreview.unassigned.map((u) => (
              <span
                key={u.player_id}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-amber-800 shadow-sm"
              >
                {u.player?.display_name ?? u.player_id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => onConfirm(localPreview)}
          disabled={confirmLoading || regenerateLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#145218] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
        >
          {confirmLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Confirm Draw
        </button>
        <button
          onClick={onRegenerate}
          disabled={confirmLoading || regenerateLoading}
          className="flex items-center gap-2 rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-3 text-sm font-semibold text-[#3D5A3E] transition-colors hover:bg-[#0A2E12]/[0.03] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
        >
          <RefreshCw
            className={cn("h-4 w-4", regenerateLoading && "animate-spin")}
          />
          Regenerate
        </button>
      </div>
    </div>
  );
}

/* ── Team Column ── */

function TeamColumn({
  label,
  dotColor,
  players,
  rinkIndex,
  allAssignments,
  selectedPlayer,
  onPlayerClick,
}: {
  label: string;
  dotColor: string;
  players: BowlsTeamAssignment[];
  rinkIndex: number;
  allAssignments: BowlsTeamAssignment[];
  selectedPlayer: {
    id: string;
    name: string;
    rinkIndex: number;
    assignmentIndex: number;
  } | null;
  onPlayerClick: (
    playerId: string,
    playerName: string,
    rinkIndex: number,
    assignmentIndex: number
  ) => void;
}) {
  return (
    <div className="p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <div className={cn("h-2.5 w-2.5 rounded-full", dotColor)} />
        <span className="text-xs font-semibold text-[#0A2E12]/70">{label}</span>
      </div>
      <div className="space-y-1.5">
        {players.map((assignment) => {
          const assignmentIndex = allAssignments.indexOf(assignment);
          const isSelected = selectedPlayer?.id === assignment.player_id;
          const isSwapTarget =
            selectedPlayer !== null && selectedPlayer.id !== assignment.player_id;

          const displayName =
            assignment.player?.display_name ?? assignment.player_id;
          const initials = displayName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <motion.div
              key={assignment.player_id}
              layout
              className={cn(
                "relative flex items-center gap-2 rounded-xl border px-3 py-2 transition-all cursor-pointer",
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/30"
                  : isSwapTarget
                  ? "border-dashed border-blue-300 bg-blue-50/30"
                  : "border-[#0A2E12]/10 bg-white hover:border-[#0A2E12]/20 hover:bg-[#F5F0E8]/50"
              )}
              onClick={() =>
                onPlayerClick(
                  assignment.player_id,
                  displayName,
                  rinkIndex,
                  assignmentIndex
                )
              }
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-2",
                  POSITION_COLORS[assignment.position],
                  POSITION_RING_COLORS[assignment.position]
                )}
              >
                {assignment.player?.avatar_url ? (
                  <img
                    src={assignment.player.avatar_url}
                    alt={displayName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0A2E12]">
                  {displayName}
                </p>
                <span
                  className={cn(
                    "text-xs font-medium",
                    POSITION_TEXT_COLORS[assignment.position]
                  )}
                >
                  {BOWLS_POSITION_LABELS[assignment.position]?.label ??
                    assignment.position}
                </span>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                  <ArrowRightLeft className="h-3 w-3" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
