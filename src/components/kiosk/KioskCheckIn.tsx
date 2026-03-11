"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { KioskButton, KioskHeading, KioskText } from "./KioskLayout";
import type { Player, BowlsPosition } from "@/lib/types";
import { BOWLS_POSITION_LABELS } from "@/lib/types";

type CheckInStep = "welcome" | "list" | "position" | "confirmation";

interface KioskCheckInProps {
  venueId: string;
  onCheckIn?: (player: Player) => void;
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

export function KioskCheckIn({ venueId, onCheckIn }: KioskCheckInProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<CheckInStep>("welcome");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<BowlsPosition | "any" | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [autoResetCountdown, setAutoResetCountdown] = useState(AUTO_RESET_SECONDS);
  const [undoCountdown, setUndoCountdown] = useState(UNDO_WINDOW_SECONDS);
  const [showUndo, setShowUndo] = useState(true);
  const autoResetRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const resetFlow = useCallback(() => {
    setStep("welcome");
    setSelectedPlayer(null);
    setSelectedPosition(null);
    setActiveLetter(null);
    setShowUndo(true);
    if (autoResetRef.current) clearInterval(autoResetRef.current);
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
  }, []);

  useEffect(() => {
    if (step !== "confirmation") return;
    setAutoResetCountdown(AUTO_RESET_SECONDS);
    const interval = setInterval(() => {
      setAutoResetCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); resetFlow(); return 0; }
        return prev - 1;
      });
    }, 1000);
    autoResetRef.current = interval;
    return () => clearInterval(interval);
  }, [step, resetFlow]);

  useEffect(() => {
    if (step !== "confirmation") return;
    setUndoCountdown(UNDO_WINDOW_SECONDS);
    setShowUndo(true);
    const interval = setInterval(() => {
      setUndoCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); setShowUndo(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    undoTimerRef.current = interval;
    return () => clearInterval(interval);
  }, [step]);

  function handlePlayerTap(player: Player) {
    if (checkedInIds.has(player.id)) return;
    setSelectedPlayer(player);
    setStep("position");
  }

  async function handlePositionSelect(position: BowlsPosition | "any") {
    if (!selectedPlayer) return;
    setSelectedPosition(position);
    await fetch("/api/qr/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: selectedPlayer.id,
        venue_id: venueId,
        position: position === "any" ? null : position,
      }),
    });
    setCheckedInIds((prev) => new Set(prev).add(selectedPlayer.id));
    onCheckIn?.(selectedPlayer);
    setStep("confirmation");
  }

  async function handleUndo() {
    if (!selectedPlayer) return;
    await fetch("/api/qr/checkin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: selectedPlayer.id, venue_id: venueId }),
    });
    setCheckedInIds((prev) => {
      const next = new Set(prev);
      next.delete(selectedPlayer.id);
      return next;
    });
    resetFlow();
  }

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
        <KioskText size="body" className="ml-4">Loading players...</KioskText>
      </div>
    );
  }

  // --- SCREEN 1: Welcome ---

  if (step === "welcome") {
    const checkedInCount = checkedInIds.size;
    const totalCount = players.length;

    return (
      <section
        aria-label="Welcome screen"
        className="mx-auto flex max-w-2xl flex-col items-center py-12"
      >
        {/* Lawn bowls icon */}
        <div
          className="mb-8 flex items-center justify-center rounded-full"
          style={{
            width: "140px",
            height: "140px",
            backgroundColor: "#E8F5E9",
            border: "4px solid var(--kiosk-primary)",
          }}
          aria-hidden="true"
        >
          <svg
            width="72"
            height="72"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--kiosk-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        <KioskHeading level={1} align="center" className="mb-4">
          Welcome to Bowls Day
        </KioskHeading>

        <KioskText size="body" color="secondary" align="center" className="mb-4">
          Tap the button below to check in for today&apos;s session.
        </KioskText>

        {checkedInCount > 0 && (
          <KioskText size="label" color="secondary" align="center" className="mb-8">
            {checkedInCount} of {totalCount} players already checked in
          </KioskText>
        )}

        {checkedInCount === 0 && <div className="mb-8" />}

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
    const checkedInCount = checkedInIds.size;
    const totalCount = players.length;
    const progressPercent = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

    return (
      <section aria-label="Check-in list">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <KioskText size="label" color="secondary">
              {checkedInCount} of {totalCount} players checked in
            </KioskText>
            <KioskText size="label" color="secondary">{progressPercent}%</KioskText>
          </div>
          <div
            className="h-5 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "#E0E0E0" }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${checkedInCount} of ${totalCount} players checked in`}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: "var(--kiosk-primary)" }}
            />
          </div>
        </div>

        <KioskHeading level={2} align="center" className="mb-2">
          Find Your Name
        </KioskHeading>

        <KioskText size="body" color="secondary" align="center" className="mb-6">
          Use the letters below to filter, then tap your name
        </KioskText>

        <nav className="mb-6 flex flex-wrap gap-2 justify-center" role="navigation" aria-label="Filter by surname letter">
          <button
            onClick={() => setActiveLetter(null)}
            className="rounded-xl font-bold touch-manipulation transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0D47A1] focus-visible:outline-offset-2"
            style={{
              minHeight: "var(--kiosk-touch-target-min)",
              minWidth: "64px",
              fontSize: "var(--kiosk-text-label)",
              padding: "8px 16px",
              backgroundColor: activeLetter === null ? "var(--kiosk-primary)" : "#F0F0F0",
              color: activeLetter === null ? "var(--kiosk-on-primary)" : "var(--kiosk-text)",
            }}
            aria-label="Show all players"
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
                className="rounded-xl font-bold touch-manipulation transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0D47A1] focus-visible:outline-offset-2"
                style={{
                  minHeight: "var(--kiosk-touch-target-min)",
                  minWidth: "var(--kiosk-touch-target-min)",
                  fontSize: "var(--kiosk-text-label)",
                  backgroundColor: isActive ? "var(--kiosk-primary)" : hasPlayers ? "#F0F0F0" : "transparent",
                  color: isActive ? "var(--kiosk-on-primary)" : hasPlayers ? "var(--kiosk-text)" : "#CCCCCC",
                  cursor: hasPlayers ? "pointer" : "default",
                }}
                aria-label={`Filter by letter ${letter}`}
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
            const displayName = surname ? `${surname.toUpperCase()}, ${firstName}` : firstName.toUpperCase();

            return (
              <li key={player.id}>
                <button
                  onClick={() => handlePlayerTap(player)}
                  disabled={isCheckedIn}
                  className="w-full rounded-2xl touch-manipulation transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0D47A1] focus-visible:outline-offset-2"
                  style={{
                    minHeight: "var(--kiosk-touch-target-primary)",
                    padding: "16px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: isCheckedIn ? "#E8F5E9" : "var(--kiosk-surface)",
                    border: isCheckedIn ? "3px solid var(--kiosk-success)" : "2px solid #E0E0E0",
                    cursor: isCheckedIn ? "default" : "pointer",
                  }}
                  aria-label={isCheckedIn ? `${player.display_name} is already checked in` : `Check in ${player.display_name}`}
                >
                  <span className="font-semibold" style={{ fontSize: "22px", color: "var(--kiosk-text)", lineHeight: "1.4" }}>
                    {displayName}
                  </span>
                  {isCheckedIn ? (
                    <span className="flex items-center gap-2 font-bold" style={{ fontSize: "var(--kiosk-text-label)", color: "var(--kiosk-success)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Checked In
                    </span>
                  ) : (
                    <span className="rounded-xl px-6 py-3 font-bold" style={{ fontSize: "var(--kiosk-text-label)", backgroundColor: "var(--kiosk-primary)", color: "var(--kiosk-on-primary)", minHeight: "48px", display: "flex", alignItems: "center" }}>
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

        {/* Back to Welcome */}
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

  if (step === "position" && selectedPlayer) {
    const firstName = selectedPlayer.display_name.split(" ")[0];
    return (
      <section aria-label="Position selection" className="mx-auto max-w-2xl">
        <KioskText size="label" color="secondary" align="center" className="mb-4">Step 2 of 3</KioskText>
        <KioskHeading level={1} align="center" className="mb-3">Welcome, {firstName}!</KioskHeading>
        <KioskText size="body" color="secondary" align="center" className="mb-8">
          What position would you like to play today?
        </KioskText>
        <div className="flex flex-col gap-4">
          {POSITION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePositionSelect(option.value as BowlsPosition)}
              className="w-full rounded-2xl touch-manipulation transition-all active:scale-[0.97] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0D47A1] focus-visible:outline-offset-2"
              style={{
                minHeight: "88px",
                padding: "20px 32px",
                backgroundColor: "var(--kiosk-surface)",
                border: "3px solid var(--kiosk-primary)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
              aria-label={`Select position: ${option.label} -- ${option.description}`}
            >
              <span className="font-bold" style={{ fontSize: "26px", color: "var(--kiosk-primary)", lineHeight: "1.3" }}>
                {option.label.toUpperCase()}
              </span>
              <span style={{ fontSize: "var(--kiosk-text-label)", color: "var(--kiosk-text-secondary)", lineHeight: "1.4" }}>
                {option.description}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <KioskButton variant="secondary" onClick={() => { setSelectedPlayer(null); setStep("list"); }} ariaLabel="Go back to player list">
            Back to Player List
          </KioskButton>
        </div>
      </section>
    );
  }

  if (step === "confirmation" && selectedPlayer) {
    const firstName = selectedPlayer.display_name.split(" ")[0];
    const positionLabel = selectedPosition === "any" ? "Any Position" : selectedPosition ? BOWLS_POSITION_LABELS[selectedPosition].label : "Any";

    return (
      <section aria-label="Check-in confirmation" className="mx-auto flex max-w-2xl flex-col items-center py-8" aria-live="polite">
        <KioskText size="label" color="secondary" align="center" className="mb-4">Step 3 of 3</KioskText>
        <div className="mb-6 flex items-center justify-center rounded-full" style={{ width: "120px", height: "120px", backgroundColor: "var(--kiosk-success)" }} aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--kiosk-on-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <KioskHeading level={1} align="center" className="mb-3">You&apos;re checked in, {firstName}!</KioskHeading>
        <KioskText size="body" align="center" className="mb-2"><strong>Position:</strong> {positionLabel}</KioskText>
        <KioskText size="label" color="secondary" align="center" className="mb-10">The draw will be posted soon. Please take a seat.</KioskText>
        <div className="flex w-full flex-col gap-4">
          {showUndo && (
            <KioskButton variant="danger" fullWidth onClick={handleUndo} ariaLabel={`Undo check-in. ${undoCountdown} seconds remaining.`}>
              Undo Check-In ({undoCountdown}s)
            </KioskButton>
          )}
          <KioskButton variant="outline" fullWidth onClick={() => setStep("position")} ariaLabel="Change your position preference">
            Change Position
          </KioskButton>
        </div>
        <div className="mt-10 flex flex-col items-center">
          <KioskText size="caption" color="secondary" align="center">This screen will reset in {autoResetCountdown} seconds</KioskText>
          <div className="mt-3 h-3 overflow-hidden rounded-full" style={{ width: "240px", backgroundColor: "#E0E0E0" }} role="timer" aria-label={`Auto-reset in ${autoResetCountdown} seconds`}>
            <div className="h-full rounded-full transition-all duration-1000 ease-linear" style={{ width: `${(autoResetCountdown / AUTO_RESET_SECONDS) * 100}%`, backgroundColor: "var(--kiosk-primary)" }} />
          </div>
        </div>
      </section>
    );
  }

  return null;
}
