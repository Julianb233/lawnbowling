"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Venue } from "@/lib/types";

const VENUE_STORAGE_KEY = "pick-a-partner-venue-id";

function getStoredVenueId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(VENUE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeVenueId(id: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VENUE_STORAGE_KEY, id);
  } catch {
    // localStorage unavailable (e.g. private browsing)
  }
}

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(
    getStoredVenueId
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchVenues() {
      const { data } = await supabase
        .from("venues")
        .select("*")
        .order("name");

      if (data && data.length > 0) {
        setVenues(data);
        setSelectedVenueId((prev) => {
          // If stored venue still exists, keep it; otherwise pick first
          const stored = prev;
          if (stored && data.some((v) => v.id === stored)) return stored;
          const fallback = data[0].id;
          storeVenueId(fallback);
          return fallback;
        });
      }
      setLoading(false);
    }

    fetchVenues();
  }, []);

  const selectVenue = useCallback((id: string) => {
    setSelectedVenueId(id);
    storeVenueId(id);
  }, []);

  const selectedVenue = venues.find((v) => v.id === selectedVenueId) ?? null;

  return { venues, selectedVenue, selectedVenueId, selectVenue, loading };
}
