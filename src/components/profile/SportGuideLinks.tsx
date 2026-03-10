"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SPORT_LABELS } from "@/lib/types";
import { getSportColor } from "@/lib/design";
import type { Sport } from "@/lib/types";

export function SportGuideLinks({ sports }: { sports: string[] }) {
  if (!sports || sports.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-600">
        <BookOpen className="h-4 w-4" />
        Learn How to Play
      </h3>
      <div className="flex flex-wrap gap-2">
        {sports.map((sport) => {
          const label = SPORT_LABELS[sport as Sport];
          const colors = getSportColor(sport);
          if (!label) return null;

          return (
            <Link
              key={sport}
              href={`/learn/${sport}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 min-h-[36px]"
              style={{
                backgroundColor: `${colors.primary}15`,
                color: colors.primary,
                border: `1px solid ${colors.primary}30`,
              }}
            >
              <span>{label.emoji}</span>
              <span>{label.label} Guide</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
