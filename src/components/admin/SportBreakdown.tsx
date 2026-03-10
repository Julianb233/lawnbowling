"use client";

import { SPORT_LABELS, type Sport } from "@/lib/types";

interface SportBreakdownProps {
  breakdown: Record<string, number>;
}

const COLORS: Record<string, string> = {
  pickleball: "bg-emerald-500",
  lawn_bowling: "bg-blue-500",
  tennis: "bg-amber-500",
};

export function SportBreakdown({ breakdown }: SportBreakdownProps) {
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return <p className="text-sm text-zinc-500">No match data yet</p>;
  }

  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-3">
      {/* Bar chart */}
      <div className="flex h-4 rounded-full overflow-hidden bg-zinc-100">
        {entries.map(([sport, count]) => (
          <div
            key={sport}
            className={`${COLORS[sport] || "bg-zinc-600"} transition-all`}
            style={{ width: `${(count / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {entries.map(([sport, count]) => {
          const info = SPORT_LABELS[sport as Sport];
          const pct = Math.round((count / total) * 100);
          return (
            <div key={sport} className="flex items-center gap-1.5">
              <div
                className={`h-3 w-3 rounded-full ${COLORS[sport] || "bg-zinc-600"}`}
              />
              <span className="text-xs text-zinc-600">
                {info?.emoji} {info?.label || sport} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
