"use client";

import { cn } from "@/lib/utils";

interface PeakHoursGridProps {
  hourCounts: number[];
  dayCounts: number[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? "12a" : i < 12 ? `${i}a` : i === 12 ? "12p" : `${i - 12}p`
);

function getIntensity(value: number, max: number): string {
  if (max === 0) return "bg-zinc-100";
  const ratio = value / max;
  if (ratio === 0) return "bg-zinc-100";
  if (ratio < 0.25) return "bg-emerald-100";
  if (ratio < 0.5) return "bg-emerald-200";
  if (ratio < 0.75) return "bg-emerald-300";
  return "bg-emerald-400";
}

export function PeakHoursGrid({ hourCounts, dayCounts }: PeakHoursGridProps) {
  const maxHour = Math.max(...hourCounts, 1);
  const maxDay = Math.max(...dayCounts, 1);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
          Peak Hours
        </h4>
        <div className="flex gap-1 flex-wrap">
          {hourCounts.map((count, hour) => (
            <div key={hour} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "h-6 w-6 rounded-sm transition-colors",
                  getIntensity(count, maxHour)
                )}
                title={`${HOURS[hour]}: ${count} check-ins`}
              />
              {hour % 4 === 0 && (
                <span className="text-[10px] text-zinc-600">{HOURS[hour]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
          Busiest Days
        </h4>
        <div className="flex gap-2">
          {dayCounts.map((count, day) => (
            <div key={day} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={cn(
                  "h-8 w-full rounded-md transition-colors",
                  getIntensity(count, maxDay)
                )}
                title={`${DAYS[day]}: ${count} check-ins`}
              />
              <span className="text-[10px] text-zinc-500">{DAYS[day]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
