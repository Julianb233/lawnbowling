"use client";

import type { GreenConditions } from "@/lib/types";
import {
  GREEN_SPEED_LABELS,
  SURFACE_CONDITION_LABELS,
  WIND_DIRECTION_LABELS,
  WIND_STRENGTH_LABELS,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const SPEED_COLORS: Record<string, string> = {
  fast: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  slow: "bg-red-100 text-red-700 border-red-200",
};

const SURFACE_COLORS: Record<string, string> = {
  dry: "bg-orange-100 text-orange-700 border-orange-200",
  damp: "bg-blue-100 text-blue-700 border-blue-200",
  wet: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const WIND_COLORS: Record<string, string> = {
  calm: "text-[#3D5A3E]",
  light: "text-sky-500",
  moderate: "text-amber-500",
  strong: "text-red-500",
};

// Wind direction to rotation degrees
const WIND_ROTATION: Record<string, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315, calm: 0,
};

interface GreenConditionsWidgetProps {
  conditions: GreenConditions | null;
  variant?: "default" | "tv";
  onEdit?: () => void;
}

export function GreenConditionsWidget({ conditions, variant = "default", onEdit }: GreenConditionsWidgetProps) {
  const isTV = variant === "tv";

  if (!conditions) {
    return (
      <div className={cn(
        "rounded-2xl border p-4",
        isTV
          ? "border-white/10 bg-[#0A2E12]/50"
          : "border-[#0A2E12]/10 bg-white"
      )}>
        <p className={cn(
          "text-sm font-medium",
          isTV ? "text-[#3D5A3E]" : "text-[#3D5A3E]"
        )}>
          Conditions not yet logged
        </p>
        {onEdit && (
          <button
            onClick={onEdit}
            className="mt-2 text-xs font-semibold text-[#1B5E20] hover:underline"
          >
            Log Conditions
          </button>
        )}
      </div>
    );
  }

  if (isTV) {
    return (
      <div className="flex items-center gap-4">
        {/* Speed */}
        <div className="flex items-center gap-1.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className={cn(
            "rounded-full px-2.5 py-0.5 text-sm font-bold",
            conditions.green_speed === "fast" ? "bg-emerald-500/20 text-emerald-400" :
            conditions.green_speed === "medium" ? "bg-amber-500/20 text-amber-400" :
            "bg-red-500/20 text-red-400"
          )}>
            {GREEN_SPEED_LABELS[conditions.green_speed]}
          </span>
        </div>

        {/* Surface */}
        <span className={cn(
          "rounded-full px-2.5 py-0.5 text-sm font-bold",
          conditions.surface_condition === "dry" ? "bg-orange-500/20 text-orange-400" :
          conditions.surface_condition === "damp" ? "bg-blue-500/20 text-blue-400" :
          "bg-indigo-500/20 text-indigo-400"
        )}>
          {SURFACE_CONDITION_LABELS[conditions.surface_condition]}
        </span>

        {/* Wind */}
        <div className="flex items-center gap-1">
          {conditions.wind_direction !== "calm" && (
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={cn(WIND_COLORS[conditions.wind_strength])}
              style={{ transform: `rotate(${WIND_ROTATION[conditions.wind_direction]}deg)` }}
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          )}
          <span className="text-sm text-[#3D5A3E]">
            {conditions.wind_direction === "calm"
              ? "Calm"
              : `${WIND_STRENGTH_LABELS[conditions.wind_strength]} ${conditions.wind_direction}`
            }
          </span>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D5A3E]">
          Green Conditions
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs font-semibold text-[#1B5E20] hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Speed badge */}
        <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", SPEED_COLORS[conditions.green_speed])}>
          {GREEN_SPEED_LABELS[conditions.green_speed]}
        </span>

        {/* Surface badge */}
        <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", SURFACE_COLORS[conditions.surface_condition])}>
          {SURFACE_CONDITION_LABELS[conditions.surface_condition]}
        </span>

        {/* Wind */}
        <span className="inline-flex items-center gap-1 rounded-full border border-[#0A2E12]/10 px-3 py-1 text-xs font-bold text-[#3D5A3E]">
          {conditions.wind_direction !== "calm" && (
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={cn(WIND_COLORS[conditions.wind_strength])}
              style={{ transform: `rotate(${WIND_ROTATION[conditions.wind_direction]}deg)` }}
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          )}
          {conditions.wind_direction === "calm"
            ? "Calm"
            : `${WIND_STRENGTH_LABELS[conditions.wind_strength]} ${conditions.wind_direction}`
          }
        </span>
      </div>

      {conditions.notes && (
        <p className="mt-2 text-xs text-[#3D5A3E]">{conditions.notes}</p>
      )}

      <p className="mt-2 text-[11px] text-[#3D5A3E]">
        Recorded {conditions.recorder?.display_name ? `by ${conditions.recorder.display_name}` : ""}{" "}
        at {new Date(conditions.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}
