"use client";

import { useEffect, useState } from "react";
import { VenueQRCode } from "@/components/qr/VenueQRCode";
import type { Venue } from "@/lib/types";

export default function VenueQRPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/venues")
      .then((r) => r.json())
      .then((data) => {
        setVenues(data.venues || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-[#3D5A3E]">Loading venues...</div>;
  }

  if (venues.length === 0) {
    return (
      <div className="text-[#3D5A3E]">
        No venues configured. Create a venue first in Venue Settings.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2E12] mb-2">
        Venue QR Codes
      </h1>
      <p className="text-sm text-[#3D5A3E] mb-8">
        Print these QR codes and display them at venue entrances or on tables.
        Players scan to check in automatically.
      </p>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((venue) => (
          <div
            key={venue.id}
            className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 flex flex-col items-center"
          >
            <VenueQRCode
              venueId={venue.id}
              venueName={venue.name}
              size={220}
              showActions
            />
            {venue.address && (
              <p className="mt-3 text-xs text-[#3D5A3E] text-center">
                {venue.address}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
