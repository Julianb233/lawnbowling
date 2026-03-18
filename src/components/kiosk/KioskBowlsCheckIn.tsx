"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { KioskButton, KioskHeading, KioskText } from "./KioskLayout";
import type { Player, BowlsPosition, BowlsCheckin } from "@/lib/types";
import { BOWLS_POSITION_LABELS } from "@/lib/types";

type CheckInStep = "welcome" | "list" | "position" | "confirmation";

interface KioskBowlsCheckInProps {
  venueId: string;
  tournamentId: string;
  tournamentName: string;
}

const AUTO_RESET_SECONDS = 15;
const UNDO_WINDOW_SECONDS = 10;

const POSITION_OPTIONS: {
  value: BowlsPosition | "any";
  label: string;
  description: string;
}[] = [
  { value: "skip", label: "Skip", description: BOWLS_POSITION_LABELS.skip.description },
  { value: "vice", label: "Vice", description: BOWLS_POSITION_LABELS.vice.description },
  { value: "lead", label: "Lead", description: BOWLS_POSITION_LABELS.lead.description },
  { value: "any", label: "Any Position", description: "Let the drawmaster decide" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Bowls-specific kiosk check-in flow (UCI-02).
 * Writes directly to bowls_checkins with checkin_source='kiosk' (UCI-03).
 * Handles re-scan / duplicate detection (UCI-07).
 * Shows confirmation for at least 4 seconds (UCI-06).
 */
export function KioskBowlsCheckIn({
  venueId,
  tournamentId,
  tournamentName,
}: KioskBowlsCheckInProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState<BowlsCheckin[]>([]);
  const [step, setStep] = useState<CheckInStep>("welcome");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<BowlsPosition | "any" | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [autoResetCountdown, setAutoResetCountdown] = useState(AUTO_RESET_SECONDS);
  const [undoCountdown, setUndoCountdown] = useState(UNDO_WINDOW_SECONDS);
  const [showUndo, setShowUndo] = useState(true);
  const [existingCheckin, setExistingCheckin] = useState<BowlsCheckin | null>(null);
  const [preSelectedPosition, setPreSelectedPosition] = useState<BowlsPosition | "any" | null>(null);
  const [preSelectSource, setPreSelectSource] = useState<"preferred" | "last_used" | null>(null);
  const autoResetRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load players for this venue
  useEffect(() => {
    async function loadPlayers() {
      const supabase = createClient();
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("venue_id", venueId)
        .order("display_name");
      setPlayers((data as Player[]) || []);
      setLoading(false);
    }
    loadPlayers();
  }, [venueId]);

  // Load current check-ins for this tournament
  const loadCheckins = useCallback(async () => {
    try {
      const res = await fetch(`/api/bowls/checkin?tournament_id=${tournamentId}`);
      if (res.ok) {
        const data = await res.json();
        setCheckins(data);
      }
    } catch {
      // Will retry on next poll
    }
  }, [tournamentId]);

  useEffect(() => {
    loadCheckins();
    // Fallback polling (UCI realtime may not be available in all environments)
    const interval = setInterval(loadCheckins, 5000);
    return () => clearInterval(interval);
  }, [loadCheckins]);

  // Realtime subscription for bowls_checkins (UCI-04 primary mechanism)
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`bowls_checkins_kiosk_${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bowls_checkins",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          loadCheckins();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, loadCheckins]);

  const resetFlow = useCallback(() => {
    setStep("welcome");
    setSelectedPlayer(null);
    setSelectedPosition(null);
    setPreSelectedPosition(null);
    setPreSelectSource(null);
    setActiveLetter(null);
    setShowUndo(true);
    setExistingCheckin(null);
    if (autoResetRef.current) clearInterval(autoResetRef.current);
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
  }, []);

  // Auto-reset timer on confirmation screen
  useEffect(() => {
    if (step !== "confirmation") return;
    setAutoResetCountdown(AUTO_RESET_SECONDS);
    const interval = setInterval(() => {
      setAutoResetCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          resetFlow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    autoResetRef.current = interval;
    return () => clearInterval(interval);
  }, [step, resetFlow]);

  // Undo window timer
  useEffect(() => {
    if (step !== "confirmation") return;
    setUndoCountdown(UNDO_WINDOW_SECONDS);
    setShowUndo(true);
    const interval = setInterval(() => {
      setUndoCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowUndo(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    undoTimerRef.current = interval;
    return () => clearInterval(interval);
  }, [step]);

  async function handlePlayerTap(player: Player) {
    // UCI-07: If already checked in, show their existing check-in with option to change position
    const existing = checkins.find((c) => c.player_id === player.id);
    if (existing) {
      setSelectedPlayer(player);
      setExistingCheckin(existing);
      setPreSelectedPosition(null);
      setPreSelectSource(null);
      setStep("position");
      return;
    }

    setSelectedPlayer(player);
    setExistingCheckin(null);

    // US-005: Pre-select position from profile preference or last check-in
    // Guest players (no profile preferred_position) default to no selection
    if (player.preferred_position) {
      setPreSelectedPosition(player.preferred_position);
      setPreSelectSource("preferred");
    } else {
      // Fallback: check last bowls_checkins record for this player
      try {
        const supabase = createClient();
        const { data: lastCheckins } = await supabase
          .from("bowls_checkins")
          .select("preferred_position")
          .eq("player_id", player.id)
          .order("checked_in_at", { ascending: false })
          .limit(1);
        if (lastCheckins && lastCheckins.length > 0) {
          setPreSelectedPosition(lastCheckins[0].preferred_position as BowlsPosition);
          setPreSelectSource("last_used");
        } else {
          setPreSelectedPosition(null);
          setPreSelectSource(null);
        }
      } catch {
        setPreSelectedPosition(null);
        setPreSelectSource(null);
      }
    }

    setStep("position");
  }

  async function handlePositionSelect(position: BowlsPosition | "any") {
    if (!selectedPlayer) return;
    const actualPosition = position === "any" ? "lead" : position;
    setSelectedPosition(position);

    // UCI-03: Write directly to bowls_checkins with checkin_source='kiosk'
    await fetch("/api/bowls/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: selectedPlayer.id,
        tournament_id: tournamentId,
        preferred_position: actualPosition,
        checkin_source: "kiosk",
      }),
    });

    await loadCheckins();
    setStep("confirmation");
  }

  async function handleUndo() {
    if (!selectedPlayer) return;
    await fetch("/api/bowls/checkin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: selectedPlayer.id,
        tournament_id: tournamentId,
      }),
    });
    await loadCheckins();
    resetFlow();
  }

  const checkedInIds = new Set(checkins.map((c) => c.player_id));
  const checkedInCount = checkins.length;

  const filteredPlayers = activeLetter
    ? players.filter((p) => {
        const surname = p.display_name.split(" ").pop() || p.display_name;
        return surname.toUpperCase().startsWith(activeLetter);
      })
    : players;

  const availableLetters = new Set(
    players.map((p) => {
      const surname = p.display_name.split(" ").pop() || p.display_name;
      return surname[0]?.toUpperCase() || "";
    })
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" role="status" aria-label="Loading players">
        <div
          className="h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "var(--kiosk-primary)", borderTopColor: "transparent" }}
        />
        <KioskText size="body" className="ml-4">
          Loading players...
        </KioskText>
      </div>
    );
  }

  // --- SCREEN 1: Welcome (UCI-08: tournament-specific header) ---
  if (step === "welcome") {
    return (
      <section
        aria-label="Welcome screen"
        className="mx-auto flex max-w-2xl flex-col items-center py-12"
      >
        {/* Bowls tournament header (UCI-08) */}
        <div
          className="mb-4 rounded-2xl px-6 py-3"
          style={{ backgroundColor: "#E8F5E9" }}
        >
          <span
            className="font-bold"
            style={{ fontSize: "20px", color: "var(--kiosk-primary, #1B5E20)" }}
          >
            {tournamentName}
          </span>
        </div>

        <div
          className="mb-8 flex items-center justify-center rounded-full"
          style={{
            width: "140px",
            height: "140px",
            backgroundColor: "#E8F5E9",
            border: "4px solid var(--kiosk-primary, #1B5E20)",
          }}
          aria-hidden="true"
        >
          <svg
            width="72"
            height="72"
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

        <KioskHeading level={1} align="center" className="mb-4">
          Tournament Check-In
        </KioskHeading>

        <KioskText size="body" color="secondary" align="center" className="mb-4">
          Tap the button below to check in and select your position.
        </KioskText>

        {/* Player count (UCI-08) */}
        <KioskText size="label" color="secondary" align="center" className="mb-8">
          {checkedInCount} player{checkedInCount !== 1 ? "s" : ""} checked in
        </KioskText>

        <KioskButton
          onClick={() => setStep("list")}
          fullWidth
          ariaLabel="Begin check-in - find your name"
        >
          Check In Now
        </KioskButton>

        <div className="mt-6">
          <KioskText size="caption" color="secondary" align="center">
            Touch anywhere to get started
          </KioskText>
        </div>
      </section>
    );
  }

  // --- SCREEN 2: Name Search with A-Z Filter ---
  if (step === "list") {
    const totalCount = players.length;
    const progressPercent = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

    return (
      <section aria-label="Check-in list">
        {/* Tournament header (UCI-08) */}
        <div
          className="mb-4 rounded-2xl px-5 py-3 text-center"
          style={{ backgroundColor: "#E8F5E9" }}
        >
          <span
            className="font-bold"
            style={{ fontSize: "18px", color: "var(--kiosk-primary, #1B5E20)" }}
          >
            {tournamentName} -- {checkedInCount} checked in
          </span>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <KioskText size="label" color="secondary">
              {checkedInCount} of {totalCount} players checked in
            </KioskText>
            <KioskText size="label" color="secondary">
              {progressPercent}%
            </KioskText>
          </div>
          <div
            className="h-5 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "#E0E0E0" }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: "var(--kiosk-primary)",
              }}
            />
          </div>
        </div>

        <KioskHeading level={2} align="center" className="mb-2">
          Find Your Name
        </KioskHeading>

        <KioskText size="body" color="secondary" align="center" className="mb-6">
          Use the letters below to filter, then tap your name
        </KioskText>

        <nav
          className="mb-6 flex flex-wrap justify-center gap-2"
          role="navigation"
          aria-label="Filter by surname letter"
        >
          <button
            onClick={() => setActiveLetter(null)}
            className="rounded-xl font-bold touch-manipulation transition-colors"
            style={{
              minHeight: "var(--kiosk-touch-target-min, 56px)",
              minWidth: "64px",
              fontSize: "var(--kiosk-text-label, 18px)",
              padding: "8px 16px",
              backgroundColor:
                activeLetter === null ? "var(--kiosk-primary, #1B5E20)" : "#F0F0F0",
              color:
                activeLetter === null
                  ? "var(--kiosk-on-primary, #fff)"
                  : "var(--kiosk-text, #1A1A1A)",
            }}
            aria-pressed={activeLetter === null}
          >
            All
          </button>
          {ALPHABET.map((letter) => {
            const hasPlayers = availableLetters.has(letter);
            const isActive = activeLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => hasPlayers && setActiveLetter(letter)}
                disabled={!hasPlayers}
                className="rounded-xl font-bold touch-manipulation transition-colors"
                style={{
                  minHeight: "var(--kiosk-touch-target-min, 56px)",
                  minWidth: "var(--kiosk-touch-target-min, 56px)",
                  fontSize: "var(--kiosk-text-label, 18px)",
                  backgroundColor: isActive
                    ? "var(--kiosk-primary, #1B5E20)"
                    : hasPlayers
                      ? "#F0F0F0"
                      : "transparent",
                  color: isActive
                    ? "var(--kiosk-on-primary, #fff)"
                    : hasPlayers
                      ? "var(--kiosk-text, #1A1A1A)"
                      : "#CCCCCC",
                  cursor: hasPlayers ? "pointer" : "default",
                }}
                aria-pressed={isActive}
              >
                {letter}
              </button>
            );
          })}
        </nav>

        <ul role="list" className="flex flex-col gap-3">
          {filteredPlayers.map((player) => {
            const isCheckedIn = checkedInIds.has(player.id);
            const nameParts = player.display_name.split(" ");
            const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0];
            const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
            const displayName = surname
              ? `${surname.toUpperCase()}, ${firstName}`
              : firstName.toUpperCase();

            return (
              <li key={player.id}>
                <button
                  onClick={() => handlePlayerTap(player)}
                  className="w-full rounded-2xl touch-manipulation transition-all active:scale-[0.98]"
                  style={{
                    minHeight: "var(--kiosk-touch-target-primary, 72px)",
                    padding: "16px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: isCheckedIn
                      ? "#E8F5E9"
                      : "var(--kiosk-surface, #fff)",
                    border: isCheckedIn
                      ? "3px solid var(--kiosk-success, #2E7D32)"
                      : "2px solid #E0E0E0",
                    cursor: "pointer",
                  }}
                  aria-label={
                    isCheckedIn
                      ? `${player.display_name} is checked in -- tap to change position`
                      : `Check in ${player.display_name}`
                  }
                >
                  <span
                    className="font-semibold"
                    style={{ fontSize: "22px", color: "var(--kiosk-text, #1A1A1A)" }}
                  >
                    {displayName}
                  </span>
                  {isCheckedIn ? (
                    <span
                      className="flex items-center gap-2 font-bold"
                      style={{
                        fontSize: "var(--kiosk-text-label, 18px)",
                        color: "var(--kiosk-success, #2E7D32)",
                      }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Checked In -- Tap to Change
                    </span>
                  ) : (
                    <span
                      className="rounded-xl px-6 py-3 font-bold"
                      style={{
                        fontSize: "var(--kiosk-text-label, 18px)",
                        backgroundColor: "var(--kiosk-primary, #1B5E20)",
                        color: "var(--kiosk-on-primary, #fff)",
                        minHeight: "48px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Check In
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {filteredPlayers.length === 0 && (
          <div className="py-12 text-center">
            <KioskText size="body" color="secondary" align="center">
              No players found{activeLetter ? ` starting with "${activeLetter}"` : ""}.
            </KioskText>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <KioskButton
            variant="secondary"
            onClick={resetFlow}
            ariaLabel="Go back to welcome screen"
          >
            Back
          </KioskButton>
        </div>
      </section>
    );
  }

  // --- SCREEN 3: Position Selection (UCI-02) ---
  if (step === "position" && selectedPlayer) {
    const firstName = selectedPlayer.display_name.split(" ")[0];
    return (
      <section aria-label="Position selection" className="mx-auto max-w-2xl">
        <KioskText size="label" color="secondary" align="center" className="mb-4">
          Step 2 of 3
        </KioskText>
        <KioskHeading level={1} align="center" className="mb-3">
          Welcome, {firstName}!
        </KioskHeading>
        {existingCheckin && (
          <div
            className="mx-auto mb-4 rounded-2xl px-5 py-3 text-center"
            style={{ backgroundColor: "#FFF8E1", border: "2px solid #FFB300" }}
          >
            <KioskText size="label" align="center">
              You&apos;re already checked in as{" "}
              <strong>
                {BOWLS_POSITION_LABELS[existingCheckin.preferred_position]?.label}
              </strong>
              . Select a new position below to change it.
            </KioskText>
          </div>
        )}
        <KioskText size="body" color="secondary" align="center" className="mb-8">
          What position would you like to play in {tournamentName}?
        </KioskText>
        <div className="flex flex-col gap-4">
          {POSITION_OPTIONS.map((option) => {
            const isPreSelected = !existingCheckin && preSelectedPosition === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handlePositionSelect(option.value as BowlsPosition)}
                className="w-full rounded-2xl touch-manipulation transition-all active:scale-[0.97]"
                style={{
                  minHeight: "88px",
                  padding: "20px 32px",
                  backgroundColor: isPreSelected
                    ? "#E8F5E9"
                    : "var(--kiosk-surface, #fff)",
                  border: isPreSelected
                    ? "4px solid var(--kiosk-primary, #1B5E20)"
                    : "3px solid var(--kiosk-primary, #1B5E20)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  boxShadow: isPreSelected
                    ? "0 0 0 2px var(--kiosk-primary, #1B5E20)"
                    : "none",
                }}
                aria-label={
                  isPreSelected
                    ? `Select position: ${option.label} (${preSelectSource === "preferred" ? "Preferred" : "Last used"})`
                    : `Select position: ${option.label}`
                }
              >
                <span
                  className="font-bold"
                  style={{ fontSize: "26px", color: "var(--kiosk-primary, #1B5E20)" }}
                >
                  {option.label.toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: "var(--kiosk-text-label, 18px)",
                    color: "var(--kiosk-text-secondary, #666)",
                  }}
                >
                  {option.description}
                </span>
                {isPreSelected && preSelectSource && (
                  <span
                    className="mt-1 rounded-full px-3 py-1 font-semibold"
                    style={{
                      fontSize: "14px",
                      backgroundColor: "var(--kiosk-primary, #1B5E20)",
                      color: "var(--kiosk-on-primary, #fff)",
                    }}
                  >
                    {preSelectSource === "preferred" ? "Preferred" : "Last used"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <KioskButton
            variant="secondary"
            onClick={() => {
              setSelectedPlayer(null);
              setExistingCheckin(null);
              setPreSelectedPosition(null);
              setPreSelectSource(null);
              setStep("list");
            }}
            ariaLabel="Go back to player list"
          >
            Back to Player List
          </KioskButton>
        </div>
      </section>
    );
  }

  // --- SCREEN 4: Confirmation (UCI-06: shown for at least 4 seconds) ---
  if (step === "confirmation" && selectedPlayer) {
    const firstName = selectedPlayer.display_name.split(" ")[0];
    const positionLabel =
      selectedPosition === "any"
        ? "Any Position"
        : selectedPosition
          ? BOWLS_POSITION_LABELS[selectedPosition].label
          : "Any";

    return (
      <section
        aria-label="Check-in confirmation"
        className="mx-auto flex max-w-2xl flex-col items-center py-8"
        aria-live="polite"
      >
        <KioskText size="label" color="secondary" align="center" className="mb-4">
          Step 3 of 3
        </KioskText>

        <div
          className="mb-6 flex items-center justify-center rounded-full"
          style={{
            width: "120px",
            height: "120px",
            backgroundColor: "var(--kiosk-success, #2E7D32)",
          }}
          aria-hidden="true"
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--kiosk-on-primary, #fff)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <KioskHeading level={1} align="center" className="mb-3">
          You&apos;re checked in, {firstName}!
        </KioskHeading>

        {/* UCI-06: Show tournament name and position */}
        <KioskText size="body" align="center" className="mb-1">
          <strong>Tournament:</strong> {tournamentName}
        </KioskText>
        <KioskText size="body" align="center" className="mb-2">
          <strong>Position:</strong> {positionLabel}
        </KioskText>
        <KioskText size="label" color="secondary" align="center" className="mb-10">
          The draw will be posted soon. Please take a seat.
        </KioskText>

        <div className="flex w-full flex-col gap-4">
          {showUndo && (
            <KioskButton
              variant="danger"
              fullWidth
              onClick={handleUndo}
              ariaLabel={`Undo check-in. ${undoCountdown} seconds remaining.`}
            >
              Undo Check-In ({undoCountdown}s)
            </KioskButton>
          )}
          <KioskButton
            variant="outline"
            fullWidth
            onClick={() => setStep("position")}
            ariaLabel="Change your position preference"
          >
            Change Position
          </KioskButton>
        </div>

        <div className="mt-10 flex flex-col items-center">
          <KioskText size="caption" color="secondary" align="center">
            This screen will reset in {autoResetCountdown} seconds
          </KioskText>
          <div
            className="mt-3 h-3 overflow-hidden rounded-full"
            style={{ width: "240px", backgroundColor: "#E0E0E0" }}
            role="timer"
            aria-label={`Auto-reset in ${autoResetCountdown} seconds`}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${(autoResetCountdown / AUTO_RESET_SECONDS) * 100}%`,
                backgroundColor: "var(--kiosk-primary)",
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  return null;
}
