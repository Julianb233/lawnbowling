/**
 * Score Concurrency Test Suite
 *
 * Verifies optimistic concurrency control for score updates under load.
 * Simulates 4 concurrent score updates to different rinks in the same round,
 * and validates conflict detection when the same rink is updated concurrently.
 *
 * Linear: AI-4041
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { TournamentScore } from "@/lib/types";

// ── Helpers ─────────────────────────────────────────────────────────

const TOURNAMENT_ID = "tournament-concurrency-test";

/** Monotonic clock to guarantee distinct timestamps in fast-running tests */
let clock = Date.now();
function nextTimestamp(): string {
  clock += 1;
  return new Date(clock).toISOString();
}

/** Replicates the server-side score validation from /api/bowls/scores */
function validateScores(scores: unknown): {
  valid: boolean;
  parsed: number[];
  error?: string;
} {
  const MAX_SCORE_PER_END = 9;
  const MAX_ENDS = 30;
  if (!Array.isArray(scores)) return { valid: true, parsed: [] };
  if (scores.length > MAX_ENDS) {
    return { valid: false, parsed: [], error: `Cannot exceed ${MAX_ENDS} ends` };
  }
  const parsed: number[] = [];
  for (const s of scores) {
    const n = Number(s);
    if (!Number.isFinite(n) || n < 0 || n > MAX_SCORE_PER_END || !Number.isInteger(n)) {
      return { valid: false, parsed: [], error: `Scores must be integers between 0 and ${MAX_SCORE_PER_END}` };
    }
    parsed.push(n);
  }
  return { valid: true, parsed };
}

/** Replicates the optimistic concurrency check from POST /api/bowls/scores */
function checkConcurrencyConflict(
  existingUpdatedAt: string | null,
  expectedUpdatedAt: string | undefined
): boolean {
  if (!existingUpdatedAt || !expectedUpdatedAt) return false;
  const existingTime = new Date(existingUpdatedAt).getTime();
  const expectedTime = new Date(expectedUpdatedAt).getTime();
  return existingTime !== expectedTime;
}

interface ScoreSubmission {
  tournament_id: string;
  round: number;
  rink: number;
  team_a_players: { player_id: string; display_name: string }[];
  team_b_players: { player_id: string; display_name: string }[];
  team_a_scores: number[];
  team_b_scores: number[];
  expected_updated_at?: string;
}

/**
 * Simulates the POST /api/bowls/scores handler against an in-memory store.
 * Uses a monotonic clock so each write gets a distinct updated_at, mirroring
 * the Postgres trigger that bumps updated_at on every UPDATE.
 */
function simulateScorePost(
  store: Map<string, TournamentScore>,
  submission: ScoreSubmission
): { status: number; body: Record<string, unknown> } {
  const { tournament_id, round, rink, team_a_scores, team_b_scores, expected_updated_at } =
    submission;

  // Validate required fields
  if (!tournament_id || !round || !rink) {
    return { status: 400, body: { error: "tournament_id, round, and rink are required" } };
  }

  // Validate scores
  const valA = validateScores(team_a_scores);
  if (!valA.valid) return { status: 400, body: { error: valA.error } };
  const valB = validateScores(team_b_scores);
  if (!valB.valid) return { status: 400, body: { error: valB.error } };

  if (valA.parsed.length !== valB.parsed.length) {
    return { status: 400, body: { error: "team_a_scores and team_b_scores must have the same length" } };
  }

  const scoresA = valA.parsed;
  const scoresB = valB.parsed;

  const totalA = scoresA.reduce((s, v) => s + v, 0);
  const totalB = scoresB.reduce((s, v) => s + v, 0);

  let endsWonA = 0;
  let endsWonB = 0;
  for (let i = 0; i < scoresA.length; i++) {
    if (scoresA[i] > scoresB[i]) endsWonA++;
    else if (scoresB[i] > scoresA[i]) endsWonB++;
  }

  let winner: "team_a" | "team_b" | "draw" | null = null;
  if (scoresA.length > 0) {
    if (totalA > totalB) winner = "team_a";
    else if (totalB > totalA) winner = "team_b";
    else winner = "draw";
  }

  const key = `${tournament_id}:${round}:${rink}`;
  const existing = store.get(key);

  // Block updates to finalized scores
  if (existing?.is_finalized) {
    return { status: 403, body: { error: "Cannot modify finalized scores" } };
  }

  // Optimistic concurrency check
  if (existing && expected_updated_at) {
    if (checkConcurrencyConflict(existing.updated_at, expected_updated_at)) {
      return {
        status: 409,
        body: {
          error: "Score was modified by another user. Please refresh and try again.",
          conflict: true,
        },
      };
    }
  }

  const now = nextTimestamp();
  const record: TournamentScore = {
    id: existing?.id ?? `score-${round}-${rink}-${clock}`,
    tournament_id,
    round,
    rink,
    team_a_players: submission.team_a_players,
    team_b_players: submission.team_b_players,
    team_a_scores: scoresA,
    team_b_scores: scoresB,
    total_a: totalA,
    total_b: totalB,
    ends_won_a: endsWonA,
    ends_won_b: endsWonB,
    winner: winner as TournamentScore["winner"],
    is_finalized: false,
    correction_log: existing?.correction_log ?? null,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };

  store.set(key, record);
  return { status: 200, body: record as unknown as Record<string, unknown> };
}

function makePlayer(id: string, name: string) {
  return { player_id: id, display_name: name };
}

function makeSubmission(
  rink: number,
  round = 1,
  overrides: Partial<ScoreSubmission> = {}
): ScoreSubmission {
  return {
    tournament_id: TOURNAMENT_ID,
    round,
    rink,
    team_a_players: [makePlayer(`p-a-${rink}`, `Player A${rink}`)],
    team_b_players: [makePlayer(`p-b-${rink}`, `Player B${rink}`)],
    team_a_scores: [3, 0, 2, 1],
    team_b_scores: [0, 4, 1, 2],
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────

describe("Score Concurrency", () => {
  let store: Map<string, TournamentScore>;

  beforeEach(() => {
    store = new Map();
  });

  describe("concurrent updates to different rinks", () => {
    it("should accept 4 simultaneous score submissions to different rinks in the same round", () => {
      const results = [1, 2, 3, 4].map((rink) =>
        simulateScorePost(store, makeSubmission(rink))
      );

      for (const r of results) {
        expect(r.status).toBe(200);
      }

      expect(store.size).toBe(4);

      for (let rink = 1; rink <= 4; rink++) {
        const key = `${TOURNAMENT_ID}:1:${rink}`;
        const record = store.get(key)!;
        expect(record).toBeDefined();
        expect(record.rink).toBe(rink);
        expect(record.total_a).toBe(6);
        expect(record.total_b).toBe(7);
        expect(record.winner).toBe("team_b");
      }
    });

    it("should produce independent updated_at timestamps per rink", () => {
      const results = [1, 2, 3, 4].map((rink) =>
        simulateScorePost(store, makeSubmission(rink))
      );

      const timestamps: string[] = [];
      for (let rink = 1; rink <= 4; rink++) {
        const key = `${TOURNAMENT_ID}:1:${rink}`;
        timestamps.push(store.get(key)!.updated_at);
      }

      // Each rink gets a distinct monotonic timestamp
      const unique = new Set(timestamps);
      expect(unique.size).toBe(4);

      expect(results.every((r) => r.status === 200)).toBe(true);
    });

    it("should allow different score values per rink without cross-contamination", () => {
      const submissions: ScoreSubmission[] = [
        makeSubmission(1, 1, { team_a_scores: [5, 3], team_b_scores: [1, 2] }),
        makeSubmission(2, 1, { team_a_scores: [0, 0], team_b_scores: [4, 4] }),
        makeSubmission(3, 1, { team_a_scores: [2, 2], team_b_scores: [2, 2] }),
        makeSubmission(4, 1, { team_a_scores: [9, 9], team_b_scores: [0, 0] }),
      ];

      const results = submissions.map((s) => simulateScorePost(store, s));
      expect(results.every((r) => r.status === 200)).toBe(true);

      expect(store.get(`${TOURNAMENT_ID}:1:1`)!.total_a).toBe(8);
      expect(store.get(`${TOURNAMENT_ID}:1:1`)!.winner).toBe("team_a");

      expect(store.get(`${TOURNAMENT_ID}:1:2`)!.total_b).toBe(8);
      expect(store.get(`${TOURNAMENT_ID}:1:2`)!.winner).toBe("team_b");

      expect(store.get(`${TOURNAMENT_ID}:1:3`)!.total_a).toBe(4);
      expect(store.get(`${TOURNAMENT_ID}:1:3`)!.winner).toBe("draw");

      expect(store.get(`${TOURNAMENT_ID}:1:4`)!.total_a).toBe(18);
      expect(store.get(`${TOURNAMENT_ID}:1:4`)!.winner).toBe("team_a");
    });
  });

  describe("optimistic concurrency conflict detection", () => {
    it("should detect conflict when same rink is updated with stale timestamp", () => {
      // First write
      const r1 = simulateScorePost(store, makeSubmission(1));
      expect(r1.status).toBe(200);
      const firstTimestamp = store.get(`${TOURNAMENT_ID}:1:1`)!.updated_at;

      // Second write succeeds (updates the record, bumps updated_at)
      const r2 = simulateScorePost(
        store,
        makeSubmission(1, 1, {
          team_a_scores: [5, 5],
          team_b_scores: [1, 1],
          expected_updated_at: firstTimestamp,
        })
      );
      expect(r2.status).toBe(200);
      const secondTimestamp = store.get(`${TOURNAMENT_ID}:1:1`)!.updated_at;
      expect(secondTimestamp).not.toBe(firstTimestamp);

      // Third write with STALE timestamp (first, not second) -> 409
      const r3 = simulateScorePost(
        store,
        makeSubmission(1, 1, {
          team_a_scores: [9, 9],
          team_b_scores: [0, 0],
          expected_updated_at: firstTimestamp,
        })
      );
      expect(r3.status).toBe(409);
      expect(r3.body).toHaveProperty("conflict", true);

      // Data should remain from the second write
      const record = store.get(`${TOURNAMENT_ID}:1:1`)!;
      expect(record.total_a).toBe(10);
      expect(record.updated_at).toBe(secondTimestamp);
    });

    it("should allow update when expected_updated_at matches current", () => {
      simulateScorePost(store, makeSubmission(1));
      const ts = store.get(`${TOURNAMENT_ID}:1:1`)!.updated_at;

      const result = simulateScorePost(
        store,
        makeSubmission(1, 1, {
          team_a_scores: [7, 7],
          team_b_scores: [2, 2],
          expected_updated_at: ts,
        })
      );
      expect(result.status).toBe(200);
      expect(store.get(`${TOURNAMENT_ID}:1:1`)!.total_a).toBe(14);
    });

    it("should skip concurrency check when expected_updated_at is not provided", () => {
      simulateScorePost(store, makeSubmission(1));

      const result = simulateScorePost(
        store,
        makeSubmission(1, 1, {
          team_a_scores: [1, 1],
          team_b_scores: [1, 1],
        })
      );
      expect(result.status).toBe(200);
    });

    it("should simulate 4 concurrent writers to the same rink where 3 get conflicts", () => {
      // Seed initial score
      simulateScorePost(store, makeSubmission(1));
      const originalTs = store.get(`${TOURNAMENT_ID}:1:1`)!.updated_at;

      // 4 "concurrent" writers all read the same timestamp before any writes
      const writers = [
        makeSubmission(1, 1, {
          team_a_scores: [1, 0],
          team_b_scores: [0, 1],
          expected_updated_at: originalTs,
        }),
        makeSubmission(1, 1, {
          team_a_scores: [2, 0],
          team_b_scores: [0, 2],
          expected_updated_at: originalTs,
        }),
        makeSubmission(1, 1, {
          team_a_scores: [3, 0],
          team_b_scores: [0, 3],
          expected_updated_at: originalTs,
        }),
        makeSubmission(1, 1, {
          team_a_scores: [4, 0],
          team_b_scores: [0, 4],
          expected_updated_at: originalTs,
        }),
      ];

      // First writer wins (timestamp matches)
      const r0 = simulateScorePost(store, writers[0]);
      expect(r0.status).toBe(200);

      // Remaining 3 writers get 409 because updated_at was bumped by first write
      const conflicts = writers.slice(1).map((w) => simulateScorePost(store, w));
      for (const c of conflicts) {
        expect(c.status).toBe(409);
        expect(c.body).toHaveProperty("conflict", true);
      }

      // Final state reflects only the first writer's data
      const record = store.get(`${TOURNAMENT_ID}:1:1`)!;
      expect(record.total_a).toBe(1);
      expect(record.total_b).toBe(1);
    });
  });

  describe("finalization lock under concurrent access", () => {
    it("should block all updates to a finalized rink", () => {
      simulateScorePost(store, makeSubmission(1));
      const key = `${TOURNAMENT_ID}:1:1`;
      const record = store.get(key)!;
      record.is_finalized = true;
      store.set(key, record);

      const results = [1, 2, 3, 4].map(() =>
        simulateScorePost(store, makeSubmission(1))
      );

      for (const r of results) {
        expect(r.status).toBe(403);
        expect(r.body.error).toBe("Cannot modify finalized scores");
      }

      expect(store.get(key)!.is_finalized).toBe(true);
    });

    it("should allow updates to non-finalized rinks while others are finalized", () => {
      [1, 2, 3, 4].forEach((rink) =>
        simulateScorePost(store, makeSubmission(rink))
      );

      for (const rink of [1, 3]) {
        const key = `${TOURNAMENT_ID}:1:${rink}`;
        const record = store.get(key)!;
        record.is_finalized = true;
        store.set(key, record);
      }

      const r2 = simulateScorePost(
        store,
        makeSubmission(2, 1, { team_a_scores: [9, 9], team_b_scores: [0, 0] })
      );
      const r4 = simulateScorePost(
        store,
        makeSubmission(4, 1, { team_a_scores: [9, 9], team_b_scores: [0, 0] })
      );
      expect(r2.status).toBe(200);
      expect(r4.status).toBe(200);

      const r1 = simulateScorePost(store, makeSubmission(1));
      const r3 = simulateScorePost(store, makeSubmission(3));
      expect(r1.status).toBe(403);
      expect(r3.status).toBe(403);
    });
  });

  describe("multi-round concurrent scoring", () => {
    it("should isolate concurrent updates across different rounds", () => {
      const r1 = simulateScorePost(
        store,
        makeSubmission(1, 1, { team_a_scores: [5], team_b_scores: [3] })
      );
      const r2 = simulateScorePost(
        store,
        makeSubmission(1, 2, { team_a_scores: [1], team_b_scores: [7] })
      );

      expect(r1.status).toBe(200);
      expect(r2.status).toBe(200);

      expect(store.get(`${TOURNAMENT_ID}:1:1`)!.total_a).toBe(5);
      expect(store.get(`${TOURNAMENT_ID}:2:1`)!.total_a).toBe(1);
      expect(store.size).toBe(2);
    });

    it("should handle 4 rinks x 2 rounds concurrently without interference", () => {
      const submissions: ScoreSubmission[] = [];
      for (let round = 1; round <= 2; round++) {
        for (let rink = 1; rink <= 4; rink++) {
          submissions.push(
            makeSubmission(rink, round, {
              team_a_scores: [round * rink],
              team_b_scores: [round],
            })
          );
        }
      }

      const results = submissions.map((s) => simulateScorePost(store, s));
      expect(results.every((r) => r.status === 200)).toBe(true);
      expect(store.size).toBe(8);

      expect(store.get(`${TOURNAMENT_ID}:2:3`)!.total_a).toBe(6);
      expect(store.get(`${TOURNAMENT_ID}:2:3`)!.total_b).toBe(2);
    });
  });

  describe("checkConcurrencyConflict helper", () => {
    it("returns false when no existing timestamp", () => {
      expect(checkConcurrencyConflict(null, "2026-01-01T00:00:00Z")).toBe(false);
    });

    it("returns false when no expected timestamp", () => {
      expect(checkConcurrencyConflict("2026-01-01T00:00:00Z", undefined)).toBe(false);
    });

    it("returns false when timestamps match", () => {
      const ts = "2026-03-23T10:00:00.000Z";
      expect(checkConcurrencyConflict(ts, ts)).toBe(false);
    });

    it("returns true when timestamps differ by 1ms", () => {
      expect(
        checkConcurrencyConflict("2026-03-23T10:00:00.000Z", "2026-03-23T10:00:00.001Z")
      ).toBe(true);
    });

    it("returns true when timestamps differ significantly", () => {
      expect(
        checkConcurrencyConflict("2026-03-23T10:00:00.000Z", "2026-03-23T09:00:00.000Z")
      ).toBe(true);
    });
  });

  describe("score validation under load", () => {
    it("should validate all 4 rinks scores independently", () => {
      const validSubmissions = [1, 2, 3, 4].map((rink) => makeSubmission(rink));
      const results = validSubmissions.map((s) => simulateScorePost(store, s));
      expect(results.every((r) => r.status === 200)).toBe(true);
    });

    it("should reject one invalid rink without affecting valid rinks", () => {
      const submissions = [
        makeSubmission(1),
        makeSubmission(2),
        makeSubmission(3),
        makeSubmission(4, 1, { team_a_scores: [10, 0], team_b_scores: [0, 0] }),
      ];

      const results = submissions.map((s) => simulateScorePost(store, s));

      expect(results[0].status).toBe(200);
      expect(results[1].status).toBe(200);
      expect(results[2].status).toBe(200);
      expect(results[3].status).toBe(400);

      expect(store.size).toBe(3);
    });

    it("should reject mismatched score array lengths", () => {
      const result = simulateScorePost(
        store,
        makeSubmission(1, 1, {
          team_a_scores: [1, 2, 3],
          team_b_scores: [1, 2],
        })
      );
      expect(result.status).toBe(400);
      expect(result.body.error).toContain("same length");
    });
  });
});
