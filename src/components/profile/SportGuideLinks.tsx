"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SportIcon } from "@/components/icons/SportIcon";
import { getSportColor } from "@/lib/design";

export function SportGuideLinks() {
  const colors = getSportColor("lawn_bowling");

  return (
    <div className="rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#3D5A3E]">
        <BookOpen className="h-4 w-4" />
        Learn How to Play
      </h3>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/learn/lawn_bowling"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 min-h-[36px]"
          style={{
            backgroundColor: `${colors.primary}15`,
            color: colors.primary,
            border: `1px solid ${colors.primary}30`,
          }}
        >
          <SportIcon sport="lawn_bowling" className="w-4 h-4" />
          <span>Lawn Bowling Guide</span>
        </Link>
      </div>
    </div>
  );
}
