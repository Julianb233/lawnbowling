"use client";

import type { SkillLevel } from "@/lib/db/players";

const config: Record<SkillLevel, { label: string; color: string; stars: number }> = {
  beginner: { label: "Beginner", color: "bg-green-500/20 text-green-400 border-green-500/30", stars: 1 },
  intermediate: { label: "Intermediate", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", stars: 2 },
  advanced: { label: "Advanced", color: "bg-red-500/20 text-red-400 border-red-500/30", stars: 3 },
};

export function SkillBadge({ level }: { level: SkillLevel }) {
  const { label, color, stars } = config[level];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {"★".repeat(stars)}{"☆".repeat(3 - stars)} {label}
    </span>
  );
}
