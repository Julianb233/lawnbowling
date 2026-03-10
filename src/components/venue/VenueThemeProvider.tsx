"use client";

import { useEffect } from "react";
import { getVenueTheme, type VenueBranding } from "@/lib/venue-theme";

interface VenueThemeProviderProps {
  venue: VenueBranding | null;
  children: React.ReactNode;
}

export function VenueThemeProvider({ venue, children }: VenueThemeProviderProps) {
  useEffect(() => {
    if (!venue) return;
    const theme = getVenueTheme(venue);
    const root = document.documentElement;

    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    return () => {
      Object.keys(theme).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [venue]);

  return <>{children}</>;
}
