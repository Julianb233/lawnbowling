"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { KioskButton, KioskHeading, KioskText } from "./KioskLayout";
import type { Player, BowlsPosition } from "@/lib/types";
import { BOWLS_POSITION_LABELS } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────

type CheckInStep = "list" | "position" | "confirmation";

interface KioskCheckInProps {
  venueId: string;
  onCheckIn?: (player: Player) => void;
}

// ─── Constants ───────────────────────────────────────────────────

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

// ─── Alphabet filter ─────────────────────────────────────────────

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ─── Component ───────────────────────────────────────────────────

export function KioskCheckIn({ venueId, onCheckIn }: KioskCheckInProps) {
  // Data
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());

  // Flow state
  const [step, setStep] = useState<CheckInStep>("list");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<BowlsPosition | "any" | null>(null);

  // Letter filter
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Timers
  const [autoResetCountdown, setAutoResetCountdown] = useState(AUTO_RESET_SECONDS);
  const [undoCountdown, setUndoCountdown] = useState(UNDO_WINDOW_SECONDS);
  const [showUndo, setShowUndo] = useState(true);
  const autoResetRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Load players ──────────────────────────────────────────────

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

  // ─── Reset flow ────────────────────────────────────────────────

  const resetFlow = useCallback(() => {
    setStep("list");
    setSelectedPlayer(null);
    setSelectedPosition(null);
    setShowUndo(true);
    if (autoResetRef.current) clearInterval(autoResetRef.current);
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
  }, []);

  // ─── Auto-reset timer (confirmation screen) ───────────────────

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

  // ─── Undo timer ───────────────────────────────────────────────

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

  // ─── Handle check-in tap ──────────────────────────────────────

  function handlePlayerTap(player: Player) {
    if (checkedInIds.has(player.id)) return;
    setSelectedPlayer(player);
    setStep("position");
  }

  // ─── Handle position selection ─────────────────────────────────

  async function handlePositionSelect(position: BowlsPosition | "any") {
    if (!selectedPlayer) return;
    setSelectedPosition(position);

    // Perform check-in
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

  // ─── Handle undo ───────────────────────────────────────────────

  async function handleUndo() {
    if (!selectedPlayer) return;

    // Undo the check-in
    await fetch("/api/qr/checkin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: selectedPlayer.id,
        venue_id: venueId,
      }),
    });

    setCheckedInIds((prev) => {
      const next = new Set(prev);
      next.delete(selectedPlayer.id);
      return next;
    });

    resetFlow();
  }

  // ─── Filter players by letter ──────────────────────────────────

  const filteredPlayers = activeLetter
    ? players.filter((p) => {
        const surname = p.display_name.split(" ").pop() || p.display_name;
        return surname.toUpperCase().startsWith(activeLetter);
      })
    : players;

  // Determine which letters have players
  const availableLetters = new Set(
    players.map((p) => {
      const surname = p.display_name.split(" ").pop() || p.display_name;
      return surname[0]?.toUpperCase() || "";
    })
  );

  // ─── Loading ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" role="status" aria-label="Loading players">
        <div
          className="h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "#1B5E20", borderTopColor: "transparent" }}
        />
        <KioskText size="body" className="ml-4">
          Loading players...
        </KioskText>
      </div>
    );
  }

  // ─── STEP 1: Player List ───────────────────────────────────────

  if (step === "list") {
    const checkedInCount = checkedInIds.size;
    const totalCount = players.length;
    const progressPercent = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

    return (
      <section aria-label="Check-in list">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <KioskText size="label" color="secondary">
              {checkedInCount} of {totalCount} players checked in
            </KioskText>
            <KioskText size="label" color="secondary">
              {progressPercent}%
            </KioskText>
          </div>
          <div
            className="h-4 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "#E0E0E0" }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${checkedInCount} of ${totalCount} players checked in`}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: "#1B5E20",
              }}
            />
          </div>
        </div>

        {/* Instruction */}
        <KioskHeading level={2} align="center" className="mb-6">
          Tap your name to check in
        </KioskHeading>

        {/* Alphabet filter */}
        <nav
          className="mb-6 flex flex-wrap gap-2 justify-center"
          role="navigation"
          aria-label="Filter by surname letter"
        >
          <button
            onClick={() => setActiveLetter(null)}
            className="rounded-xl font-bold touch-manipulation transition-colors"
            style={{
              minHeight: "56px",
              minWidth: "64px",
              fontSize: "18px",
              padding: "8px 16px",
              backgroundColor: activeLetter === null ? "#1B5E20" : "#F0F0F0",
              color: activeLetter === null ? "#FFFFFF" : "#1A1A1A",
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
                className="rounded-xl font-bold touch-manipulation transition-colors"
                style={{
                  minHeight: "56px",
                  minWidth: "56px",
                  fontSize: "18px",
                  backgroundColor: isActive ? "#1B5E20" : hasPlayers ? "#F0F0F0" : "transparent",
                  color: isActive ? "#FFFFFF" : hasPlayers ? "#1A1A1A" : "#CCCCCC",
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

        {/* Player list -- full-width rows */}
        <ul role="list" className="flex flex-col gap-3">
          {filteredPlayers.map((player) => {
            const isCheckedIn = checkedInIds.has(player.id);
            // Format as "SURNAME, First"
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
                  disabled={isCheckedIn}
                  className="w-full rounded-2xl touch-manipulation transition-all active:scale-[0.98]"
                  style={{
                    minHeight: "72px",
                    padding: "16px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: isCheckedIn ? "#E8F5E9" : "#FFFFFF",
                    border: isCheckedIn ? "2px solid #1B5E20" : "2px solid #E0E0E0",
                    cursor: isCheckedIn ? "default" : "pointer",
                  }}
                  aria-label={
                    isCheckedIn
                      ? `${player.display_name} is already checked in`
                      : `Check in ${player.display_name}`
                  }
                >
                  {/* Player name */}
                  <span
                    className="font-semibold"
                    style={{
                      fontSize: "22px",
                      color: "#1A1A1A",
                      lineHeight: "1.4",
                    }}
                  >
                    {displayName}
                  </span>

                  {/* Status / action */}
                  {isCheckedIn ? (
                    <span
                      className="flex items-center gap-2 font-bold"
                      style={{ fontSize: "18px", color: "#1B5E20" }}
                    >
                      <svg
                        width="24"
                        height="24"
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
                      Checked In
                    </span>
                  ) : (
                    <span
                      className="rounded-xl px-6 py-3 font-bold"
                      style={{
                        fontSize: "18px",
                        backgroundColor: "#1B5E20",
                        color: "#FFFFFF",
                        minHeight: "56px",
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
      </section>
    );
  }

  // ─── STEP 2: Position Selection ────────────────────────────────

  if (step === "position" && selectedPlayer) {
    const firstName = selectedPlayer.display_name.split(" ")[0];

    return (
      <section
        aria-label="Position selection"
        className="mx-auto max-w-2xl"
      >
        <KioskHeading level={1} align="center" className="mb-3">
          Welcome, {firstName}!
        </KioskHeading>

        <KioskText size="body" color="secondary" align="center" className="mb-8">
          What position would you like to play today?
        </KioskText>

        <div className="flex flex-col gap-4">
          {POSITION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePositionSelect(option.value as BowlsPosition)}
              className="w-full rounded-2xl touch-manipulation transition-all active:scale-[0.97]"
              style={{
                minHeight: "88px",
                padding: "20px 32px",
                backgroundColor: "#FFFFFF",
                border: "3px solid #1B5E20",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
              aria-label={`Select position: ${option.label} -- ${option.description}`}
            >
              <span
                className="font-bold"
                style={{ fontSize: "26px", color: "#1B5E20", lineHeight: "1.3" }}
              >
                {option.label.toUpperCase()}
              </span>
              <span
                style={{ fontSize: "18px", color: "#4A4A4A", lineHeight: "1.4" }}
              >
                {option.description}
              </span>
            </button>
          ))}
        </div>

        {/* Back button */}
        <div className="mt-8 flex justify-center">
          <KioskButton
            variant="secondary"
            onClick={resetFlow}
            ariaLabel="Go back to player list"
          >
            Back to Player List
          </KioskButton>
        </div>
      </section>
    );
  }

  // ─── STEP 3: Confirmation ──────────────────────────────────────

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
        {/* Large checkmark */}
        <div
          className="mb-6 flex items-center justify-center rounded-full"
          style={{
            width: "120px",
            height: "120px",
            backgroundColor: "#1B5E20",
          }}
          aria-hidden="true"
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
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

        <KioskText size="body" align="center" className="mb-2">
          <strong>Position:</strong> {positionLabel}
        </KioskText>

        <KioskText size="label" color="secondary" align="center" className="mb-10">
          The draw will be posted soon. Please take a seat.
        </KioskText>

        {/* Action buttons */}
        <div className="flex w-full flex-col gap-4">
          {/* Undo button with countdown */}
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

          {/* Change position */}
          <KioskButton
            variant="outline"
            fullWidth
            onClick={() => setStep("position")}
            ariaLabel="Change your position preference"
          >
            Change Position
          </KioskButton>
        </div>

        {/* Insurance upsell - non-blocking, appears after confirmation */}
        <div
          className="mt-8 w-full rounded-2xl p-5"
          style={{ backgroundColor: "#F1F8E9", border: "2px solid #C5E1A5" }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex shrink-0 items-center justify-center rounded-full"
              style={{ width: "56px", height: "56px", backgroundColor: "#1B5E20" }}
              aria-hidden="true"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex-1">
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#1A1A1A", lineHeight: "1.3" }}>
                Protect Your Game
              </p>
              <p style={{ fontSize: "16px", color: "#4A4A4A", marginTop: "4px", lineHeight: "1.4" }}>
                Per-session coverage from $3/player
              </p>
              <a
                href="/insurance/lawn-bowls"
                className="mt-3 inline-flex items-center rounded-xl font-bold touch-manipulation"
                style={{
                  fontSize: "16px",
                  padding: "10px 20px",
                  backgroundColor: "#1B5E20",
                  color: "#FFFFFF",
                  minHeight: "56px",
                }}
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Auto-reset countdown */}
        <div className="mt-10 flex flex-col items-center">
          <KioskText size="caption" color="secondary" align="center">
            This screen will reset in {autoResetCountdown} seconds
          </KioskText>
          {/* Visual countdown bar */}
          <div
            className="mt-3 h-2 overflow-hidden rounded-full"
            style={{
              width: "200px",
              backgroundColor: "#E0E0E0",
            }}
            role="timer"
            aria-label={`Auto-reset in ${autoResetCountdown} seconds`}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${(autoResetCountdown / AUTO_RESET_SECONDS) * 100}%`,
                backgroundColor: "#1B5E20",
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  return null;
}
