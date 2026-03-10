"use client";

import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: number;
  className?: string;
}

export function StatsCard({ label, value, trend, className }: StatsCardProps) {
  return (
    <div className={cn("rounded-xl border border-zinc-200 bg-white p-4", className)}>
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900 tabular-nums">
        {value}
      </p>
      {trend !== undefined && trend !== 0 && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            trend > 0 ? "text-emerald-600" : "text-red-600"
          )}
        >
          {trend > 0 ? "\u2191" : "\u2193"} {Math.abs(trend)}% vs last month
        </p>
      )}
    </div>
  );
}
