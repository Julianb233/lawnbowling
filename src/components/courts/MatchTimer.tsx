"use client";

import { useEffect, useState } from "react";

interface MatchTimerProps {
  startedAt: string;
  durationMinutes?: number;
}

export function MatchTimer({ startedAt, durationMinutes }: MatchTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const isOvertime =
    durationMinutes !== undefined && elapsed >= durationMinutes * 60;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-mono font-medium ${
        isOvertime
          ? "bg-red-500/20 text-red-400 animate-pulse"
          : "bg-zinc-700/50 text-zinc-600 dark:text-zinc-400"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isOvertime ? "bg-red-400 animate-ping" : "bg-[#1B5E20] animate-ping"
          }`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            isOvertime ? "bg-red-500" : "bg-[#1B5E20]"
          }`}
        />
      </span>
      {formatted}
      {durationMinutes && (
        <span className="text-zinc-500 dark:text-zinc-400">/ {durationMinutes}:00</span>
      )}
    </div>
  );
}
