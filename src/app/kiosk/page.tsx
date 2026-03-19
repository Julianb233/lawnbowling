"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { KioskWrapper } from "@/components/kiosk/KioskWrapper";
import { KioskLayout } from "@/components/kiosk/KioskLayout";
import { KioskCheckIn } from "@/components/kiosk/KioskCheckIn";
import { KioskBowlsCheckIn } from "@/components/kiosk/KioskBowlsCheckIn";
import { AvailabilityBoard } from "@/components/board/AvailabilityBoard";
import { useRealtimePlayers } from "@/lib/hooks/useRealtimePlayers";
import { createClient } from "@/lib/supabase/client";
import type { Venue, Tournament } from "@/lib/types";

type KioskView = "checkin" | "board";

export default function KioskPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "#1B5E20", borderTopColor: "transparent" }} />
      </div>
    }>
      <KioskPageContent />
    </Suspense>
  );
}

function KioskPageContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const tournamentIdParam = searchParams.get("tournament_id");

  const [view, setView] = useState<KioskView>("checkin");
  const [venue, setVenue] = useState<Venue | null>(null);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(
    tournamentIdParam
  );
  const [detectingTournament, setDetectingTournament] = useState(true);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [venueLoadFailed, setVenueLoadFailed] = useState(false);

  // Load venue with timeout
  useEffect(() => {
    let didCancel = false;

    const timeoutId = setTimeout(() => {
      if (!didCancel) {
        setLoadTimedOut(true);
        setDetectingTournament(false);
      }
    }, 5000);

    fetch("/api/venue/default")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (didCancel) return;
        clearTimeout(timeoutId);
        if (data && !data.error) {
          setVenue(data);
        } else {
          setVenueLoadFailed(true);
          setDetectingTournament(false);
        }
      })
      .catch(() => {
        if (didCancel) return;
        clearTimeout(timeoutId);
        setVenueLoadFailed(true);
        setDetectingTournament(false);
      });

    return () => {
      didCancel = true;
      clearTimeout(timeoutId);
    };
  }, []);

  // Auto-detect active bowls tournaments for the venue (UCI-01)
  useEffect(() => {
    if (!venue?.id) return;

    // If explicit tournament_id param, skip auto-detection (UCI-09)
    if (tournamentIdParam) {
      setSelectedTournamentId(tournamentIdParam);
      setDetectingTournament(false);
      return;
    }

    async function detectTournaments() {
      const supabase = createClient();
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

      const { data } = await supabase
        .from("tournaments")
        .select("id, name, status, starts_at, sport, format")
        .eq("venue_id", venue!.id)
        .in("status", ["registration", "in_progress"])
        .gte("starts_at", startOfDay)
        .lte("starts_at", endOfDay)
        .order("starts_at", { ascending: true })
        .limit(5);

      const tournaments = (data ?? []) as Tournament[];
      setActiveTournaments(tournaments);

      // Auto-select if exactly one tournament (UCI-01)
      if (tournaments.length === 1) {
        setSelectedTournamentId(tournaments[0].id);
      }

      setDetectingTournament(false);
    }

    detectTournaments();
  }, [venue, tournamentIdParam]);

  const { players, loading } = useRealtimePlayers({
    sportFilter: null,
    skillFilter: null,
    venueId: venue?.id ?? null,
  });

  const handleInactivityReset = useCallback(() => {
    setView("checkin");
  }, []);

  // Determine if we're in bowls mode
  const isBowlsMode = modeParam === "bowls" || selectedTournamentId !== null || activeTournaments.length > 0;
  const selectedTournament = activeTournaments.find((t) => t.id === selectedTournamentId);

  // Tournament selection handler (UCI-05)
  function handleTournamentSelect(tournamentId: string) {
    setSelectedTournamentId(tournamentId);
  }

  return (
    <KioskWrapper inactivityTimeout={30000} onInactivityReset={handleInactivityReset}>
      <KioskLayout
        venueName={venue?.name}
        subtitle={
          selectedTournament
            ? `${selectedTournament.name} -- Tournament Check-In`
            : isBowlsMode && activeTournaments.length > 1
              ? "Select Tournament"
              : "Tournament Day Check-In"
        }
        activeTab={view}
        onTabChange={setView}
        playerCount={players.length}
      >
        {/* Timed-out or failed state */}
        {(loadTimedOut || venueLoadFailed) && !venue && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div
              className="mb-6 flex h-24 w-24 items-center justify-center rounded-full"
              style={{ backgroundColor: "#E8F5E9" }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1B5E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2
              className="mb-2 text-2xl font-bold"
              style={{ color: "#0A2E12" }}
            >
              No tournament scheduled today
            </h2>
            <p className="mb-6 text-lg" style={{ color: "#3D5A3E" }}>
              Check back on game day!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:brightness-110 active:scale-[0.97]"
              style={{ backgroundColor: "#1B5E20", minHeight: "56px" }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading state */}
        {(!venue || detectingTournament) && !loadTimedOut && !venueLoadFailed && (
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

        {/* Bowls mode: tournament selection when multiple tournaments (UCI-05) */}
        {venue && !detectingTournament && isBowlsMode && !selectedTournamentId && activeTournaments.length > 1 && view === "checkin" && (
          <KioskTournamentSelector
            tournaments={activeTournaments}
            onSelect={handleTournamentSelect}
          />
        )}

        {/* Bowls mode: bowls-specific check-in (UCI-02, UCI-03) */}
        {venue && !detectingTournament && selectedTournamentId && view === "checkin" && (
          <KioskBowlsCheckIn
            venueId={venue.id}
            tournamentId={selectedTournamentId}
            tournamentName={selectedTournament?.name ?? "Bowls Tournament"}
          />
        )}

        {/* Bowls mode requested but no tournaments found -- fallback to generic (UCI-12) */}
        {venue && !detectingTournament && isBowlsMode && !selectedTournamentId && activeTournaments.length === 0 && view === "checkin" && (
          <KioskCheckIn venueId={venue.id} />
        )}

        {/* Generic mode: original check-in (UCI-12) */}
        {venue && !detectingTournament && !isBowlsMode && view === "checkin" && (
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
      </KioskLayout>
    </KioskWrapper>
  );
}

/**
 * Tournament selection screen shown when multiple active tournaments exist (UCI-05)
 */
function KioskTournamentSelector({
  tournaments,
  onSelect,
}: {
  tournaments: Tournament[];
  onSelect: (id: string) => void;
}) {
  return (
    <section
      aria-label="Tournament selection"
      className="mx-auto flex max-w-2xl flex-col items-center py-12"
    >
      <div
        className="mb-8 flex items-center justify-center rounded-full"
        style={{
          width: "120px",
          height: "120px",
          backgroundColor: "#E8F5E9",
          border: "4px solid var(--kiosk-primary, #1B5E20)",
        }}
        aria-hidden="true"
      >
        <svg
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--kiosk-primary, #1B5E20)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>

      <h1
        className="mb-3 text-center font-black"
        style={{ fontSize: "36px", color: "var(--kiosk-text, #1A1A1A)" }}
      >
        Select Your Tournament
      </h1>
      <p
        className="mb-8 text-center"
        style={{ fontSize: "20px", color: "var(--kiosk-text-secondary, #666)" }}
      >
        Multiple tournaments are running today. Tap the one you&apos;re playing in.
      </p>

      <div className="flex w-full flex-col gap-4">
        {tournaments.map((tournament) => (
          <button
            key={tournament.id}
            onClick={() => onSelect(tournament.id)}
            className="w-full rounded-2xl touch-manipulation transition-all active:scale-[0.97] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0D47A1] focus-visible:outline-offset-2"
            style={{
              minHeight: "88px",
              padding: "20px 32px",
              backgroundColor: "var(--kiosk-surface, #fff)",
              border: "3px solid var(--kiosk-primary, #1B5E20)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
            aria-label={`Select tournament: ${tournament.name}`}
          >
            <span
              className="font-bold"
              style={{ fontSize: "26px", color: "var(--kiosk-primary, #1B5E20)" }}
            >
              {tournament.name}
            </span>
            {tournament.starts_at && (
              <span
                style={{ fontSize: "18px", color: "var(--kiosk-text-secondary, #666)" }}
              >
                {new Date(tournament.starts_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
