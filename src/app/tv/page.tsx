"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { TournamentScore } from "@/lib/types";
import WeatherWidget from "./WeatherWidget";

interface TournamentData {
  id: string;
  name: string;
  sport: string;
  format: string;
  status: string;
  starts_at: string | null;
}

interface DrawAnnouncement {
  round: number;
  rinks: Array<{
    rink: number;
    team_a_players: { player_id: string; display_name: string }[];
    team_b_players: { player_id: string; display_name: string }[];
  }>;
  timestamp: number;
}

export default function TVScoreboardPage() {
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [scores, setScores] = useState<TournamentScore[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRound, setMaxRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [drawAnnouncement, setDrawAnnouncement] = useState<DrawAnnouncement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load the active tournament
  const loadTournament = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tournaments")
      .select("id, name, sport, format, status, starts_at")
      .eq("sport", "lawn_bowling")
      .in("status", ["in_progress", "registration"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setTournament(data as TournamentData);
    }
    setLoading(false);
  }, []);

  // Load scores for the current tournament
  const loadScores = useCallback(async () => {
    if (!tournament) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("tournament_scores")
      .select("*")
      .eq("tournament_id", tournament.id)
      .order("round", { ascending: true })
      .order("rink", { ascending: true });

    if (data && data.length > 0) {
      setScores(data as TournamentScore[]);
      const rounds = data.map((s) => s.round);
      const max = Math.max(...rounds);
      setMaxRound(max);
      setCurrentRound(max);
    }
  }, [tournament]);

  // Initial load
  useEffect(() => {
    loadTournament();
  }, [loadTournament]);

  useEffect(() => {
    if (tournament) {
      loadScores();
    }
  }, [tournament, loadScores]);

  // Supabase Realtime subscription for live score updates
  useEffect(() => {
    if (!tournament) return;

    const supabase = createClient();

    // Subscribe to score changes
    const scoresChannel = supabase
      .channel(`tv-scores-${tournament.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_scores",
          filter: `tournament_id=eq.${tournament.id}`,
        },
        () => {
          loadScores();
        }
      )
      .subscribe();

    // Subscribe to new draw announcements (checkins being created en masse = new draw)
    const checkinsChannel = supabase
      .channel(`tv-checkins-${tournament.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tournament_scores",
          filter: `tournament_id=eq.${tournament.id}`,
        },
        (payload) => {
          const newScore = payload.new as TournamentScore;
          // When a new round appears with team data, show draw announcement
          if (newScore.team_a_players?.length > 0) {
            setDrawAnnouncement((prev) => {
              const round = newScore.round;
              const rinkData = {
                rink: newScore.rink,
                team_a_players: newScore.team_a_players,
                team_b_players: newScore.team_b_players,
              };

              if (prev && prev.round === round) {
                return {
                  ...prev,
                  rinks: [...prev.rinks, rinkData],
                  timestamp: Date.now(),
                };
              }

              return {
                round,
                rinks: [rinkData],
                timestamp: Date.now(),
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scoresChannel);
      supabase.removeChannel(checkinsChannel);
    };
  }, [tournament, loadScores]);

  // Auto-dismiss draw announcement after 30 seconds
  useEffect(() => {
    if (!drawAnnouncement) return;
    const timer = setTimeout(() => setDrawAnnouncement(null), 30000);
    return () => clearTimeout(timer);
  }, [drawAnnouncement]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const roundScores = scores.filter((s) => s.round === currentRound);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-zinc-950 text-white overflow-hidden select-none"
    >
      {/* Header Bar */}
      <header className="flex items-center justify-between border-b border-white/10 bg-zinc-900/80 px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-2xl font-black">
            B
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight lg:text-3xl">
              {tournament?.name ?? "Lawn Bowls"}
            </h1>
            <p className="text-sm text-zinc-400">
              {tournament?.status === "in_progress"
                ? "In Progress"
                : tournament?.status === "registration"
                  ? "Registration Open"
                  : "No Active Tournament"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Live indicator */}
          {tournament?.status === "in_progress" && (
            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                Live
              </span>
            </div>
          )}

          {/* Weather */}
          <WeatherWidget />

          {/* Clock */}
          <div className="text-right">
            <p className="text-3xl font-black tabular-nums lg:text-4xl">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {currentTime.toLocaleDateString([], {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Draw Announcement Overlay */}
      {drawAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="mx-8 w-full max-w-5xl animate-in fade-in zoom-in duration-500">
            <div className="rounded-3xl border border-emerald-500/30 bg-zinc-900 p-8 shadow-2xl shadow-emerald-500/10">
              <div className="mb-8 text-center">
                <p className="text-lg font-semibold uppercase tracking-widest text-emerald-400">
                  Draw Announcement
                </p>
                <h2 className="mt-2 text-4xl font-black lg:text-5xl">
                  Round {drawAnnouncement.round}
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {drawAnnouncement.rinks
                  .sort((a, b) => a.rink - b.rink)
                  .map((rink) => (
                    <div
                      key={rink.rink}
                      className="rounded-2xl border border-white/10 bg-zinc-800/50 p-5"
                    >
                      <p className="mb-3 text-center text-sm font-bold uppercase tracking-wider text-zinc-400">
                        Rink {rink.rink}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                            Team A
                          </p>
                          {rink.team_a_players.map((p) => (
                            <p
                              key={p.player_id}
                              className="text-sm font-medium text-white"
                            >
                              {p.display_name}
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                            Team B
                          </p>
                          {rink.team_b_players.map((p) => (
                            <p
                              key={p.player_id}
                              className="text-sm font-medium text-white"
                            >
                              {p.display_name}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                This announcement will dismiss automatically
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {!tournament ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800 text-5xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 dark:text-zinc-400">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-zinc-400">
                No Active Tournament
              </h2>
              <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                Waiting for a tournament to begin...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Round Tabs */}
            {maxRound > 1 && (
              <div className="mb-6 flex items-center gap-2">
                <span className="mr-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Round
                </span>
                {Array.from({ length: maxRound }, (_, i) => i + 1).map(
                  (round) => (
                    <button
                      key={round}
                      onClick={() => setCurrentRound(round)}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black transition-all",
                        currentRound === round
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      )}
                    >
                      {round}
                    </button>
                  )
                )}
              </div>
            )}

            {/* Scoreboard Grid */}
            {roundScores.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {roundScores.map((score) => (
                  <ScoreCard key={score.id} score={score} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-zinc-500 dark:text-zinc-400">
                    Round {currentRound}
                  </h3>
                  <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                    Waiting for scores...
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-zinc-950/90 backdrop-blur px-8 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Powered by Lawnbowling App
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Auto-refreshing &middot; TV Display Mode
          </p>
        </div>
      </footer>
    </div>
  );
}

function ScoreCard({ score }: { score: TournamentScore }) {
  const isFinalized = score.is_finalized;
  const hasScores =
    score.team_a_scores.length > 0 || score.team_b_scores.length > 0;

  const teamAWinning = score.total_a > score.total_b;
  const teamBWinning = score.total_b > score.total_a;
  const isDraw = hasScores && score.total_a === score.total_b;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-zinc-900 overflow-hidden transition-all",
        isFinalized
          ? "border-emerald-500/30"
          : hasScores
            ? "border-amber-500/30"
            : "border-white/10"
      )}
    >
      {/* Rink Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-zinc-800/50 px-5 py-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Rink {score.rink}
        </h3>
        {isFinalized ? (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
            Final
          </span>
        ) : hasScores ? (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
            <span className="live-dot" style={{ width: 6, height: 6 }} />
            In Play
          </span>
        ) : (
          <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-bold text-zinc-400">
            Pending
          </span>
        )}
      </div>

      {/* Teams and Score */}
      <div className="p-5">
        {/* Team A */}
        <div
          className={cn(
            "flex items-center justify-between rounded-xl p-4 transition-colors",
            teamAWinning ? "bg-emerald-500/10" : "bg-zinc-800/30"
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              Team A
            </p>
            <div className="space-y-0.5">
              {score.team_a_players?.map((p) => (
                <p
                  key={p.player_id}
                  className="text-sm font-medium text-white truncate"
                >
                  {p.display_name}
                </p>
              ))}
              {(!score.team_a_players || score.team_a_players.length === 0) && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">--</p>
              )}
            </div>
          </div>
          <div className="ml-4 text-right">
            <p
              className={cn(
                "text-4xl font-black tabular-nums lg:text-5xl",
                teamAWinning ? "text-emerald-400" : "text-white"
              )}
            >
              {score.total_a}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {score.ends_won_a} ends
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 flex items-center gap-3">
          <div className="flex-1 border-t border-white/5" />
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">VS</span>
          <div className="flex-1 border-t border-white/5" />
        </div>

        {/* Team B */}
        <div
          className={cn(
            "flex items-center justify-between rounded-xl p-4 transition-colors",
            teamBWinning ? "bg-blue-500/10" : "bg-zinc-800/30"
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              Team B
            </p>
            <div className="space-y-0.5">
              {score.team_b_players?.map((p) => (
                <p
                  key={p.player_id}
                  className="text-sm font-medium text-white truncate"
                >
                  {p.display_name}
                </p>
              ))}
              {(!score.team_b_players || score.team_b_players.length === 0) && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">--</p>
              )}
            </div>
          </div>
          <div className="ml-4 text-right">
            <p
              className={cn(
                "text-4xl font-black tabular-nums lg:text-5xl",
                teamBWinning ? "text-blue-400" : "text-white"
              )}
            >
              {score.total_b}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {score.ends_won_b} ends
            </p>
          </div>
        </div>

        {/* Result badge */}
        {isFinalized && (
          <div className="mt-3 text-center">
            {isDraw ? (
              <span className="text-sm font-bold text-zinc-400">Draw</span>
            ) : teamAWinning ? (
              <span className="text-sm font-bold text-emerald-400">
                Team A wins by {score.total_a - score.total_b}
              </span>
            ) : (
              <span className="text-sm font-bold text-blue-400">
                Team B wins by {score.total_b - score.total_a}
              </span>
            )}
          </div>
        )}

        {/* End-by-end scores */}
        {hasScores && (
          <div className="mt-4 border-t border-white/5 pt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              End-by-End
            </p>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {score.team_a_scores.map((sa, i) => {
                const sb = score.team_b_scores[i] ?? 0;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center rounded-lg bg-zinc-800/50 px-2 py-1.5 min-w-[36px]"
                  >
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400">{i + 1}</span>
                    <span
                      className={cn(
                        "text-xs font-bold tabular-nums",
                        sa > sb
                          ? "text-emerald-400"
                          : sa < sb
                            ? "text-zinc-500 dark:text-zinc-400"
                            : "text-white"
                      )}
                    >
                      {sa}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-bold tabular-nums",
                        sb > sa
                          ? "text-blue-400"
                          : sb < sa
                            ? "text-zinc-500 dark:text-zinc-400"
                            : "text-white"
                      )}
                    >
                      {sb}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
