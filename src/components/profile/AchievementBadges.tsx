"use client";

import { ACHIEVEMENTS, ACHIEVEMENTS_MAP } from "@/lib/achievements";
import type { PlayerAchievement } from "@/lib/achievements";

interface AchievementBadgesProps {
  achievements: PlayerAchievement[];
}

export function AchievementBadges({ achievements }: AchievementBadgesProps) {
  const unlockedIds = new Set(achievements.map((a) => a.achievement_id));

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-[#3D5A3E]">Achievements</h2>
      <div className="grid grid-cols-5 gap-2">
        {ACHIEVEMENTS.map((badge) => {
          const unlocked = unlockedIds.has(badge.id);
          const playerAchievement = achievements.find((a) => a.achievement_id === badge.id);

          return (
            <div
              key={badge.id}
              className={`group relative flex flex-col items-center rounded-lg p-2 text-center transition-colors ${
                unlocked ? "bg-[#1B5E20]/5" : "bg-[#0A2E12]/[0.03] opacity-40"
              }`}
              title={`${badge.name}: ${badge.description}${
                playerAchievement
                  ? ` (Unlocked ${new Date(playerAchievement.unlocked_at).toLocaleDateString()})`
                  : ""
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="mt-1 text-[10px] font-medium leading-tight text-[#3D5A3E]">
                {badge.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
