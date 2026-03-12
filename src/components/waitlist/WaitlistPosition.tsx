"use client";

import { motion } from "framer-motion";
import { Clock, X, Timer } from "lucide-react";

interface WaitlistPositionProps {
  position: number;
  sport: string;
  waitlistId: string;
  estimatedWaitMinutes?: number | null;
  onLeave?: () => void;
}

function formatWaitTime(minutes: number): string {
  if (minutes <= 0) return "Any moment now";
  if (minutes < 2) return "~1 min";
  if (minutes < 60) return "~" + minutes + " min";
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return "~" + hours + "h";
  return "~" + hours + "h " + remaining + "m";
}

export function WaitlistPosition({
  position,
  sport,
  waitlistId,
  estimatedWaitMinutes,
  onLeave,
}: WaitlistPositionProps) {
  async function handleLeave() {
    await fetch("/api/waitlist?id=" + waitlistId, { method: "DELETE" });
    onLeave?.();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-amber-400" />
        <div>
          <p className="text-sm font-semibold text-amber-400">
            You are #{position} in line
          </p>
          <p className="text-xs text-[#3D5A3E]">for {sport}</p>
          {estimatedWaitMinutes != null && (
            <div className="mt-1 flex items-center gap-1">
              <Timer className="h-3 w-3 text-[#3D5A3E]" />
              <p className="text-xs text-[#3D5A3E]">
                Est. wait: {formatWaitTime(estimatedWaitMinutes)}
              </p>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleLeave}
        className="rounded-lg p-2 text-[#3D5A3E] hover:bg-[#0A2E12]/5 hover:text-[#3D5A3E] min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
