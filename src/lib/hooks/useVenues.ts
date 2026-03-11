"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Venue } from "@/lib/types";

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
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
        // Auto-select first venue if none selected
        setSelectedVenueId((prev) => prev ?? data[0].id);
      }
      setLoading(false);
    }

    fetchVenues();
  }, []);

  const selectVenue = useCallback((id: string) => {
    setSelectedVenueId(id);
  }, []);

  const selectedVenue = venues.find((v) => v.id === selectedVenueId) ?? null;

  return { venues, selectedVenue, selectedVenueId, selectVenue, loading };
}
