import { describe, it, expect } from "vitest";
import {
  isTournamentActiveToday,
  filterActiveTournaments,
  determineKioskMode,
  autoSelectTournament,
  findExistingCheckin,
  buildCheckinPayload,
  validateCheckinRequest,
  isValidCheckinSource,
} from "@/lib/checkin-utils";
import type { Tournament, BowlsCheckin } from "@/lib/types";

// ===== Helpers =====

function makeTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: "t-1",
    venue_id: "v-1",
    name: "Wednesday Social",
    sport: "lawn_bowling",
    format: "round_robin",
    status: "registration",
    max_players: 32,
    created_by: "p-1",
    starts_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeCheckin(overrides: Partial<BowlsCheckin> = {}): BowlsCheckin {
  return {
    id: "c-1",
    player_id: "p-1",
    tournament_id: "t-1",
    preferred_position: "skip",
    checkin_source: "manual",
    checked_in_at: new Date().toISOString(),
    ...overrides,
  };
}

// ===== UCI-01: Auto-detection logic =====

describe("UCI-01: Tournament auto-detection", () => {
  const today = new Date(2026, 2, 11, 10, 0, 0); // March 11, 2026 10:00 AM

  it("detects a tournament starting today with registration status", () => {
    const tournament = makeTournament({
      status: "registration",
      starts_at: new Date(2026, 2, 11, 9, 0, 0).toISOString(),
    });
    expect(isTournamentActiveToday(tournament, today)).toBe(true);
  });

  it("detects a tournament starting today with in_progress status", () => {
    const tournament = makeTournament({
      status: "in_progress",
      starts_at: new Date(2026, 2, 11, 14, 0, 0).toISOString(),
    });
    expect(isTournamentActiveToday(tournament, today)).toBe(true);
  });

  it("rejects a completed tournament", () => {
    const tournament = makeTournament({
      status: "completed",
      starts_at: new Date(2026, 2, 11, 9, 0, 0).toISOString(),
    });
    expect(isTournamentActiveToday(tournament, today)).toBe(false);
  });

  it("rejects a cancelled tournament", () => {
    const tournament = makeTournament({
      status: "cancelled",
      starts_at: new Date(2026, 2, 11, 9, 0, 0).toISOString(),
    });
    expect(isTournamentActiveToday(tournament, today)).toBe(false);
  });

  it("rejects a tournament from yesterday", () => {
    const tournament = makeTournament({
      status: "registration",
      starts_at: new Date(2026, 2, 10, 9, 0, 0).toISOString(),
    });
    expect(isTournamentActiveToday(tournament, today)).toBe(false);
  });

  it("rejects a tournament from tomorrow", () => {
    const tournament = makeTournament({
      status: "registration",
      starts_at: new Date(2026, 2, 12, 9, 0, 0).toISOString(),
    });
    expect(isTournamentActiveToday(tournament, today)).toBe(false);
  });

  it("rejects a tournament with null starts_at", () => {
    const tournament = makeTournament({
      status: "registration",
      starts_at: null,
    });
    expect(isTournamentActiveToday(tournament, today)).toBe(false);
  });

  it("filters active tournaments from a mixed list", () => {
    const tournaments = [
      makeTournament({
        id: "t-active",
        status: "registration",
        starts_at: new Date(2026, 2, 11, 9, 0, 0).toISOString(),
      }),
      makeTournament({
        id: "t-completed",
        status: "completed",
        starts_at: new Date(2026, 2, 11, 8, 0, 0).toISOString(),
      }),
      makeTournament({
        id: "t-tomorrow",
        status: "registration",
        starts_at: new Date(2026, 2, 12, 9, 0, 0).toISOString(),
      }),
    ];

    const active = filterActiveTournaments(tournaments, today);
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe("t-active");
  });
});

// ===== UCI-05: Auto-select single tournament =====

describe("UCI-05: Tournament auto-selection", () => {
  it("auto-selects when exactly one tournament is active", () => {
    const tournaments = [makeTournament({ id: "t-only" })];
    expect(autoSelectTournament(tournaments)).toBe("t-only");
  });

  it("returns null when multiple tournaments are active", () => {
    const tournaments = [
      makeTournament({ id: "t-1" }),
      makeTournament({ id: "t-2" }),
    ];
    expect(autoSelectTournament(tournaments)).toBeNull();
  });

  it("returns null when no tournaments are active", () => {
    expect(autoSelectTournament([])).toBeNull();
  });
});

// ===== UCI-07: Duplicate check-in detection =====

describe("UCI-07: Duplicate check-in detection", () => {
  it("finds an existing check-in for a player", () => {
    const checkins = [
      makeCheckin({ player_id: "p-1", preferred_position: "skip" }),
      makeCheckin({ id: "c-2", player_id: "p-2", preferred_position: "lead" }),
    ];

    const result = findExistingCheckin(checkins, "p-1");
    expect(result).not.toBeNull();
    expect(result!.preferred_position).toBe("skip");
  });

  it("returns null when player is not checked in", () => {
    const checkins = [
      makeCheckin({ player_id: "p-1" }),
    ];

    const result = findExistingCheckin(checkins, "p-999");
    expect(result).toBeNull();
  });

  it("returns null for empty checkins list", () => {
    expect(findExistingCheckin([], "p-1")).toBeNull();
  });
});

// ===== UCI-09/UCI-12: Kiosk mode determination =====

describe("UCI-09/UCI-12: Kiosk mode determination", () => {
  it("returns bowls mode when mode param is bowls", () => {
    expect(
      determineKioskMode({
        modeParam: "bowls",
        tournamentIdParam: null,
        activeTournaments: [],
      })
    ).toBe("bowls");
  });

  it("returns bowls mode when tournament_id param is set", () => {
    expect(
      determineKioskMode({
        modeParam: null,
        tournamentIdParam: "t-123",
        activeTournaments: [],
      })
    ).toBe("bowls");
  });

  it("returns bowls mode when active tournaments detected", () => {
    expect(
      determineKioskMode({
        modeParam: null,
        tournamentIdParam: null,
        activeTournaments: [makeTournament()],
      })
    ).toBe("bowls");
  });

  it("returns generic mode when no bowls indicators present (UCI-12 fallback)", () => {
    expect(
      determineKioskMode({
        modeParam: null,
        tournamentIdParam: null,
        activeTournaments: [],
      })
    ).toBe("generic");
  });

  it("returns generic mode when mode param is something else", () => {
    expect(
      determineKioskMode({
        modeParam: "unknown_sport",
        tournamentIdParam: null,
        activeTournaments: [],
      })
    ).toBe("generic");
  });
});

// ===== UCI-03/UCI-13: Check-in payload construction =====

describe("UCI-03/UCI-13: Check-in payload", () => {
  it("builds a kiosk check-in payload with specific position", () => {
    const payload = buildCheckinPayload({
      playerId: "p-1",
      tournamentId: "t-1",
      position: "skip",
      source: "kiosk",
    });

    expect(payload).toEqual({
      player_id: "p-1",
      tournament_id: "t-1",
      preferred_position: "skip",
      checkin_source: "kiosk",
    });
  });

  it("maps 'any' position to 'lead' default", () => {
    const payload = buildCheckinPayload({
      playerId: "p-1",
      tournamentId: "t-1",
      position: "any",
      source: "kiosk",
    });

    expect(payload.preferred_position).toBe("lead");
  });

  it("preserves manual source", () => {
    const payload = buildCheckinPayload({
      playerId: "p-1",
      tournamentId: "t-1",
      position: "vice",
      source: "manual",
    });

    expect(payload.checkin_source).toBe("manual");
  });

  it("preserves app source", () => {
    const payload = buildCheckinPayload({
      playerId: "p-1",
      tournamentId: "t-1",
      position: "lead",
      source: "app",
    });

    expect(payload.checkin_source).toBe("app");
  });
});

// ===== Validation =====

describe("Check-in request validation", () => {
  it("passes for valid request", () => {
    expect(
      validateCheckinRequest({
        player_id: "p-1",
        tournament_id: "t-1",
        preferred_position: "skip",
      })
    ).toBeNull();
  });

  it("rejects missing player_id", () => {
    expect(
      validateCheckinRequest({
        tournament_id: "t-1",
        preferred_position: "skip",
      })
    ).toBe("player_id required");
  });

  it("rejects missing tournament_id", () => {
    expect(
      validateCheckinRequest({
        player_id: "p-1",
        preferred_position: "skip",
      })
    ).toBe("tournament_id required");
  });

  it("rejects missing preferred_position", () => {
    expect(
      validateCheckinRequest({
        player_id: "p-1",
        tournament_id: "t-1",
      })
    ).toBe("preferred_position required");
  });

  it("rejects invalid position value", () => {
    const result = validateCheckinRequest({
      player_id: "p-1",
      tournament_id: "t-1",
      preferred_position: "goalkeeper",
    });
    expect(result).toContain("Invalid position");
  });

  it("accepts all valid positions", () => {
    const positions = ["skip", "vice", "second", "lead"];
    positions.forEach((pos) => {
      expect(
        validateCheckinRequest({
          player_id: "p-1",
          tournament_id: "t-1",
          preferred_position: pos,
        })
      ).toBeNull();
    });
  });
});

describe("Check-in source validation", () => {
  it("validates kiosk as a valid source", () => {
    expect(isValidCheckinSource("kiosk")).toBe(true);
  });

  it("validates manual as a valid source", () => {
    expect(isValidCheckinSource("manual")).toBe(true);
  });

  it("validates app as a valid source", () => {
    expect(isValidCheckinSource("app")).toBe(true);
  });

  it("rejects invalid sources", () => {
    expect(isValidCheckinSource("website")).toBe(false);
    expect(isValidCheckinSource("")).toBe(false);
    expect(isValidCheckinSource("API")).toBe(false);
  });
});
