"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useVenues } from "@/lib/hooks/useVenues";
import { VenueSelector } from "@/components/venue/VenueSelector";
import type { Venue } from "@/lib/types";

interface AdminVenueContextValue {
  venues: Venue[];
  selectedVenue: Venue | null;
  selectedVenueId: string | null;
  selectVenue: (id: string) => void;
  loading: boolean;
}

const AdminVenueCtx = createContext<AdminVenueContextValue | null>(null);

export function useAdminVenue() {
  const ctx = useContext(AdminVenueCtx);
  if (!ctx) throw new Error("useAdminVenue must be used within AdminVenueProvider");
  return ctx;
}

export function AdminVenueProvider({ children }: { children: ReactNode }) {
  const venueState = useVenues();

  return (
    <AdminVenueCtx.Provider value={venueState}>
      {children}
    </AdminVenueCtx.Provider>
  );
}

export function AdminVenuePicker() {
  const { venues, selectedVenueId, selectVenue } = useAdminVenue();

  if (venues.length <= 1) return null;

  return (
    <div className="px-4 py-3 border-b border-[#0A2E12]/10">
      <label className="block text-xs font-medium text-[#3D5A3E] mb-1">
        Active Venue
      </label>
      <VenueSelector
        venues={venues}
        selectedVenueId={selectedVenueId}
        onSelect={selectVenue}
      />
    </div>
  );
}
