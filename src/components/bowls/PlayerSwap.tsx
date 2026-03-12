"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, X, RotateCcw, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerSwapProps {
  /** Currently selected player ID for swapping */
  selectedPlayerId: string | null;
  /** Name of the selected player */
  selectedPlayerName: string | null;
  /** Number of locked players */
  lockedCount: number;
  /** Whether a regeneration is in progress */
  regenerating: boolean;
  /** Called when user cancels the swap selection */
  onCancelSelect: () => void;
  /** Called when user clicks Re-Generate (respects locks) */
  onRegenerate: () => void;
  /** Called when user unlocks all players */
  onUnlockAll: () => void;
}

export function PlayerSwap({
  selectedPlayerId,
  selectedPlayerName,
  lockedCount,
  regenerating,
  onCancelSelect,
  onRegenerate,
  onUnlockAll,
}: PlayerSwapProps) {
  return (
    <div className="space-y-3">
      {/* Swap indicator */}
      <AnimatePresence>
        {selectedPlayerId && (
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
                  Swapping: {selectedPlayerName}
                </p>
                <p className="text-xs text-blue-700">
                  Click another player to swap positions
                </p>
              </div>
              <button
                onClick={onCancelSelect}
                className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-100 hover:text-blue-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
            regenerating
              ? "bg-[#0A2E12]/10 text-[#3D5A3E]/50"
              : "bg-[#0A2E12] text-white hover:bg-[#0A2E12]/90"
          )}
        >
          <RotateCcw className={cn("h-4 w-4", regenerating && "animate-spin")} />
          {regenerating ? "Generating..." : "Re-Generate"}
          {lockedCount > 0 && !regenerating && (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
              {lockedCount} locked
            </span>
          )}
        </button>

        {lockedCount > 0 && (
          <button
            onClick={onUnlockAll}
            className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100"
          >
            <Lock className="h-3.5 w-3.5" />
            Unlock All
          </button>
        )}
      </div>
    </div>
  );
}
