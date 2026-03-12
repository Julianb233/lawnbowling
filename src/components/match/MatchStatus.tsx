"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Play, Trophy, Loader2 } from "lucide-react";
import type { MatchStatus as MatchStatusType } from "@/lib/types";

interface MatchStatusProps {
  status: MatchStatusType;
  winnerName?: string | null;
}

const STATUS_CONFIG: Record<
  MatchStatusType,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  queued: {
    label: "Waiting to Start",
    color: "#92400e",
    bg: "rgba(251,191,36,0.15)",
    icon: Loader2,
  },
  playing: {
    label: "In Progress",
    color: "#1B5E20",
    bg: "rgba(27,94,32,0.12)",
    icon: Play,
  },
  completed: {
    label: "Match Complete",
    color: "#0A2E12",
    bg: "rgba(10,46,18,0.08)",
    icon: Trophy,
  },
};

export function MatchStatusBadge({ status, winnerName }: MatchStatusProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex flex-col items-center gap-2"
      >
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          style={{ backgroundColor: config.bg, color: config.color }}
        >
          <Icon
            className={`h-4 w-4 ${status === "queued" ? "animate-spin" : ""}`}
          />
          {config.label}
          {status === "playing" && (
            <span className="relative ml-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
            </span>
          )}
        </div>

        {status === "completed" && winnerName && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <p
              className="text-lg font-bold"
              style={{ color: "#1B5E20", fontFamily: "var(--font-display)" }}
            >
              {winnerName} Wins!
            </p>
            <motion.div
              className="mt-1 flex justify-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {["#FFD700", "#FFA500", "#FFD700"].map((color, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="text-xl"
                  role="img"
                  aria-label="celebration"
                >
                  <Trophy className="h-5 w-5" style={{ color }} />
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
