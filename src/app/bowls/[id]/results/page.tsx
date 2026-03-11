"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { cn } from "@/lib/utils";
import type { TournamentScore, ScoreWinner } from "@/lib/types";

interface RoundSummary {
  round: number;
  scores: TournamentScore[];
  allFinalized: boolean;
}

interface TournamentStats {
  totalShots: number;
  totalEnds: number;
  highestRinkScore: { rink: number; round: number; team: string; score: number } | null;
  mostEndsWon: { rink: number; round: number; team: string; ends: number } | null;
}

interface PlayerStanding {
  player_id: string;
  display_name: string;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  total_shots_for: number;
  total_shots_against: number;
  total_ends_won: number;
}

interface ProgressionInfo {
  current_state: string;
  current_round: number;
  total_rounds_played: number;
  available_actions: string[];
  all_scores_finalized: boolean;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournamentName, setTournamentName] = useState("Tournament");
  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [stats, setStats] = useState<TournamentStats>({
    totalShots: 0,
    totalEnds: 0,
    highestRinkScore: null,
    mostEndsWon: null,
  });
  const [playerStandings, setPlayerStandings] = useState<PlayerStanding[]>([]);
  const [progression, setProgression] = useState<ProgressionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [showStandings, setShowStandings] = useState(false);

  const loadTournament = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tournaments")
      .select("name")
      .eq("id", tournamentId)
      .single();
    if (data) setTournamentName(data.name);
  }, [tournamentId]);

  const loadProgression = useCallback(async () => {
    try {
      const res = await fetch(`/api/bowls/progression?tournament_id=${tournamentId}`);
      if (res.ok) {
        const data = await res.json();
        setProgression(data);
      }
    } catch {
      // Non-critical
    }
  }, [tournamentId]);

  const loadResults = useCallback(async () => {
    try {
      const res = await fetch(`/api/bowls/results?tournament_id=${tournamentId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.player_standings) {
          setPlayerStandings(data.player_standings);
        }
      }
    } catch {
      // Non-critical
    }
  }, [tournamentId]);

  const loadAllScores = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/bowls/scores?tournament_id=${tournamentId}`
      );
      if (res.ok) {
        const data: TournamentScore[] = await res.json();

        // Group by round
        const roundMap = new Map<number, TournamentScore[]>();
        for (const score of data) {
          const existing = roundMap.get(score.round) ?? [];
          existing.push(score);
          roundMap.set(score.round, existing);
        }

        const roundSummaries: RoundSummary[] = [];
        for (const [round, scores] of roundMap.entries()) {
          roundSummaries.push({
            round,
            scores: scores.sort((a, b) => a.rink - b.rink),
            allFinalized: scores.every((s) => s.is_finalized),
          });
        }
        roundSummaries.sort((a, b) => a.round - b.round);
        setRounds(roundSummaries);

        // Set selected round to latest
        if (roundSummaries.length > 0 && selectedRound === null) {
          setSelectedRound(roundSummaries[roundSummaries.length - 1].round);
        }

        // Calculate stats
        calculateStats(data);
      }
    } catch {
      // Will retry
    }
    setLoading(false);
  }, [tournamentId, selectedRound]);

  // Subscribe to realtime updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`results-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_scores",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          loadAllScores();
          loadResults();
          loadProgression();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, loadAllScores, loadResults, loadProgression]);

  function calculateStats(allScores: TournamentScore[]) {
    let totalShots = 0;
    let totalEnds = 0;
    let highestRinkScore: TournamentStats["highestRinkScore"] = null;
    let mostEndsWon: TournamentStats["mostEndsWon"] = null;

    for (const s of allScores) {
      totalShots += s.total_a + s.total_b;
      totalEnds += s.team_a_scores.length;

      if (!highestRinkScore || s.total_a > highestRinkScore.score) {
        highestRinkScore = {
          rink: s.rink,
          round: s.round,
          team: "Team A",
          score: s.total_a,
        };
      }
      if (!highestRinkScore || s.total_b > highestRinkScore.score) {
        highestRinkScore = {
          rink: s.rink,
          round: s.round,
          team: "Team B",
          score: s.total_b,
        };
      }

      if (!mostEndsWon || s.ends_won_a > mostEndsWon.ends) {
        mostEndsWon = {
          rink: s.rink,
          round: s.round,
          team: "Team A",
          ends: s.ends_won_a,
        };
      }
      if (!mostEndsWon || s.ends_won_b > mostEndsWon.ends) {
        mostEndsWon = {
          rink: s.rink,
          round: s.round,
          team: "Team B",
          ends: s.ends_won_b,
        };
      }
    }

    setStats({ totalShots, totalEnds, highestRinkScore, mostEndsWon });
  }

  useEffect(() => {
    loadTournament();
    loadAllScores();
    loadResults();
    loadProgression();
  }, [loadTournament, loadAllScores, loadResults, loadProgression]);

  async function handleNextRound() {
    setAdvancing(true);
    try {
      const res = await fetch("/api/bowls/progression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          action: "next_round",
        }),
      });
      if (res.ok) {
        router.push(`/bowls/${tournamentId}`);
      }
    } catch {
      // Handle error
    }
    setAdvancing(false);
  }

  async function handleComplete() {
    setAdvancing(true);
    try {
      await fetch("/api/bowls/progression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          action: "complete",
        }),
      });
      await loadProgression();
    } catch {
      // Handle error
    }
    setAdvancing(false);
  }

  const currentRound = rounds.find((r) => r.round === selectedRound);

  function getWinnerLabel(winner: ScoreWinner): string {
    if (winner === "team_a") return "Team A wins";
    if (winner === "team_b") return "Team B wins";
    if (winner === "draw") return "Draw";
    return "In progress";
  }

  function getWinnerColor(winner: ScoreWinner): string {
    if (winner === "team_a") return "text-blue-600";
    if (winner === "team_b") return "text-purple-600";
    if (winner === "draw") return "text-amber-600";
    return "text-zinc-400";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur print:static print:border-0">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                Results
              </h1>
              <p className="text-sm text-zinc-500">{tournamentName}</p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={() => router.push(`/bowls/${tournamentId}`)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 min-h-[44px] touch-manipulation"
              >
                Back
              </button>
              <button
                onClick={() => router.push(`/bowls/${tournamentId}/scores`)}
                className="rounded-xl bg-[#1B5E20] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#145218] min-h-[44px] touch-manipulation"
              >
                Enter Scores
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {rounds.length === 0 ? (
          <div className="rounded-2xl bg-white border border-zinc-200 p-12 text-center">
            <p className="text-lg font-semibold text-zinc-400">
              No scores recorded yet
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Enter scores to see results here
            </p>
            <button
              onClick={() => router.push(`/bowls/${tournamentId}/scores`)}
              className="mt-4 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218] min-h-[48px] touch-manipulation"
            >
              Enter Scores
            </button>
          </div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white border border-zinc-200 p-4 text-center">
                <p className="text-3xl font-black text-zinc-900">
                  {rounds.length}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Round{rounds.length !== 1 ? "s" : ""} Played
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-zinc-200 p-4 text-center">
                <p className="text-3xl font-black text-[#1B5E20]">
                  {stats.totalShots}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Total Shots</p>
              </div>
              <div className="rounded-2xl bg-white border border-zinc-200 p-4 text-center">
                <p className="text-3xl font-black text-purple-600">
                  {stats.totalEnds}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Total Ends</p>
              </div>
              <div className="rounded-2xl bg-white border border-zinc-200 p-4 text-center">
                <p className="text-3xl font-black text-emerald-600">
                  {stats.highestRinkScore?.score ?? 0}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Highest Score</p>
                {stats.highestRinkScore && (
                  <p className="text-[10px] text-zinc-400">
                    {stats.highestRinkScore.team}, Rink{" "}
                    {stats.highestRinkScore.rink} R
                    {stats.highestRinkScore.round}
                  </p>
                )}
              </div>
            </div>

            {/* View toggle: Round results vs Standings */}
            <div className="mb-6 flex items-center gap-2 print:hidden">
              <button
                onClick={() => setShowStandings(false)}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors min-h-[44px] touch-manipulation",
                  !showStandings
                    ? "bg-[#1B5E20] text-white"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                )}
              >
                Round Results
              </button>
              <button
                onClick={() => setShowStandings(true)}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors min-h-[44px] touch-manipulation",
                  showStandings
                    ? "bg-[#1B5E20] text-white"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                )}
              >
                Player Standings
              </button>
            </div>

            {/* Player Standings Table */}
            {showStandings && playerStandings.length > 0 && (
              <div className="mb-6 rounded-2xl bg-white border border-zinc-200 overflow-hidden">
                <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3">
                  <h3 className="text-sm font-bold text-zinc-700">
                    Player Standings (All Rounds)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/50">
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">#</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Player</th>
                        <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">P</th>
                        <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">W</th>
                        <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">L</th>
                        <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">D</th>
                        <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">SF</th>
                        <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">SA</th>
                        <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">+/-</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStandings.map((p, idx) => (
                        <tr key={p.player_id} className="border-b border-zinc-100 last:border-0">
                          <td className="px-4 py-3 text-sm font-bold text-zinc-400">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-zinc-900 whitespace-nowrap">
                            {p.display_name}
                          </td>
                          <td className="px-3 py-3 text-center font-medium text-zinc-700">{p.games_played}</td>
                          <td className="px-3 py-3 text-center font-bold text-emerald-600">{p.wins}</td>
                          <td className="px-3 py-3 text-center font-medium text-red-500">{p.losses}</td>
                          <td className="px-3 py-3 text-center font-medium text-amber-600">{p.draws}</td>
                          <td className="px-3 py-3 text-center font-medium text-zinc-600 tabular-nums">{p.total_shots_for}</td>
                          <td className="px-3 py-3 text-center font-medium text-zinc-600 tabular-nums">{p.total_shots_against}</td>
                          <td className={cn(
                            "px-3 py-3 text-center font-bold tabular-nums",
                            p.total_shots_for - p.total_shots_against > 0 ? "text-emerald-600" :
                            p.total_shots_for - p.total_shots_against < 0 ? "text-red-500" : "text-zinc-400"
                          )}>
                            {p.total_shots_for - p.total_shots_against > 0 ? "+" : ""}
                            {p.total_shots_for - p.total_shots_against}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Round tabs */}
            {!showStandings && (
              <>
                <div className="mb-6 flex items-center gap-2 overflow-x-auto print:hidden">
                  {rounds.map((r) => (
                    <button
                      key={r.round}
                      onClick={() => setSelectedRound(r.round)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap min-h-[44px] touch-manipulation",
                        selectedRound === r.round
                          ? "bg-[#1B5E20] text-white"
                          : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      )}
                    >
                      Round {r.round}
                      {r.allFinalized && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                            selectedRound === r.round
                              ? "bg-white/20 text-white"
                              : "bg-emerald-100 text-emerald-700"
                          )}
                        >
                          Final
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Round results */}
                {currentRound && (
                  <div className="space-y-4">
                    {currentRound.scores.map((score, idx) => (
                      <motion.div
                        key={score.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="rounded-2xl bg-white border border-zinc-200 overflow-hidden"
                      >
                        {/* Rink header */}
                        <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-zinc-700">
                            Rink {score.rink}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-bold",
                                getWinnerColor(score.winner)
                              )}
                            >
                              {getWinnerLabel(score.winner)}
                            </span>
                            {score.is_finalized && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                Final
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-5">
                          {/* Score summary */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div
                              className={cn(
                                "text-center p-3 rounded-xl",
                                score.winner === "team_a"
                                  ? "bg-blue-50 ring-2 ring-blue-200"
                                  : "bg-zinc-50"
                              )}
                            >
                              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                Team A
                              </p>
                              <p
                                className={cn(
                                  "text-3xl font-black tabular-nums",
                                  score.winner === "team_a"
                                    ? "text-blue-600"
                                    : "text-zinc-700"
                                )}
                              >
                                {score.total_a}
                              </p>
                              <p className="text-xs text-zinc-500 mt-1">
                                {score.ends_won_a} end
                                {score.ends_won_a !== 1 ? "s" : ""} won
                              </p>
                            </div>

                            <div className="flex items-center justify-center">
                              <span className="text-2xl font-black text-zinc-300">
                                vs
                              </span>
                            </div>

                            <div
                              className={cn(
                                "text-center p-3 rounded-xl",
                                score.winner === "team_b"
                                  ? "bg-purple-50 ring-2 ring-purple-200"
                                  : "bg-zinc-50"
                              )}
                            >
                              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                Team B
                              </p>
                              <p
                                className={cn(
                                  "text-3xl font-black tabular-nums",
                                  score.winner === "team_b"
                                    ? "text-purple-600"
                                    : "text-zinc-700"
                                )}
                              >
                                {score.total_b}
                              </p>
                              <p className="text-xs text-zinc-500 mt-1">
                                {score.ends_won_b} end
                                {score.ends_won_b !== 1 ? "s" : ""} won
                              </p>
                            </div>
                          </div>

                          {/* End-by-end breakdown */}
                          {score.team_a_scores.length > 0 && (
                            <div className="overflow-x-auto rounded-xl bg-zinc-50 border border-zinc-100">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-zinc-200">
                                    <th className="px-3 py-2 text-left text-xs font-bold text-zinc-400">
                                      &nbsp;
                                    </th>
                                    {score.team_a_scores.map((_, i) => (
                                      <th
                                        key={i}
                                        className="px-2 py-2 text-center text-xs font-bold text-zinc-400"
                                      >
                                        {i + 1}
                                      </th>
                                    ))}
                                    <th className="px-3 py-2 text-center text-xs font-bold text-zinc-700 border-l border-zinc-200">
                                      Tot
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-zinc-100">
                                    <td className="px-3 py-2 font-semibold text-blue-600">
                                      A
                                    </td>
                                    {score.team_a_scores.map((s, i) => (
                                      <td
                                        key={i}
                                        className={cn(
                                          "px-2 py-2 text-center font-bold tabular-nums",
                                          s > score.team_b_scores[i]
                                            ? "text-emerald-600"
                                            : s === 0
                                              ? "text-zinc-300"
                                              : "text-zinc-500"
                                        )}
                                      >
                                        {s}
                                      </td>
                                    ))}
                                    <td className="px-3 py-2 text-center font-black text-zinc-900 border-l border-zinc-200 tabular-nums">
                                      {score.total_a}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-semibold text-purple-600">
                                      B
                                    </td>
                                    {score.team_b_scores.map((s, i) => (
                                      <td
                                        key={i}
                                        className={cn(
                                          "px-2 py-2 text-center font-bold tabular-nums",
                                          s > score.team_a_scores[i]
                                            ? "text-emerald-600"
                                            : s === 0
                                              ? "text-zinc-300"
                                              : "text-zinc-500"
                                        )}
                                      >
                                        {s}
                                      </td>
                                    ))}
                                    <td className="px-3 py-2 text-center font-black text-zinc-900 border-l border-zinc-200 tabular-nums">
                                      {score.total_b}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Player names if available */}
                          {(score.team_a_players?.length > 0 ||
                            score.team_b_players?.length > 0) && (
                            <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-zinc-500">
                              <div>
                                <p className="font-bold text-zinc-400 mb-1">
                                  Team A Players
                                </p>
                                {score.team_a_players.map((p) => (
                                  <p key={p.player_id}>{p.display_name}</p>
                                ))}
                              </div>
                              <div>
                                <p className="font-bold text-zinc-400 mb-1">
                                  Team B Players
                                </p>
                                {score.team_b_players.map((p) => (
                                  <p key={p.player_id}>{p.display_name}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Tournament progression actions */}
            {progression && progression.current_state === "results" && (
              <div className="mt-8 space-y-4 print:hidden">
                {/* Next Round */}
                {progression.available_actions.includes("next_round") && (
                  <div className="rounded-2xl bg-[#1B5E20]/5 border border-[#1B5E20]/20 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#1B5E20]">
                          Start Next Round
                        </h3>
                        <p className="text-sm text-[#1B5E20]/70 mt-1">
                          Generate a new draw for Round {progression.current_round + 1}
                        </p>
                      </div>
                      <button
                        onClick={handleNextRound}
                        disabled={advancing}
                        className="rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218] disabled:opacity-50 min-h-[48px] touch-manipulation"
                      >
                        {advancing ? "Advancing..." : "Next Round"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Complete Tournament */}
                {progression.available_actions.includes("complete") && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-amber-800">
                          Complete Tournament
                        </h3>
                        <p className="text-sm text-amber-600 mt-1">
                          Mark this tournament as finished after {progression.total_rounds_played} round{progression.total_rounds_played !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <button
                        onClick={handleComplete}
                        disabled={advancing}
                        className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50 min-h-[48px] touch-manipulation"
                      >
                        {advancing ? "Completing..." : "Complete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tournament completed banner */}
            {progression?.current_state === "complete" && (
              <div className="mt-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center print:hidden">
                <p className="text-lg font-bold text-emerald-800">
                  Tournament Complete
                </p>
                <p className="text-sm text-emerald-600 mt-1">
                  {progression.total_rounds_played} round{progression.total_rounds_played !== 1 ? "s" : ""} played
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
