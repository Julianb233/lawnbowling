"use client";

import { REGION_LABELS, type USRegion } from "@/lib/clubs-data";

interface ClubMapFiltersProps {
  activeRegion: USRegion | "all";
  onRegionChange: (region: USRegion | "all") => void;
  activeActivity: string | "all";
  onActivityChange: (activity: string | "all") => void;
  activities: string[];
  clubCount: number;
}

export function ClubMapFilters({
  activeRegion,
  onRegionChange,
  activeActivity,
  onActivityChange,
  activities,
  clubCount,
}: ClubMapFiltersProps) {
  return (
    <div className="absolute left-4 right-4 top-4 z-10 sm:left-4 sm:right-auto sm:max-w-xs">
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white/95 p-3 shadow-lg backdrop-blur">
        <p className="mb-2 text-xs font-bold text-[#3D5A3E] uppercase tracking-wider">
          {clubCount} clubs shown
        </p>

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
