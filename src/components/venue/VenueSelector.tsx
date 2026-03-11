"use client";

import type { Venue } from "@/lib/types";

interface VenueSelectorProps {
  venues: Venue[];
  selectedId?: string | null;
  selectedVenueId?: string | null;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export function VenueSelector({ venues, selectedId, selectedVenueId, onSelect, compact }: VenueSelectorProps) {
  const activeId = selectedId ?? selectedVenueId ?? null;
  if (venues.length <= 1) return null;

  return (
    <select
      value={activeId ?? ""}
      onChange={(e) => onSelect(e.target.value)}
      className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 focus:border-[#1B5E20] focus:outline-none"
    >
      {venues.map((venue) => (
        <option key={venue.id} value={venue.id}>
          {venue.name}
        </option>
      ))}
    </select>
  );
}
