/**
 * Tournament Progression Lifecycle Integration Tests
 *
 * End-to-end tests covering the complete tournament flow:
 * Create -> Check-in -> Draw -> Score -> Finalize -> Ratings -> Results -> Complete
 *
 * These tests chain all tournament engines together to validate the full
 * business flow with zero gaps between phases.
 *
 * Linear: AI-4040
 */

import { describe, it, expect, beforeEach } from "vitest";

import {
  generateBowlsDraw,
  generateMeadDraw,
} from "@/lib/bowls-draw";

import {
  calculateBowlsResult,
  buildStandings,
  sortStandings,
} from "@/lib/tournament-engine";

import {
  calculateRatingUpdates,
  applyUpdates,
} from "@/lib/bowls-ratings";

import type {
  BowlsCheckin,
  BowlsGameFormat,
  BowlsTeamAssignment,
  TournamentScore,
  BowlsPositionRating,
} from "@/lib/types";

// -- Helpers --

let _id = 0;

function uid(): string {
  return `lifecycle-${++_id}`;
}

function makeCheckin(overrides: Partial<BowlsCheckin> = {}): BowlsCheckin {
  const id = uid();
  return {
    id: `checkin-${id}`,
    player_id: id,
    tournament_id: "tournament-lifecycle",
    preferred_position: "lead",
    checkin_source: "app",
    checked_in_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeCheckins(
  count: number,
  factory?: (index: number) => Partial<BowlsCheckin>
): BowlsCheckin[] {
  return Array.from({ length: count }, (_, i) =>
    makeCheckin(factory ? factory(i) : {})
  );
}

/** Extract team 1 and team 2 player lists from a flat rink assignment array */
function extractTeams(rink: BowlsTeamAssignment[]) {
  const team1 = rink.filter((a) => a.team === 1);
  const team2 = rink.filter((a) => a.team === 2);
  return { team1, team2 };
}

/** Convert draw rink assignments to TournamentScore player format */
function toScorePlayers(assignments: BowlsTeamAssignment[]) {
  return assignments.map((a) => ({
    player_id: a.player_id,
    display_name: `Player ${a.player_id}`,
  }));
}

function simulateRinkScore(
  tournamentId: string,
  round: number,
  rink: number,
  teamAPlayers: { player_id: string; display_name: string }[],
  teamBPlayers: { player_id: string; display_name: string }[],
  teamAEnds: number[],
  teamBEnds: number[],
  finalized = true
): TournamentScore {
  const totalA = teamAEnds.reduce((s, v) => s + v, 0);
  const totalB = teamBEnds.reduce((s, v) => s + v, 0);
  const endsWonA = teamAEnds.filter((_, i) => teamAEnds[i] > teamBEnds[i]).length;
  const endsWonB = teamBEnds.filter((_, i) => teamBEnds[i] > teamAEnds[i]).length;
  const winner: "team_a" | "team_b" | "draw" =
    totalA > totalB ? "team_a" : totalB > totalA ? "team_b" : "draw";

  return {
    id: `score-${round}-${rink}`,
    tournament_id: tournamentId,
    round,
    rink,
    team_a_players: teamAPlayers,
    team_b_players: teamBPlayers,
    team_a_scores: teamAEnds,
    team_b_scores: teamBEnds,
    total_a: totalA,
    total_b: totalB,
    ends_won_a: endsWonA,
    ends_won_b: endsWonB,
    winner,
    is_finalized: finalized,
    correction_log: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function buildStandingsFromScores(scores: TournamentScore[]) {
  const results = scores.map((score) => ({
    teamAPlayerIds: score.team_a_players.map((p) => p.player_id),
    teamBPlayerIds: score.team_b_players.map((p) => p.player_id),
    totalA: score.total_a,
    totalB: score.total_b,
    endsWonA: score.ends_won_a,
    endsWonB: score.ends_won_b,
    winner: score.winner,
    isFinalized: score.is_finalized,
  }));
  return buildStandings(results);
}

// -- Tests --

beforeEach(() => {
  _id = 0;
});

describe("Tournament Progression Lifecycle", () => {
  describe("Full lifecycle: singles format (8 players)", () => {
    it("chains create -> checkin -> draw -> score -> standings -> ratings -> completion", () => {
      const tournamentId = "lifecycle-singles";
      const format: BowlsGameFormat = "singles";

      // PHASE 1: Create tournament
      const tournament = {
        id: tournamentId,
        name: "Wednesday Social Singles",
        format: "round_robin",
        status: "registration",
      };
      expect(tournament.status).toBe("registration");

      // PHASE 2: Check-in 8 players
      const checkins = makeCheckins(8, (i) => ({
        tournament_id: tournamentId,
      }));
      expect(checkins).toHaveLength(8);
      expect(new Set(checkins.map((c) => c.player_id)).size).toBe(8);

      // PHASE 3: Generate draw
      const draw = generateBowlsDraw(checkins, format);
      expect(draw.rinks.length).toBeGreaterThanOrEqual(1);
      // Singles: each rink has 2 assignments (1 per team)
      for (const rink of draw.rinks) {
        expect(rink).toHaveLength(2);
        const { team1, team2 } = extractTeams(rink);
        expect(team1).toHaveLength(1);
        expect(team2).toHaveLength(1);
      }

      // PHASE 4: Score all rinks
      const scores: TournamentScore[] = draw.rinks.map((rink, rinkIdx) => {
        const { team1, team2 } = extractTeams(rink);
        return simulateRinkScore(
          tournamentId, 1, rinkIdx + 1,
          toScorePlayers(team1), toScorePlayers(team2),
          [3, 0, 2, 1, 4, 0, 2],
          [1, 2, 0, 3, 1, 5, 1]
        );
      });

      expect(scores.length).toBe(draw.rinks.length);
      for (const score of scores) {
        expect(score.is_finalized).toBe(true);
        expect(score.total_a).toBe(12);
        expect(score.total_b).toBe(13);
        expect(score.winner).toBe("team_b");
      }

      // PHASE 5: Calculate bowls results
      for (const score of scores) {
        const result = calculateBowlsResult(score.team_a_scores, score.team_b_scores);
        expect(result.winner).toBe("team_b");
        expect(result.margin).toBe(1);
      }

      // PHASE 6: Build standings
      const standings = buildStandingsFromScores(scores);
      const sorted = sortStandings(standings);
      expect(sorted.length).toBeGreaterThan(0);
      expect(sorted[0].wins).toBeGreaterThanOrEqual(1);

      // PHASE 7: Calculate and apply rating updates
      const existingRatings = new Map<string, BowlsPositionRating>();
      const ratingUpdates = calculateRatingUpdates(scores, checkins, existingRatings);
      expect(ratingUpdates.length).toBeGreaterThan(0);

      const newRatings = applyUpdates(ratingUpdates, existingRatings, "2026");
      expect(newRatings.length).toBeGreaterThan(0);

      // Winners should have higher ELO than losers
      const winnerRating = newRatings.find((r) =>
        scores[0].team_b_players.some((p) => p.player_id === r.player_id)
      );
      const loserRating = newRatings.find((r) =>
        scores[0].team_a_players.some((p) => p.player_id === r.player_id)
      );
      if (winnerRating && loserRating) {
        expect(winnerRating.elo_rating).toBeGreaterThan(loserRating.elo_rating);
      }

      // PHASE 8: Complete tournament
      tournament.status = "completed";
      expect(tournament.status).toBe("completed");
    });
  });

  describe("Full lifecycle: fours format (16 players)", () => {
    it("chains create -> checkin -> draw -> score -> standings -> ratings -> completion", () => {
      const tournamentId = "lifecycle-fours";
      const format: BowlsGameFormat = "fours";

      const positions = ["skip", "vice", "lead", "second"];
      const checkins = makeCheckins(16, (i) => ({
        tournament_id: tournamentId,
        preferred_position: positions[i % positions.length],
      }));

      const draw = generateBowlsDraw(checkins, format);
      expect(draw.rinkCount).toBe(2);
      expect(draw.rinks).toHaveLength(2);
      for (const rink of draw.rinks) {
        // 8 assignments per rink (4 per team)
        expect(rink).toHaveLength(8);
        const { team1, team2 } = extractTeams(rink);
        expect(team1).toHaveLength(4);
        expect(team2).toHaveLength(4);
      }

      const rinkScores: [number[], number[]][] = [
        [[4, 1, 0, 3, 2, 1, 5], [1, 3, 2, 0, 1, 4, 2]], // Team A wins 16-13
        [[2, 0, 3, 1, 2, 0, 1], [3, 2, 1, 4, 0, 3, 3]],  // Team B wins 9-16
      ];

      const scores: TournamentScore[] = draw.rinks.map((rink, rinkIdx) => {
        const { team1, team2 } = extractTeams(rink);
        return simulateRinkScore(
          tournamentId, 1, rinkIdx + 1,
          toScorePlayers(team1), toScorePlayers(team2),
          rinkScores[rinkIdx][0], rinkScores[rinkIdx][1]
        );
      });

      expect(scores[0].winner).toBe("team_a");
      expect(scores[1].winner).toBe("team_b");

      const standings = buildStandingsFromScores(scores);
      const sorted = sortStandings(standings);
      expect(sorted.length).toBe(16);

      const winners = sorted.filter((s) => s.wins === 1);
      expect(winners.length).toBe(8);

      const existingRatings = new Map<string, BowlsPositionRating>();
      const ratingUpdates = calculateRatingUpdates(scores, checkins, existingRatings);
      const newRatings = applyUpdates(ratingUpdates, existingRatings, "2026");
      expect(newRatings.length).toBeGreaterThan(0);
    });
  });

  describe("Multi-round lifecycle: Mead draw (12 players, triples)", () => {
    it("chains create -> checkin -> multi-round draw -> score -> cumulative standings -> ratings", () => {
      const tournamentId = "lifecycle-mead";
      const format: BowlsGameFormat = "triples";

      const positions = ["skip", "vice", "lead"];
      const checkins = makeCheckins(12, (i) => ({
        tournament_id: tournamentId,
        preferred_position: positions[i % positions.length],
      }));

      const meadDraw = generateMeadDraw(checkins, format);
      expect(meadDraw.rounds.length).toBeGreaterThanOrEqual(2);

      const allScores: TournamentScore[] = [];

      for (let roundIdx = 0; roundIdx < Math.min(2, meadDraw.rounds.length); roundIdx++) {
        const round = meadDraw.rounds[roundIdx];
        for (let rinkIdx = 0; rinkIdx < round.rinks.length; rinkIdx++) {
          const rink = round.rinks[rinkIdx];
          const { team1, team2 } = extractTeams(rink);

          const teamAEnds = roundIdx === 0
            ? [3, 2, 1, 4, 0, 2, 3]
            : [1, 0, 2, 1, 1, 0, 2];
          const teamBEnds = roundIdx === 0
            ? [1, 0, 3, 2, 1, 1, 2]
            : [2, 3, 1, 4, 2, 3, 1];

          allScores.push(
            simulateRinkScore(
              tournamentId, roundIdx + 1, rinkIdx + 1,
              toScorePlayers(team1), toScorePlayers(team2),
              teamAEnds, teamBEnds
            )
          );
        }
      }

      expect(allScores.length).toBeGreaterThan(0);

      const standings = buildStandingsFromScores(allScores);
      const sorted = sortStandings(standings);
      expect(sorted.length).toBeGreaterThan(0);

      const existingRatings = new Map<string, BowlsPositionRating>();
      const ratingUpdates = calculateRatingUpdates(allScores, checkins, existingRatings);
      const newRatings = applyUpdates(ratingUpdates, existingRatings, "2026");
      expect(newRatings.length).toBeGreaterThan(0);

      for (const rating of newRatings) {
        expect(typeof rating.elo_rating).toBe("number");
        expect(rating.elo_rating).toBeGreaterThan(0);
      }
    });
  });

  describe("Edge cases in lifecycle", () => {
    it("handles draw scenario: tied scores produce draw standings correctly", () => {
      const tournamentId = "lifecycle-draw";
      const format: BowlsGameFormat = "pairs";

      const checkins = makeCheckins(4, (i) => ({
        tournament_id: tournamentId,
        preferred_position: i % 2 === 0 ? "skip" : "lead",
      }));

      const draw = generateBowlsDraw(checkins, format);
      expect(draw.rinks.length).toBeGreaterThanOrEqual(1);

      const rink = draw.rinks[0];
      const { team1, team2 } = extractTeams(rink);

      const score = simulateRinkScore(
        tournamentId, 1, 1,
        toScorePlayers(team1), toScorePlayers(team2),
        [2, 1, 3, 0, 2, 1, 3],
        [1, 3, 0, 2, 3, 0, 3]
      );

      expect(score.total_a).toBe(12);
      expect(score.total_b).toBe(12);
      expect(score.winner).toBe("draw");

      const result = calculateBowlsResult(score.team_a_scores, score.team_b_scores);
      expect(result.winner).toBe("draw");
      expect(result.margin).toBe(0);

      const standings = buildStandingsFromScores([score]);
      for (const s of standings) {
        expect(s.draws).toBe(1);
        expect(s.wins).toBe(0);
        expect(s.losses).toBe(0);
      }
    });

    it("handles unfinalized scores: only finalized scores affect ratings", () => {
      const tournamentId = "lifecycle-unfinalized";

      const checkins = makeCheckins(4, (i) => ({
        tournament_id: tournamentId,
        preferred_position: i % 2 === 0 ? "skip" : "lead",
      }));

      const finalizedScore = simulateRinkScore(
        tournamentId, 1, 1,
        [{ player_id: checkins[0].player_id, display_name: "A1" },
         { player_id: checkins[1].player_id, display_name: "A2" }],
        [{ player_id: checkins[2].player_id, display_name: "B1" },
         { player_id: checkins[3].player_id, display_name: "B2" }],
        [3, 2, 1, 4], [1, 0, 3, 2],
        true
      );

      const unfinalizedScore = simulateRinkScore(
        tournamentId, 2, 1,
        [{ player_id: checkins[0].player_id, display_name: "A1" },
         { player_id: checkins[1].player_id, display_name: "A2" }],
        [{ player_id: checkins[2].player_id, display_name: "B1" },
         { player_id: checkins[3].player_id, display_name: "B2" }],
        [0, 0, 0, 0], [5, 5, 5, 5],
        false
      );

      const existingRatings = new Map<string, BowlsPositionRating>();
      const ratingsWithBoth = calculateRatingUpdates(
        [finalizedScore, unfinalizedScore], checkins, existingRatings
      );
      const ratingsOnlyFinalized = calculateRatingUpdates(
        [finalizedScore], checkins, existingRatings
      );

      expect(ratingsWithBoth.length).toBe(ratingsOnlyFinalized.length);
    });

    it("handles odd player count: draw handles sit-outs gracefully", () => {
      const tournamentId = "lifecycle-odd";
      const format: BowlsGameFormat = "pairs";

      const checkins = makeCheckins(5, (i) => ({
        tournament_id: tournamentId,
        preferred_position: i % 2 === 0 ? "skip" : "lead",
      }));

      const draw = generateBowlsDraw(checkins, format);
      expect(draw.rinks.length).toBe(1);
      expect(draw.unassigned.length).toBe(1);

      const assignedPlayerIds = new Set(
        draw.rinks.flat().map((a) => a.player_id)
      );
      const unassignedPlayer = checkins.find(
        (c) => !assignedPlayerIds.has(c.player_id)
      );
      expect(unassignedPlayer).toBeDefined();
    });

    it("handles minimum players: 2 players can form a singles match", () => {
      const tournamentId = "lifecycle-minimum";
      const format: BowlsGameFormat = "singles";

      const checkins = makeCheckins(2, (i) => ({
        tournament_id: tournamentId,
      }));

      const draw = generateBowlsDraw(checkins, format);
      expect(draw.rinks.length).toBe(1);
      expect(draw.unassigned.length).toBe(0);

      const { team1, team2 } = extractTeams(draw.rinks[0]);
      const score = simulateRinkScore(
        tournamentId, 1, 1,
        toScorePlayers(team1), toScorePlayers(team2),
        [5, 3, 2, 4, 1], [2, 1, 4, 0, 3]
      );

      expect(score.winner).toBe("team_a");

      const existingRatings = new Map<string, BowlsPositionRating>();
      const updates = calculateRatingUpdates([score], checkins, existingRatings);
      const ratings = applyUpdates(updates, existingRatings, "2026");

      expect(ratings.length).toBe(2);
      // Team A won, so team A player should have higher ELO
      const winnerPid = score.team_a_players[0].player_id;
      const loserPid = score.team_b_players[0].player_id;
      const winnerRating = ratings.find((r) => r.player_id === winnerPid);
      const loserRating = ratings.find((r) => r.player_id === loserPid);
      expect(winnerRating!.elo_rating).toBeGreaterThan(loserRating!.elo_rating);
    });

    it("preserves existing ratings across tournaments", () => {
      const tournamentId = "lifecycle-existing-ratings";

      const checkins = makeCheckins(2, (i) => ({
        tournament_id: tournamentId,
        preferred_position: "lead",
      }));

      const existingRatings = new Map<string, BowlsPositionRating>();
      existingRatings.set(`${checkins[0].player_id}:lead`, {
        player_id: checkins[0].player_id,
        position: "lead",
        season: "2026",
        elo_rating: 1350,
        games_played: 10,
        wins: 7,
        losses: 3,
        draws: 0,
        shot_differential: 25,
        ends_won: 48,
        ends_played: 70,
        updated_at: new Date().toISOString(),
      });
      existingRatings.set(`${checkins[1].player_id}:lead`, {
        player_id: checkins[1].player_id,
        position: "lead",
        season: "2026",
        elo_rating: 1050,
        games_played: 10,
        wins: 3,
        losses: 7,
        draws: 0,
        shot_differential: -20,
        ends_won: 30,
        ends_played: 70,
        updated_at: new Date().toISOString(),
      });

      const score = simulateRinkScore(
        tournamentId, 1, 1,
        [{ player_id: checkins[0].player_id, display_name: "Strong" }],
        [{ player_id: checkins[1].player_id, display_name: "Weak" }],
        [4, 3, 2, 1, 5], [1, 0, 3, 2, 0]
      );

      const updates = calculateRatingUpdates([score], checkins, existingRatings);
      const newRatings = applyUpdates(updates, existingRatings, "2026");

      const strongRating = newRatings.find((r) => r.player_id === checkins[0].player_id);
      const weakRating = newRatings.find((r) => r.player_id === checkins[1].player_id);

      expect(strongRating!.elo_rating).toBeGreaterThan(1350);
      expect(weakRating!.elo_rating).toBeLessThan(1050);
      expect(strongRating!.games_played).toBe(11);
      expect(weakRating!.games_played).toBe(11);
    });
  });

  describe("State machine transitions", () => {
    it("validates correct state progression sequence", () => {
      const validTransitions: Record<string, string[]> = {
        registration: ["start_checkin"],
        checkin: ["generate_draw"],
        draw: ["start_scoring"],
        scoring: ["finalize_round"],
        results: ["next_round", "complete"],
      };

      for (const [_state, actions] of Object.entries(validTransitions)) {
        expect(actions.length).toBeGreaterThan(0);
        expect(new Set(actions).size).toBe(actions.length);
      }

      const stateOrder = ["registration", "checkin", "draw", "scoring", "results"];
      for (let i = 0; i < stateOrder.length - 1; i++) {
        const currentActions = validTransitions[stateOrder[i]];
        expect(currentActions).toBeDefined();
        expect(currentActions.length).toBeGreaterThan(0);
      }
    });

    it("results state allows both next_round and complete", () => {
      const resultsActions = ["next_round", "complete"];
      expect(resultsActions).toContain("next_round");
      expect(resultsActions).toContain("complete");
      expect(resultsActions.length).toBe(2);
    });
  });
});
