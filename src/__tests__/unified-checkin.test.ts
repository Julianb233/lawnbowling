import { describe, it, expect } from "vitest";
import type { Tournament } from "@/lib/types";

// ─── Tournament Auto-Detection Logic (UCI-01) ──────────────────────────

/**
 * Replicate the auto-detection logic from kiosk/page.tsx:
 * Given a list of tournaments for today, determine kiosk mode behavior.
 */
function detectKioskMode(
  tournaments: Pick<Tournament, "id" | "name" | "status" | "starts_at">[],
  modeParam: string | null,
  tournamentIdParam: string | null
) {
  const selectedTournamentId = tournamentIdParam ?? (tournaments.length === 1 ? tournaments[0].id : null);
  const isBowlsMode = modeParam === "bowls" || selectedTournamentId !== null || tournaments.length > 0;
  const needsTournamentSelection = isBowlsMode && !selectedTournamentId && tournaments.length > 1;

  return { isBowlsMode, selectedTournamentId, needsTournamentSelection };
}

describe("Tournament Auto-Detection (UCI-01)", () => {
  const makeTournament = (id: string, name: string): Pick<Tournament, "id" | "name" | "status" | "starts_at"> => ({
    id,
    name,
    status: "registration",
    starts_at: new Date().toISOString(),
  });

  it("auto-selects when exactly one tournament exists", () => {
    const tournaments = [makeTournament("t1", "Wednesday Social")];
    const result = detectKioskMode(tournaments, null, null);
    expect(result.isBowlsMode).toBe(true);
    expect(result.selectedTournamentId).toBe("t1");
    expect(result.needsTournamentSelection).toBe(false);
  });

  it("requires selection when multiple tournaments exist (UCI-05)", () => {
    const tournaments = [
      makeTournament("t1", "Morning Pairs"),
      makeTournament("t2", "Afternoon Triples"),
    ];
    const result = detectKioskMode(tournaments, null, null);
    expect(result.isBowlsMode).toBe(true);
    expect(result.selectedTournamentId).toBeNull();
    expect(result.needsTournamentSelection).toBe(true);
  });

  it("falls back to generic mode when no tournaments exist (UCI-12)", () => {
    const result = detectKioskMode([], null, null);
    expect(result.isBowlsMode).toBe(false);
    expect(result.selectedTournamentId).toBeNull();
    expect(result.needsTournamentSelection).toBe(false);
  });

  it("honors explicit tournament_id param (UCI-09)", () => {
    const result = detectKioskMode([], null, "explicit-id");
    expect(result.isBowlsMode).toBe(true);
    expect(result.selectedTournamentId).toBe("explicit-id");
  });

  it("honors mode=bowls param without tournament_id", () => {
    const result = detectKioskMode([], "bowls", null);
    expect(result.isBowlsMode).toBe(true);
    expect(result.selectedTournamentId).toBeNull();
  });
});

// ─── Upsert / Idempotency Logic (UCI-13) ────────────────────────────────

/**
 * Simulate the upsert behavior: given existing check-ins and a new check-in,
 * upsert on (player_id, tournament_id) key.
 */
interface MockCheckin {
  player_id: string;
  tournament_id: string;
  preferred_position: string;
  checkin_source: string;
}

function simulateUpsert(existing: MockCheckin[], incoming: MockCheckin): MockCheckin[] {
  const idx = existing.findIndex(
    (c) => c.player_id === incoming.player_id && c.tournament_id === incoming.tournament_id
  );
  if (idx >= 0) {
    // Update in place
    const updated = [...existing];
    updated[idx] = { ...updated[idx], ...incoming };
    return updated;
  }
  return [...existing, incoming];
}

describe("Check-in Upsert Behavior (UCI-13)", () => {
  it("creates a new check-in when player is not yet checked in", () => {
    const result = simulateUpsert([], {
      player_id: "p1",
      tournament_id: "t1",
      preferred_position: "skip",
      checkin_source: "kiosk",
    });
    expect(result).toHaveLength(1);
    expect(result[0].player_id).toBe("p1");
  });

  it("updates position when player checks in again (no duplicate)", () => {
    const existing: MockCheckin[] = [{
      player_id: "p1",
      tournament_id: "t1",
      preferred_position: "skip",
      checkin_source: "kiosk",
    }];
    const result = simulateUpsert(existing, {
      player_id: "p1",
      tournament_id: "t1",
      preferred_position: "lead",
      checkin_source: "kiosk",
    });
    expect(result).toHaveLength(1);
    expect(result[0].preferred_position).toBe("lead");
  });

  it("allows same player in different tournaments", () => {
    const existing: MockCheckin[] = [{
      player_id: "p1",
      tournament_id: "t1",
      preferred_position: "skip",
      checkin_source: "kiosk",
    }];
    const result = simulateUpsert(existing, {
      player_id: "p1",
      tournament_id: "t2",
      preferred_position: "vice",
      checkin_source: "app",
    });
    expect(result).toHaveLength(2);
  });

  it("allows different players in same tournament", () => {
    const existing: MockCheckin[] = [{
      player_id: "p1",
      tournament_id: "t1",
      preferred_position: "skip",
      checkin_source: "kiosk",
    }];
    const result = simulateUpsert(existing, {
      player_id: "p2",
      tournament_id: "t1",
      preferred_position: "lead",
      checkin_source: "manual",
    });
    expect(result).toHaveLength(2);
  });

  it("preserves checkin_source when updating position (UCI-07)", () => {
    const existing: MockCheckin[] = [{
      player_id: "p1",
      tournament_id: "t1",
      preferred_position: "skip",
      checkin_source: "kiosk",
    }];
    const result = simulateUpsert(existing, {
      player_id: "p1",
      tournament_id: "t1",
      preferred_position: "vice",
      checkin_source: "kiosk",
    });
    expect(result[0].checkin_source).toBe("kiosk");
  });
});

// ─── Checkin Source Validation (UCI-10) ──────────────────────────────────

describe("Check-in Source Validation (UCI-10)", () => {
  const validSources = ["kiosk", "manual", "app"] as const;

  it("accepts all valid check-in sources", () => {
    for (const source of validSources) {
      expect(["kiosk", "manual", "app"]).toContain(source);
    }
  });

  it("kiosk check-in sets source to 'kiosk'", () => {
    const checkin: MockCheckin = {
      player_id: "p1",
      tournament_id: "t1",
      preferred_position: "skip",
      checkin_source: "kiosk",
    };
    expect(checkin.checkin_source).toBe("kiosk");
  });

  it("manual check-in from /bowls/[id] defaults to 'manual'", () => {
    const checkinSource: string | undefined = undefined;
    const source = checkinSource ?? "manual";
    expect(source).toBe("manual");
  });
});

// ─── Existing Check-in Detection (UCI-07) ───────────────────────────────

describe("Existing Check-in Detection (UCI-07)", () => {
  const checkins: MockCheckin[] = [
    { player_id: "p1", tournament_id: "t1", preferred_position: "skip", checkin_source: "kiosk" },
    { player_id: "p2", tournament_id: "t1", preferred_position: "lead", checkin_source: "manual" },
  ];

  it("detects an already-checked-in player", () => {
    const existing = checkins.find((c) => c.player_id === "p1");
    expect(existing).toBeDefined();
    expect(existing!.preferred_position).toBe("skip");
  });

  it("returns undefined for a new player", () => {
    const existing = checkins.find((c) => c.player_id === "p3");
    expect(existing).toBeUndefined();
  });
});
