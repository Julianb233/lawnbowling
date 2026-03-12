"use client";

import { MapPin } from "lucide-react";
import type { Venue } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VenueSelectorProps {
  venues: Venue[];
  selectedVenueId: string | null;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export function VenueSelector({
  venues,
  selectedVenueId,
  onSelect,
  compact,
}: VenueSelectorProps) {
  if (venues.length <= 1) return null;

  return (
    <select
      value={selectedVenueId ?? ""}
      onChange={(e) => onSelect(e.target.value)}
      className={cn(
        "rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/80 text-[#3D5A3E] transition-colors hover:border-[#0A2E12]/10 focus:border-green-500 focus:outline-none",
        compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
      )}
    >
      {venues.map((venue) => (
        <option key={venue.id} value={venue.id}>
          {venue.name}
        </option>
      ))}
    </select>
  );
}
