"use client";

import { useState, useEffect } from "react";
import { GREEN_SPEED_LABELS, SURFACE_CONDITION_LABELS } from "@/lib/types";
import type { GreenSpeed, SurfaceCondition } from "@/lib/types";

interface HistoryEntry {
  id: string;
  green_speed: GreenSpeed;
  surface_condition: SurfaceCondition;
  wind_direction: string;
  wind_strength: string;
  recorded_at: string;
}

const SPEED_COLORS: Record<string, string> = {
  fast: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  slow: "bg-red-100 text-red-700",
};

const SURFACE_COLORS: Record<string, string> = {
  dry: "bg-orange-100 text-orange-700",
  damp: "bg-blue-100 text-blue-700",
  wet: "bg-indigo-100 text-indigo-700",
};

export function GreenHistory({ clubId }: { clubId: string }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/stats/club/green-history?club_id=${clubId}`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clubId]);

  if (loading || entries.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
        Green History
      </h2>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-2.5"
          >
            <span className="text-sm text-zinc-500">
              {new Date(entry.recorded_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <div className="flex gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${SPEED_COLORS[entry.green_speed]}`}>
                {GREEN_SPEED_LABELS[entry.green_speed]}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${SURFACE_COLORS[entry.surface_condition]}`}>
                {SURFACE_CONDITION_LABELS[entry.surface_condition]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
