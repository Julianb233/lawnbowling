"use client";

import { cn } from "@/lib/utils";

interface ClubScopeToggleProps {
  scope: "club" | "all";
  onScopeChange: (scope: "club" | "all") => void;
  clubName?: string;
}

export function ClubScopeToggle({ scope, onScopeChange, clubName }: ClubScopeToggleProps) {
  return (
    <div className="flex rounded-full border border-[#0A2E12]/10 bg-[#0A2E12]/5 p-0.5">
      <button
        onClick={() => onScopeChange("club")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          scope === "club"
            ? "bg-[#1B5E20] text-white shadow-sm"
            : "text-[#3D5A3E] hover:text-[#2D4A30]"
        )}
      >
        {clubName || "My Club"}
      </button>
      <button
        onClick={() => onScopeChange("all")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          scope === "all"
            ? "bg-[#1B5E20] text-white shadow-sm"
            : "text-[#3D5A3E] hover:text-[#2D4A30]"
        )}
      >
        All Clubs
      </button>
    </div>
  );
}
