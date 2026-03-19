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
    <select
      value={selectedSkill ?? ""}
      onChange={(e) => onSkillChange((e.target.value || null) as SkillLevel | null)}
      aria-label="Filter by experience"
      className={cn(
        "rounded-full border bg-white/80 px-4 py-2 text-sm font-medium",
        "focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20",
        "cursor-pointer backdrop-blur"
      )}
      style={{ borderColor: "rgba(10,46,18,0.1)", color: "#3D5A3E" }}
    >
      <option value="">All Levels</option>
      {ALL_SKILLS.map((skill) => (
        <option key={skill} value={skill}>
          {SKILL_LABELS[skill].label}
        </option>
      ))}
    </select>
  );
}
