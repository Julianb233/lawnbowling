"use client";

import type { SkillLevel } from "@/lib/db/players";

const config: Record<SkillLevel, { label: string; color: string; stars: number }> = {
  beginner: { label: "Beginner", color: "bg-green-50 text-green-700 border-green-200", stars: 1 },
  intermediate: { label: "Intermediate", color: "bg-yellow-50 text-yellow-700 border-yellow-200", stars: 2 },
  advanced: { label: "Advanced", color: "bg-red-50 text-red-700 border-red-200", stars: 3 },
};

export function SkillBadge({ level }: { level: SkillLevel }) {
  const { label, color, stars } = config[level];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {"★".repeat(stars)}{"☆".repeat(3 - stars)} {label}
    </span>
  );
}
