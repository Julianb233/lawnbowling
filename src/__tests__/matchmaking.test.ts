import { describe, it, expect } from "vitest";
import {
  computeMatchScore,
  rankSuggestions,
  calculateElo,
} from "@/lib/matchmaking";
import type {
  ScoringContext,
  PlayerSkillRating,
  RecentMatch,
  MatchMode,
} from "@/lib/matchmaking";
import type { Player } from "@/lib/types";

// Helper to create a test player
function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "player-1",
    display_name: "Test Player",
    avatar_url: null,
    skill_level: "intermediate",
    sports: ["lawn_bowling"],
    is_available: true,
    checked_in_at: new Date().toISOString(),
    venue_id: "venue-1",
    role: "player",
    insurance_status: "none",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeCtx(overrides: Partial<ScoringContext> = {}): ScoringContext {
  return {
    currentPlayer: makePlayer({ id: "me" }),
    currentPlayerSkills: new Map(),
    candidateSkills: new Map(),
    matchHistoryMap: new Map(),
    recentMatches: [],
    favoriteIds: new Set(),
    candidate: makePlayer({ id: "them" }),
    mode: "auto" as MatchMode,
    ...overrides,
  };
}

describe("calculateElo", () => {
  it("should increase winner ELO and decrease loser ELO", () => {
    const [w, l] = calculateElo(1200, 1200);
    expect(w).toBeGreaterThan(1200);
    expect(l).toBeLessThan(1200);
  });

  it("should give bigger gain when underdog wins", () => {
    const [wUnderdog] = calculateElo(1000, 1400);
    const [wFavorite] = calculateElo(1400, 1000);
    expect(wUnderdog - 1000).toBeGreaterThan(wFavorite - 1400);
  });

  it("should not let ELO go below 100", () => {
    const [, loser] = calculateElo(2000, 100);
    expect(loser).toBeGreaterThanOrEqual(100);
  });
});

describe("computeMatchScore", () => {
  it("should return higher score when skill levels are close", () => {
    const close = computeMatchScore(
      makeCtx({
        currentPlayer: makePlayer({ id: "me", skill_level: "intermediate" }),
        candidate: makePlayer({ id: "them", skill_level: "intermediate" }),
      })
    );

    const far = computeMatchScore(
      makeCtx({
        currentPlayer: makePlayer({ id: "me", skill_level: "beginner" }),
        candidate: makePlayer({ id: "them", skill_level: "advanced" }),
      })
    );

    expect(close.score).toBeGreaterThan(far.score);
  });

  it("should boost favorited players", () => {
    const notFav = computeMatchScore(
      makeCtx({ favoriteIds: new Set() })
    );

    const fav = computeMatchScore(
      makeCtx({ favoriteIds: new Set(["them"]) })
    );

    expect(fav.score).toBeGreaterThan(notFav.score);
    expect(fav.reasons).toContain("Favorite player");
  });

  it("should penalize recently played opponents", () => {
    const fresh = computeMatchScore(
      makeCtx({ recentMatches: [] })
    );

    const recent = computeMatchScore(
      makeCtx({
        recentMatches: [
          {
            opponent_id: "them",
            played_at: new Date(Date.now() - 30 * 60000).toISOString(), // 30 min ago
            count: 1,
          },
        ],
      })
    );

    expect(fresh.score).toBeGreaterThan(recent.score);
  });

  it("should score new opponents with 'New opponent' reason", () => {
    const result = computeMatchScore(
      makeCtx({ matchHistoryMap: new Map() })
    );

    expect(result.reasons).toContain("New opponent");
  });

  it("should score lawn bowling players with common sport", () => {
    const result = computeMatchScore(
      makeCtx({
        currentPlayer: makePlayer({ id: "me", sports: ["lawn_bowling"] }),
        candidate: makePlayer({ id: "them", sports: ["lawn_bowling"] }),
      })
    );

    expect(result.score).toBeGreaterThan(0);
  });

  it("should include match quality breakdown", () => {
    const result = computeMatchScore(makeCtx());
    expect(result.matchQuality).toBeDefined();
    expect(result.matchQuality.skillBalance).toBeGreaterThanOrEqual(0);
    expect(result.matchQuality.sportFit).toBeGreaterThanOrEqual(0);
    expect(result.matchQuality.variety).toBeGreaterThanOrEqual(0);
    expect(["great", "good", "fair"]).toContain(result.matchQuality.overall);
  });

  it("should respect competitive mode with tighter skill curve", () => {
    const skills = new Map<string, PlayerSkillRating>();
    skills.set("lawn_bowling", {
      player_id: "me",
      sport: "lawn_bowling",
      elo_rating: 1200,
      games_played: 10,
    });

    const candidateSkills = new Map<string, PlayerSkillRating>();
    candidateSkills.set("lawn_bowling", {
      player_id: "them",
      sport: "lawn_bowling",
      elo_rating: 1400,
      games_played: 10,
    });

    const competitive = computeMatchScore(
      makeCtx({
        currentPlayerSkills: skills,
        candidateSkills: candidateSkills,
        mode: "competitive",
      })
    );

    const learning = computeMatchScore(
      makeCtx({
        currentPlayerSkills: skills,
        candidateSkills: candidateSkills,
        mode: "learning",
      })
    );

    // In competitive mode, the 200 ELO gap is penalized more than in learning mode
    expect(learning.score).toBeGreaterThan(competitive.score);
  });

  it("should boost players waiting longer", () => {
    const justCheckedIn = computeMatchScore(
      makeCtx({
        candidate: makePlayer({
          id: "them",
          checked_in_at: new Date().toISOString(),
        }),
      })
    );

    const waitingLong = computeMatchScore(
      makeCtx({
        candidate: makePlayer({
          id: "them",
          checked_in_at: new Date(Date.now() - 20 * 60000).toISOString(), // 20 min ago
        }),
      })
    );

    expect(waitingLong.score).toBeGreaterThan(justCheckedIn.score);
  });

  it("should value rating confidence (more games played)", () => {
    const noGames = computeMatchScore(
      makeCtx({
        currentPlayerSkills: new Map(),
        candidateSkills: new Map(),
      })
    );

    const manyGames = computeMatchScore(
      makeCtx({
        currentPlayerSkills: new Map([
          [
            "lawn_bowling",
            { player_id: "me", sport: "lawn_bowling", elo_rating: 1200, games_played: 20 },
          ],
        ]),
        candidateSkills: new Map([
          [
            "lawn_bowling",
            { player_id: "them", sport: "lawn_bowling", elo_rating: 1200, games_played: 20 },
          ],
        ]),
      })
    );

    expect(manyGames.score).toBeGreaterThan(noGames.score);
    expect(manyGames.reasons).toContain("Reliable rating");
  });
});

describe("rankSuggestions", () => {
  const me = makePlayer({ id: "me", sports: ["lawn_bowling"] });

  const candidates = [
    makePlayer({
      id: "close-skill",
      display_name: "Close Skill",
      skill_level: "intermediate",
      sports: ["lawn_bowling"],
    }),
    makePlayer({
      id: "far-skill",
      display_name: "Far Skill",
      skill_level: "advanced",
      sports: ["lawn_bowling"],
    }),
    makePlayer({
      id: "same-level",
      display_name: "Same Level",
      skill_level: "intermediate",
      sports: ["lawn_bowling"],
    }),
  ];

  it("should rank close skill higher than far skill (auto mode)", () => {
    const results = rankSuggestions(
      me,
      candidates,
      new Map(),
      new Map(),
      new Map(),
      10
    );

    const closeIdx = results.findIndex((r) => r.player.id === "close-skill");
    const farIdx = results.findIndex((r) => r.player.id === "far-skill");

    expect(closeIdx).toBeLessThan(farIdx);
  });

  it("should respect limit parameter", () => {
    const results = rankSuggestions(
      me,
      candidates,
      new Map(),
      new Map(),
      new Map(),
      2
    );

    expect(results).toHaveLength(2);
  });

  it("should exclude current player from results", () => {
    const withMe = [...candidates, me];
    const results = rankSuggestions(
      me,
      withMe,
      new Map(),
      new Map(),
      new Map(),
      10
    );

    const ids = results.map((r) => r.player.id);
    expect(ids).not.toContain("me");
  });

  it("should boost favorites in rankings", () => {
    const results = rankSuggestions(
      me,
      candidates,
      new Map(),
      new Map(),
      new Map(),
      10,
      { favoriteIds: new Set(["far-skill"]) }
    );

    // far-skill is favorited, so it should get a boost
    const farSkill = results.find((r) => r.player.id === "far-skill");
    expect(farSkill).toBeDefined();
    expect(farSkill!.reasons).toContain("Favorite player");
  });

  it("should filter by sport when sportFilter is set", () => {
    const results = rankSuggestions(
      me,
      candidates,
      new Map(),
      new Map(),
      new Map(),
      10,
      { sportFilter: "lawn_bowling" }
    );

    // All candidates play lawn_bowling
    expect(results.length).toBeGreaterThan(0);
  });

  it("should include matchQuality in each suggestion", () => {
    const results = rankSuggestions(
      me,
      candidates,
      new Map(),
      new Map(),
      new Map(),
      10
    );

    for (const r of results) {
      expect(r.matchQuality).toBeDefined();
      expect(r.matchQuality.overall).toBeDefined();
    }
  });

  it("should provide eloDiff for each suggestion", () => {
    const results = rankSuggestions(
      me,
      candidates,
      new Map(),
      new Map(),
      new Map(),
      10
    );

    for (const r of results) {
      expect(r.eloDiff).not.toBeNull();
    }
  });
});
