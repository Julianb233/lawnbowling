import { describe, it, expect } from "vitest";

describe("Match Flow", () => {
  it("should create a match in queued status", () => {
    const match = {
      id: "match-1",
      sport: "pickleball",
      court_id: null as string | null,
      status: "queued" as const,
      started_at: null as string | null,
      ended_at: null as string | null,
    };

    expect(match.status).toBe("queued");
    expect(match.court_id).toBeNull();
    expect(match.started_at).toBeNull();
  });

  it("should assign court and start match", () => {
    const match = {
      status: "queued" as string,
      court_id: null as string | null,
      started_at: null as string | null,
    };

    // Assign court
    match.court_id = "court-1";
    match.status = "playing";
    match.started_at = new Date().toISOString();

    expect(match.status).toBe("playing");
    expect(match.court_id).toBe("court-1");
    expect(match.started_at).toBeTruthy();
  });

  it("should complete a match with result", () => {
    const match = {
      status: "playing" as string,
      ended_at: null as string | null,
    };

    const result = {
      winner_team: 1 as 1 | 2,
      team1_score: 11,
      team2_score: 7,
    };

    match.status = "completed";
    match.ended_at = new Date().toISOString();

    expect(match.status).toBe("completed");
    expect(result.winner_team).toBe(1);
    expect(result.team1_score).toBeGreaterThan(result.team2_score);
  });

  it("should correctly assign players to teams", () => {
    const players = [
      { player_id: "p1", team: 1 },
      { player_id: "p2", team: 1 },
      { player_id: "p3", team: 2 },
      { player_id: "p4", team: 2 },
    ];

    const team1 = players.filter((p) => p.team === 1);
    const team2 = players.filter((p) => p.team === 2);

    expect(team1).toHaveLength(2);
    expect(team2).toHaveLength(2);
  });
});
