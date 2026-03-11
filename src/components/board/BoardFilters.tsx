"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ALL_SPORTS, ALL_SKILLS, SPORT_LABELS, SKILL_LABELS } from "@/lib/types";
import { getSportColor } from "@/lib/design";
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
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 rounded-2xl p-3 glass lg:p-4">
      {/* Sport toggle buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap scrollbar-hide">
        {ALL_SPORTS.map((sport) => {
          const info = SPORT_LABELS[sport];
          const active = selectedSport === sport;
          const sportColor = getSportColor(sport);

          return (
            <motion.button
              key={sport}
              onClick={() => onSportChange(active ? null : sport)}
              aria-label={`Filter by ${info.label}`}
              aria-pressed={active}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all min-h-[44px] shrink-0",
                "touch-manipulation select-none",
                active
                  ? "text-white shadow-lg"
                  : "bg-zinc-100 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              )}
              style={active ? {
                background: `linear-gradient(135deg, ${sportColor.primary}, ${sportColor.primary}dd)`,
                boxShadow: `0 0 20px ${sportColor.glow}`,
              } : undefined}
            >
              <span>{info.emoji}</span>
              <span className="hidden sm:inline">{info.label}</span>
              <span className="sm:hidden">{info.short}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Skill dropdown */}
      <div className="ml-auto">
        <select
          value={selectedSkill ?? ""}
          onChange={(e) => onSkillChange((e.target.value || null) as SkillLevel | null)}
          aria-label="Filter by skill level"
          className={cn(
            "rounded-full border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600",
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
