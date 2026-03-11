"use client";

import { cn } from "@/lib/utils";
import { ALL_SKILLS, SKILL_LABELS } from "@/lib/types";
import type { SkillLevel } from "@/lib/types";

interface BoardFiltersProps {
  selectedSkill: SkillLevel | null;
  onSkillChange: (skill: SkillLevel | null) => void;
}

export function BoardFilters({
  selectedSkill,
  onSkillChange,
}: BoardFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 rounded-2xl p-3 glass lg:p-4">
      {/* Skill dropdown */}
      <div className="ml-auto">
        <select
          value={selectedSkill ?? ""}
          onChange={(e) => onSkillChange((e.target.value || null) as SkillLevel | null)}
          aria-label="Filter by skill level"
          className={cn(
            "rounded-full border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400",
            "focus:border-[#1B5E20]/50 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20",
            "cursor-pointer backdrop-blur"
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
