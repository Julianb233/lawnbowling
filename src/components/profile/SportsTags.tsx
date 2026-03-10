"use client";

import type { Sport } from "@/lib/db/players";

const sportConfig: Record<Sport, { emoji: string; label: string }> = {
  pickleball: { emoji: "🏓", label: "Pickleball" },
  lawn_bowling: { emoji: "🎳", label: "Lawn Bowling" },
  tennis: { emoji: "🎾", label: "Tennis" },
  badminton: { emoji: "🏸", label: "Badminton" },
  table_tennis: { emoji: "🏓", label: "Table Tennis" },
};

export function SportsTags({ sports, size = "md" }: { sports: Sport[]; size?: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <div className="flex flex-wrap gap-1.5">
      {sports.map((sport) => {
        const { emoji, label } = sportConfig[sport];
        return (
          <span
            key={sport}
            className={`inline-flex items-center gap-1 rounded-full bg-white/10 ${sizeClasses}`}
          >
            {emoji} {label}
          </span>
        );
      })}
    </div>
  );
}

export function SportsSelect({
  selected,
  onChange,
}: {
  selected: Sport[];
  onChange: (sports: Sport[]) => void;
}) {
  const allSports = Object.keys(sportConfig) as Sport[];

  function toggle(sport: Sport) {
    if (selected.includes(sport)) {
      onChange(selected.filter((s) => s !== sport));
    } else {
      onChange([...selected, sport]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allSports.map((sport) => {
        const { emoji, label } = sportConfig[sport];
        const isSelected = selected.includes(sport);
        return (
          <button
            key={sport}
            type="button"
            onClick={() => toggle(sport)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${
              isSelected
                ? "border-blue-500 bg-blue-500/20 text-blue-300"
                : "border-white/20 bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {emoji} {label}
          </button>
        );
      })}
    </div>
  );
}
