"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Timer, Users, X } from "lucide-react";

interface WaitlistPositionProps {
  position: number;
  sport: string;
  waitlistId: string;
  onLeave?: () => void;
}

export function WaitlistPosition({ position, sport, waitlistId, onLeave }: WaitlistPositionProps) {
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);
  const [totalWaiting, setTotalWaiting] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/waitlist/status");
      if (res.ok) {
        const data = await res.json();
        if (data.estimatedMinutes !== undefined) {
          setEstimatedMinutes(data.estimatedMinutes);
        }
        if (data.totalWaiting !== undefined) {
          setTotalWaiting(data.totalWaiting);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  async function handleLeave() {
    setLeaving(true);
    try {
      await fetch(`/api/waitlist?id=${waitlistId}`, { method: "DELETE" });
      onLeave?.();
    } catch {
      setLeaving(false);
    }
  }

  function formatEstimate(minutes: number): string {
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `~${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `~${hrs}h ${mins}m` : `~${hrs}h`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-600">
              #{position} in line
            </p>
            <p className="text-xs text-zinc-500">for {sport}</p>
          </div>
        </div>
        <button
          onClick={handleLeave}
          disabled={leaving}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4">
        {estimatedMinutes !== null && (
          <div className="flex items-center gap-1.5 rounded-lg bg-white/60 px-2.5 py-1.5">
            <Timer className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-zinc-700">
              {formatEstimate(estimatedMinutes)}
            </span>
          </div>
        )}
        {totalWaiting > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-white/60 px-2.5 py-1.5">
            <Users className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-500">
              {totalWaiting} waiting
            </span>
          </div>
        )}
      </div>

      {position === 1 && (
        <div className="mt-2 rounded-lg bg-emerald-500/10 px-3 py-1.5">
          <p className="text-xs font-medium text-emerald-600">
            You are next! Get ready to play.
          </p>
        </div>
      )}
    </motion.div>
  );
}
