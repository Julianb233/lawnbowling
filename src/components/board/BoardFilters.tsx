"use client";

import { cn } from "@/lib/utils";
import { ALL_SPORTS, ALL_SKILLS, SPORT_LABELS, SKILL_LABELS } from "@/lib/types";
import type { Sport, SkillLevel } from "@/lib/types";

interface BoardFiltersProps {
  selectedSport: Sport | null;
  selectedSkill: SkillLevel | null;
  onSportChange: (sport: Sport | null) => void;
  onSkillChange: (skill: SkillLevel | null) => void;
}

export function BoardFilters({
  selectedSport,
  selectedSkill,
  onSportChange,
  onSkillChange,
}: BoardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm lg:p-4">
      {/* Sport toggle buttons */}
      <div className="flex flex-wrap gap-2">
        {ALL_SPORTS.map((sport) => {
          const info = SPORT_LABELS[sport];
          const active = selectedSport === sport;
          return (
            <button
              key={sport}
              onClick={() => onSportChange(active ? null : sport)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                "touch-manipulation select-none",
                active
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              )}
            >
              <span>{info.emoji}</span>
              <span className="hidden sm:inline">{info.label}</span>
              <span className="sm:hidden">{info.short}</span>
            </button>
          );
        })}
      </div>

      {/* Skill dropdown */}
      <div className="ml-auto">
        <select
          value={selectedSkill ?? ""}
          onChange={(e) => onSkillChange((e.target.value || null) as SkillLevel | null)}
          className={cn(
            "rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700",
            "focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100",
            "cursor-pointer"
          )}
        >
          <option value="">Skill: All</option>
          {ALL_SKILLS.map((skill) => (
            <option key={skill} value={skill}>
              {SKILL_LABELS[skill].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
