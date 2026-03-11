"use client";

import type { Sport } from "@/lib/db/players";
import { CircleDot, Zap, Circle, Wind, type LucideIcon } from "lucide-react";

const sportConfig: Record<Sport, { icon: LucideIcon; label: string }> = {
  pickleball: { icon: Zap, label: "Pickleball" },
  lawn_bowling: { icon: CircleDot, label: "Lawn Bowling" },
  tennis: { icon: Circle, label: "Tennis" },
  badminton: { icon: Wind, label: "Badminton" },
  table_tennis: { icon: Zap, label: "Table Tennis" },
};

export function SportsTags({ sports, size = "md" }: { sports: Sport[]; size?: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <div className="flex flex-wrap gap-1.5">
      {sports.map((sport) => {
        const { icon: Icon, label } = sportConfig[sport];
        return (
          <span
            key={sport}
            className={`inline-flex items-center gap-1.5 rounded-full bg-zinc-100 ${sizeClasses}`}
          >
            <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} strokeWidth={1.5} />
            {label}
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
        const { icon: Icon, label } = sportConfig[sport];
        const isSelected = selected.includes(sport);
        return (
          <button
            key={sport}
            type="button"
            onClick={() => toggle(sport)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${
              isSelected
                ? "border-[#1B5E20] bg-blue-50 text-[#1B5E20]"
                : "border-zinc-300 bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
