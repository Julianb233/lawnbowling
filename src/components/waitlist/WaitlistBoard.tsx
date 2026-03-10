"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Users, Timer } from "lucide-react";
import type { WaitlistEntry } from "@/lib/types";

interface WaitlistBoardProps {
  venueId: string;
  sport?: string;
}

export function WaitlistBoard({ venueId, sport }: WaitlistBoardProps) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ venue_id: venueId });
    if (sport) params.set("sport", sport);
    const res = await fetch(`/api/waitlist?${params}`);
    const data = await res.json();
    setEntries(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [venueId, sport]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return <div className="animate-pulse rounded-xl bg-zinc-100 h-24" />;
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl glass p-4 text-center">
        <Clock className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
        <p className="text-sm text-zinc-500">No one in the waitlist</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl glass p-4">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-zinc-600">
          Waitlist ({entries.length})
        </h3>
      </div>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
              #{entry.position}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-700">
                {entry.player?.display_name || "Player"}
                {entry.partner?.display_name && (
                  <span className="text-zinc-400">
                    {" & "}{entry.partner.display_name}
                  </span>
                )}
              </p>
              <p className="text-xs text-zinc-500">{entry.sport}</p>
            </div>
            {entry.estimated_wait_minutes != null &&
              entry.estimated_wait_minutes > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-500">
                  <Timer className="h-3.5 w-3.5" />
                  <span>~{entry.estimated_wait_minutes}m</span>
                </div>
              )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
