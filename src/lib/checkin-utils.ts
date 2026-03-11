/**
 * Unified Check-In utility functions.
 * Pure logic extracted for testability (UCI-14).
 */

import type { Tournament, BowlsCheckin, BowlsPosition, CheckinSource } from "./types";

/**
 * Determine if a tournament is "active" for kiosk auto-detection (UCI-01).
 * Active means status is 'registration' or 'in_progress' and starts_at is today.
 */
export function isTournamentActiveToday(
  tournament: Pick<Tournament, "status" | "starts_at">,
  now: Date = new Date()
): boolean {
  const validStatuses: string[] = ["registration", "in_progress"];
  if (!validStatuses.includes(tournament.status)) return false;
  if (!tournament.starts_at) return false;

  const startsAt = new Date(tournament.starts_at);
  return (
    startsAt.getFullYear() === now.getFullYear() &&
    startsAt.getMonth() === now.getMonth() &&
    startsAt.getDate() === now.getDate()
  );
}

/**
 * Filter active tournaments for a given day (UCI-01).
 */
export function filterActiveTournaments(
  tournaments: Tournament[],
  now: Date = new Date()
): Tournament[] {
  return tournaments.filter((t) => isTournamentActiveToday(t, now));
}

/**
 * Determine kiosk mode based on query params and detected tournaments (UCI-09, UCI-12).
 *
 * Returns:
 * - "bowls" if bowls mode is active (tournament detected or param set)
 * - "generic" if no tournament detected and no bowls param
 */
export function determineKioskMode(params: {
  modeParam: string | null;
  tournamentIdParam: string | null;
  activeTournaments: Tournament[];
}): "bowls" | "generic" {
  if (params.modeParam === "bowls") return "bowls";
  if (params.tournamentIdParam !== null) return "bowls";
  if (params.activeTournaments.length > 0) return "bowls";
  return "generic";
}

/**
 * Determine which tournament to auto-select (UCI-01, UCI-05).
 *
 * Returns:
 * - The tournament ID if exactly one active tournament
 * - null if zero or multiple tournaments (multi-select needed)
 */
export function autoSelectTournament(
  activeTournaments: Tournament[]
): string | null {
  if (activeTournaments.length === 1) return activeTournaments[0].id;
  return null;
}

/**
 * Find an existing check-in for a player in the check-in list (UCI-07).
 * Used to detect re-scans / duplicate check-in attempts.
 */
export function findExistingCheckin(
  checkins: BowlsCheckin[],
  playerId: string
): BowlsCheckin | null {
  return checkins.find((c) => c.player_id === playerId) ?? null;
}

/**
 * Build the check-in request payload for the API (UCI-03, UCI-13).
 * Handles "any" position by mapping to "lead" default.
 */
export function buildCheckinPayload(params: {
  playerId: string;
  tournamentId: string;
  position: BowlsPosition | "any";
  source: CheckinSource;
}): {
  player_id: string;
  tournament_id: string;
  preferred_position: BowlsPosition;
  checkin_source: CheckinSource;
} {
  return {
    player_id: params.playerId,
    tournament_id: params.tournamentId,
    preferred_position: params.position === "any" ? "lead" : params.position,
    checkin_source: params.source,
  };
}

/**
 * Validate check-in API request body.
 * Returns null if valid, or an error message string.
 */
export function validateCheckinRequest(body: {
  player_id?: string;
  tournament_id?: string;
  preferred_position?: string;
}): string | null {
  if (!body.player_id) return "player_id required";
  if (!body.tournament_id) return "tournament_id required";
  if (!body.preferred_position) return "preferred_position required";

  const validPositions: string[] = ["skip", "vice", "second", "lead"];
  if (!validPositions.includes(body.preferred_position)) {
    return `Invalid position: ${body.preferred_position}. Must be one of: ${validPositions.join(", ")}`;
  }

  return null;
}

/**
 * Validate checkin_source value.
 */
export function isValidCheckinSource(source: string): source is CheckinSource {
  return ["kiosk", "manual", "app"].includes(source);
}
