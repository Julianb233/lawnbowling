"use client";

import { motion } from "framer-motion";
import { Clock, X } from "lucide-react";

interface WaitlistPositionProps {
  position: number;
  sport: string;
  waitlistId: string;
  onLeave?: () => void;
}

export function WaitlistPosition({ position, sport, waitlistId, onLeave }: WaitlistPositionProps) {
  async function handleLeave() {
    await fetch(`/api/waitlist?id=${waitlistId}`, { method: "DELETE" });
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
          <p className="text-xs text-zinc-500">for {sport}</p>
        </div>
      </div>
      <button
        onClick={handleLeave}
        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
