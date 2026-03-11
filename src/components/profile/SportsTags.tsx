"use client";

import { CircleDot } from "lucide-react";

export function SportsTags({ size = "md" }: { sports?: string[]; size?: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <div className="flex flex-wrap gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-zinc-100 ${sizeClasses}`}
      >
        <CircleDot className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} strokeWidth={1.5} />
        Lawn Bowling
      </span>
    </div>
  );
}

export function SportsSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (sports: string[]) => void;
}) {
  // Lawn bowling is always selected — no sport selection needed
  return (
    <div className="flex flex-wrap gap-2">
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-[#1B5E20] bg-blue-50 text-[#1B5E20] px-4 py-2 text-sm font-medium min-h-[44px]"
      >
        <CircleDot className="w-4 h-4" strokeWidth={1.5} />
        Lawn Bowling
      </span>
    </div>
  );
}
