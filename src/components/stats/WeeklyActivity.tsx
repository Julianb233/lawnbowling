"use client";

import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyActivityProps {
  playerId: string;
}

interface DayData {
  day: string;
  count: number;
  label: string;
}

export function WeeklyActivity({ playerId }: WeeklyActivityProps) {
  const [days, setDays] = useState<DayData[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch(`/api/stats/${playerId}?history=true`);
        if (!res.ok) return;
        const data = await res.json();
        const matches = data.history ?? [];

        // Build last 7 days
        const now = new Date();
        const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weekData: DayData[] = [];

        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const count = matches.filter((m: { ended_at: string }) => {
            if (!m.ended_at) return false;
            return m.ended_at.startsWith(dateStr);
          }).length;
          weekData.push({
            day: dayLabels[d.getDay()],
            count,
            label: dateStr,
          });
        }

        setDays(weekData);

        // Calculate streak (consecutive days with games, ending today)
        let s = 0;
        for (let i = weekData.length - 1; i >= 0; i--) {
          if (weekData[i].count > 0) s++;
          else break;
        }
        setStreak(s);
      } catch {
        // ignore
      }
    }

    fetchActivity();
  }, [playerId]);

  const maxCount = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-400">This Week</h3>
        {streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
            <Flame className="h-3 w-3" />
            {streak} day streak
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-1.5" style={{ height: 80 }}>
        {days.map((d) => {
          const height = d.count > 0 ? Math.max((d.count / maxCount) * 100, 12) : 4;
          return (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-bold text-zinc-600">{d.count > 0 ? d.count : ""}</span>
              <div
                className={cn(
                  "w-full rounded-t-md transition-all",
                  d.count > 0 ? "bg-emerald-500" : "bg-zinc-100"
                )}
                style={{ height: `${height}%`, minHeight: 3 }}
              />
              <span className="text-[10px] text-zinc-600">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
