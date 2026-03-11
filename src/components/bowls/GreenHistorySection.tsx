"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GreenConditions } from "@/lib/types";
import {
  GREEN_SPEED_LABELS,
  SURFACE_CONDITION_LABELS,
  WIND_STRENGTH_LABELS,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const SPEED_BADGE: Record<string, string> = {
  fast: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  slow: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const SURFACE_BADGE: Record<string, string> = {
  dry: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  damp: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  wet: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

interface GreenHistorySectionProps {
  venueId: string;
}

export function GreenHistorySection({ venueId }: GreenHistorySectionProps) {
  const [history, setHistory] = useState<GreenConditions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("green_conditions")
        .select("id, green_speed, surface_condition, wind_strength, wind_direction, recorded_at")
        .eq("venue_id", venueId)
        .order("recorded_at", { ascending: false })
        .limit(10);

      setHistory((data as GreenConditions[]) ?? []);
      setLoading(false);
    }
    load();
  }, [venueId]);

  if (loading) return null;
  if (history.length === 0) return null;

  // Compute season summary
  const speedCounts: Record<string, number> = {};
  for (const h of history) {
    speedCounts[h.green_speed] = (speedCounts[h.green_speed] ?? 0) + 1;
  }

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
        Green History
      </h2>

      {/* Summary line */}
      <p className="mb-4 text-sm text-zinc-500 dark:text-muted-foreground">
        Last {history.length} sessions:{" "}
        {Object.entries(speedCounts)
          .map(([speed, count]) => `${Math.round((count / history.length) * 100)}% ${GREEN_SPEED_LABELS[speed as keyof typeof GREEN_SPEED_LABELS]}`)
          .join(" / ")}
      </p>

      <div className="space-y-2">
        {history.map((h) => (
          <div
            key={h.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5"
          >
            <span className="text-xs text-zinc-500 dark:text-muted-foreground w-20 shrink-0">
              {new Date(h.recorded_at).toLocaleDateString([], { month: "short", day: "numeric" })}
            </span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", SPEED_BADGE[h.green_speed])}>
              {GREEN_SPEED_LABELS[h.green_speed]}
            </span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", SURFACE_BADGE[h.surface_condition])}>
              {SURFACE_CONDITION_LABELS[h.surface_condition]}
            </span>
            <span className="text-xs text-zinc-400">
              {h.wind_direction === "calm" ? "Calm" : `${WIND_STRENGTH_LABELS[h.wind_strength]} ${h.wind_direction}`}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
