"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Venue } from "@/lib/types";

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadVenues() {
      const { data } = await supabase.from("venues").select("*").order("name");
      if (data) {
        setVenues(data as Venue[]);
        if (data.length > 0 && !selectedVenueId) {
          setSelectedVenueId(data[0].id);
        }
      }
      setLoading(false);
    }
    loadVenues();
  }, [supabase, selectedVenueId]);

  const selectedVenue = venues.find((v) => v.id === selectedVenueId) ?? null;

  function selectVenue(id: string) {
    setSelectedVenueId(id);
  }

  return { venues, selectedVenue, selectedVenueId, selectVenue, loading };
}
