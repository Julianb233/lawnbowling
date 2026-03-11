"use client";

import { useState, useEffect, useCallback } from "react";
import { KioskWrapper } from "@/components/kiosk/KioskWrapper";
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
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data && !data.error) setVenue(data); })
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
      <div className="min-h-screen bg-white">
        {/* Venue header */}
        <header className="border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-zinc-900">
                {venue?.name || "Lawnbowling"}
              </h1>
              <p className="text-sm text-zinc-500">Kiosk Mode</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("checkin")}
                className={`rounded-xl px-6 py-3 text-sm font-bold min-h-[60px] touch-manipulation ${
                  view === "checkin"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-zinc-100 text-zinc-400"
                }`}
              >
                Check In
              </button>
              <button
                onClick={() => setView("board")}
                className={`rounded-xl px-6 py-3 text-sm font-bold min-h-[60px] touch-manipulation ${
                  view === "board"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-zinc-100 text-zinc-400"
                }`}
              >
                Board ({players.length})
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {view === "checkin" && venue && (
            <KioskCheckIn venueId={venue.id} />
          )}
          {view === "board" && (
            <AvailabilityBoard
              players={players}
              loading={loading}
              onPickMe={() => {}}
              pendingTargetIds={new Set()}
            />
          )}
          {!venue && (
            <div className="flex items-center justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          )}
        </main>
      </div>
    </KioskWrapper>
  );
}
