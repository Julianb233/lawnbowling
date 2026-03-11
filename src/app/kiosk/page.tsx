"use client";

import { useState, useEffect, useCallback } from "react";
import { KioskWrapper } from "@/components/kiosk/KioskWrapper";
import { KioskLayout } from "@/components/kiosk/KioskLayout";
import { KioskCheckIn } from "@/components/kiosk/KioskCheckIn";
import { AvailabilityBoard } from "@/components/board/AvailabilityBoard";
import { useRealtimePlayers } from "@/lib/hooks/useRealtimePlayers";
import type { Venue } from "@/lib/types";

type KioskView = "checkin" | "board";

export default function KioskPage() {
  const [view, setView] = useState<KioskView>("checkin");
  const [venue, setVenue] = useState<Venue | null>(null);

  useEffect(() => {
    fetch("/api/venue/default")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) setVenue(data);
      })
      .catch(() => {});
  }, []);

  const { players, loading } = useRealtimePlayers({
    sportFilter: null,
    skillFilter: null,
    venueId: venue?.id ?? null,
  });

  const handleInactivityReset = useCallback(() => {
    setView("checkin");
  }, []);

  return (
    <KioskWrapper inactivityTimeout={30000} onInactivityReset={handleInactivityReset}>
      <KioskLayout
        venueName={venue?.name}
        subtitle="Tournament Day Check-In"
        activeTab={view}
        onTabChange={setView}
        playerCount={players.length}
      >
        {view === "checkin" && venue && <KioskCheckIn venueId={venue.id} />}
        {view === "board" && (
          <AvailabilityBoard
            players={players}
            loading={loading}
            onPickMe={() => {}}
            pendingTargetIds={new Set()}
          />
        )}
        {!venue && (
          <div
            className="flex items-center justify-center py-24"
            role="status"
            aria-label="Loading venue"
          >
            <div
              className="h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: "#1B5E20", borderTopColor: "transparent" }}
            />
          </div>
        )}
      </KioskLayout>
    </KioskWrapper>
  );
}
