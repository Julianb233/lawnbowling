"use client";

import { REGION_LABELS, SURFACE_LABELS, type USRegion, type SurfaceType } from "@/lib/clubs-data";
import { MapPin, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface ClubMapFiltersProps {
  activeRegion: USRegion | "all";
  onRegionChange: (region: USRegion | "all") => void;
  activeActivity: string | "all";
  onActivityChange: (activity: string | "all") => void;
  activeSurface?: SurfaceType | "all";
  onSurfaceChange?: (surface: SurfaceType | "all") => void;
  activities: string[];
  clubCount: number;
}

const SURFACE_OPTIONS: SurfaceType[] = ["natural_grass", "synthetic", "hybrid"];

export function ClubMapFilters({
  activeRegion,
  onRegionChange,
  activeActivity,
  onActivityChange,
  activeSurface = "all",
  onSurfaceChange,
  activities,
  clubCount,
}: ClubMapFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute left-4 right-4 top-4 z-10 sm:left-4 sm:right-auto sm:max-w-xs">
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white/95 p-3 shadow-lg backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#1B5E20]" />
            <p className="text-xs font-bold text-[#3D5A3E] uppercase tracking-wider">
              {clubCount} clubs shown
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 rounded-lg border border-[#0A2E12]/10 px-2 py-1 text-[10px] font-medium text-[#3D5A3E] transition hover:bg-[#0A2E12]/5"
          >
            <SlidersHorizontal className="h-3 w-3" />
            {expanded ? "Less" : "Filters"}
          </button>
        </div>

        {/* Region filters */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          <FilterChip
            active={activeRegion === "all"}
            onClick={() => onRegionChange("all")}
            label="All"
          />
          {(Object.keys(REGION_LABELS) as USRegion[]).map((r) => (
            <FilterChip
              key={r}
              active={activeRegion === r}
              onClick={() => onRegionChange(r)}
              label={REGION_LABELS[r].label}
            />
          ))}
        </div>

        {/* Activity filters */}
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={activeActivity === "all"}
            onClick={() => onActivityChange("all")}
            label="All Activities"
            small
          />
          {activities.slice(0, 5).map((a) => (
            <FilterChip
              key={a}
              active={activeActivity === a}
              onClick={() => onActivityChange(a)}
              label={a}
              small
            />
          ))}
        </div>

        {/* Expanded: Surface type filter */}
        {expanded && onSurfaceChange && (
          <div className="mt-2 border-t border-[#0A2E12]/10 pt-2">
            <p className="mb-1.5 text-[10px] font-semibold text-[#3D5A3E] uppercase tracking-wider">
              Surface Type
            </p>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip
                active={activeSurface === "all"}
                onClick={() => onSurfaceChange("all")}
                label="Any"
                small
              />
              {SURFACE_OPTIONS.map((s) => (
                <FilterChip
                  key={s}
                  active={activeSurface === s}
                  onClick={() => onSurfaceChange(s)}
                  label={SURFACE_LABELS[s]}
                  small
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  small,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border font-medium transition-colors touch-manipulation ${
        small ? "px-2.5 py-1 text-sm" : "px-3 py-1.5 text-xs"
      } ${
        active
          ? "border-[#1B5E20] bg-[#1B5E20] text-white"
          : "border-[#0A2E12]/10 bg-white text-[#3D5A3E] hover:border-[#0A2E12]/10"
      }`}
    >
      {label}
    </button>
  );
}
