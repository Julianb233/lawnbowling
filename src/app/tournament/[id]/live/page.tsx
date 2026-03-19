"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Trophy, Users, Clock, Maximize, Minimize, Wifi, WifiOff } from "lucide-react";
import type { TournamentFormat, TournamentStatus } from "@/lib/types";
import { TOURNAMENT_FORMAT_LABELS } from "@/lib/types";
import { LiveBracketSlide } from "@/components/tournament/live/LiveBracketSlide";
import { LiveMatchesSlide } from "@/components/tournament/live/LiveMatchesSlide";
import { LiveStandingsSlide } from "@/components/tournament/live/LiveStandingsSlide";
import { LiveProgressHeader } from "@/components/tournament/live/LiveProgressHeader";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SlideType = "bracket" | "matches" | "standings";

interface TournamentData {
  id: string;
  name: string;
  sport: string;
  format: TournamentFormat;
  status: TournamentStatus;
  max_players: number;
  starts_at: string | null;
}

interface MatchData {
  id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  score: string | null;
  status: string;
  bracket?: string;
  scheduled_at: string | null;
  completed_at: string | null;
  player1?: { id: string; display_name: string; avatar_url: string | null } | null;
  player2?: { id: string; display_name: string; avatar_url: string | null } | null;
}

interface StandingData {
  player_id: string;
  wins: number;
  losses: number;
  eliminated: boolean;
  player: { id: string; display_name: string; avatar_url: string | null; skill_level?: string };
}

const DEFAULT_INTERVAL = 12;
const VALID_SLIDES: SlideType[] = ["bracket", "matches", "standings"];

/* ------------------------------------------------------------------ */
/*  Page wrapper                                                       */
/* ------------------------------------------------------------------ */

export default function LiveTournamentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0A2E12]">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <LiveTournamentDashboard />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/*  Main dashboard                                                     */
/* ------------------------------------------------------------------ */

function LiveTournamentDashboard() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  // Query params: ?interval=, ?slide=
  const slideParam = searchParams.get("slide") as SlideType | null;
  const intervalParam = searchParams.get("interval");
  const intervalSeconds = intervalParam
    ? Math.max(5, parseInt(intervalParam, 10) || DEFAULT_INTERVAL)
    : DEFAULT_INTERVAL;

  // --- State ---
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [standings, setStandings] = useState<StandingData[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  // Carousel
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const progressRef = useRef(0);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Time
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ========== Data Loading ==========

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/tournament/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTournament(data.tournament);
        setMatches(data.matches ?? []);
        setStandings(data.standings ?? []);
        setParticipantCount(data.participantCount ?? 0);
      }
    } catch {
      // Will retry
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ========== Supabase Realtime ==========

  useEffect(() => {
    if (!tournament) return;

    const supabase = createClient();

    const matchChannel = supabase
      .channel("live-dashboard-matches-" + tournament.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_matches",
          filter: "tournament_id=eq." + tournament.id,
        },
        () => {
          fetchData();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setReconnecting(false);
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setReconnecting(true);
      });

    const participantChannel = supabase
      .channel("live-dashboard-participants-" + tournament.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_participants",
          filter: "tournament_id=eq." + tournament.id,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    // Fallback polling every 10s
    const pollInterval = setInterval(fetchData, 10000);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(participantChannel);
    };
  }, [tournament, fetchData]);

  // ========== Page Visibility ==========

  useEffect(() => {
    function handleVisibility() {
      setIsVisible(!document.hidden);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ========== Build slide list ==========

  const activeSlides: SlideType[] =
    slideParam && VALID_SLIDES.includes(slideParam)
      ? [slideParam]
      : tournament?.format === "round_robin"
        ? ["matches", "standings"]
        : ["bracket", "matches", "standings"];

  // ========== Carousel Timer ==========

  const advanceSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
    progressRef.current = 0;
    setSlideProgress(0);
  }, [activeSlides.length]);

  useEffect(() => {
    if (!isVisible || activeSlides.length <= 1) return;

    const tickMs = 200;
    const totalTicks = (intervalSeconds * 1000) / tickMs;

    const timerId = setInterval(() => {
      progressRef.current += 1;
      const progress = progressRef.current / totalTicks;
      setSlideProgress(Math.min(progress, 1));

      if (progressRef.current >= totalTicks) {
        advanceSlide();
      }
    }, tickMs);

    return () => clearInterval(timerId);
  }, [intervalSeconds, isVisible, advanceSlide, activeSlides.length]);

  // ========== Fullscreen ==========

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

  // ========== Computed values ==========

  const completedMatches = matches.filter((m) => m.status === "completed").length;
  const totalMatches = matches.length;
  const inProgressMatches = matches.filter((m) => m.status === "in_progress").length;
  const tournamentProgress = totalMatches > 0 ? completedMatches / totalMatches : 0;

  const maxRound = matches.length > 0 ? Math.max(...matches.map((m) => m.round)) : 0;
  const currentRound = matches.some((m) => m.status === "in_progress")
    ? matches.find((m) => m.status === "in_progress")!.round
    : maxRound;

  // ========== Render ==========

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A2E12]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A2E12] text-white">
        <div className="text-center">
          <Trophy className="mx-auto mb-4 h-16 w-16 text-[#3D5A3E]" />
          <h2 className="text-2xl font-black text-[#3D5A3E]">Tournament Not Found</h2>
          <p className="mt-2 text-[#3D5A3E]">This tournament does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const currentSlideType = activeSlides[currentSlideIndex % activeSlides.length] ?? "bracket";

  function renderSlide() {
    switch (currentSlideType) {
      case "bracket":
        return (
          <LiveBracketSlide
            matches={matches}
            format={tournament!.format}
            currentRound={currentRound}
          />
        );
      case "matches":
        return (
          <LiveMatchesSlide
            matches={matches}
            currentRound={currentRound}
          />
        );
      case "standings":
        return (
          <LiveStandingsSlide
            standings={standings}
            matches={matches}
            tournamentName={tournament!.name}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0A2E12] text-white overflow-hidden select-none flex flex-col"
    >
      {/* Header */}
      <header className="relative border-b border-white/10 bg-[#0A2E12]/80 backdrop-blur">
        <div className="flex items-center justify-between px-[clamp(1rem,2vw,2rem)] py-[clamp(0.75rem,1.5vh,1.25rem)]">
          {/* Left: Tournament info */}
          <div className="flex items-center gap-[clamp(0.75rem,1.5vw,1.5rem)]">
            <div
              className="flex items-center justify-center rounded-xl bg-emerald-600"
              style={{
                width: "clamp(2.5rem, 4vw, 3.5rem)",
                height: "clamp(2.5rem, 4vw, 3.5rem)",
              }}
            >
              <Trophy
                className="text-white"
                style={{ width: "clamp(1.25rem, 2vw, 1.75rem)", height: "clamp(1.25rem, 2vw, 1.75rem)" }}
              />
            </div>
            <div>
              <h1
                className="font-black tracking-tight text-white"
                style={{ fontSize: "clamp(1rem, 2.5vw, 2rem)" }}
              >
                {tournament.name}
              </h1>
              <div className="flex items-center gap-[clamp(0.5rem,1vw,1rem)] text-[#a8c8b4]" style={{ fontSize: "clamp(0.6rem, 1vw, 0.875rem)" }}>
                <span>{TOURNAMENT_FORMAT_LABELS[tournament.format]}</span>
                <span className="opacity-40">|</span>
                <span className="flex items-center gap-1">
                  <Users style={{ width: "clamp(0.75rem, 1vw, 1rem)", height: "clamp(0.75rem, 1vw, 1rem)" }} />
                  {participantCount} players
                </span>
                <span className="opacity-40">|</span>
                <span>Round {currentRound} of {maxRound || "?"}</span>
              </div>
            </div>
          </div>

          {/* Right: Status, time, controls */}
          <div className="flex items-center gap-[clamp(0.75rem,1.5vw,1.5rem)]">
            {/* Live indicator */}
            {tournament.status === "in_progress" && inProgressMatches > 0 && (
              <div className="flex items-center gap-2">
                <div className="live-dot" />
                <span
                  className="font-semibold uppercase tracking-wider text-emerald-400"
                  style={{ fontSize: "clamp(0.6rem, 1vw, 0.875rem)" }}
                >
                  {inProgressMatches} Live
                </span>
              </div>
            )}

            {/* Reconnecting */}
            {reconnecting && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-3 py-1.5">
                <WifiOff className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">Reconnecting...</span>
              </div>
            )}

            {/* Tournament progress */}
            <LiveProgressHeader
              completed={completedMatches}
              total={totalMatches}
              progress={tournamentProgress}
            />

            {/* Clock */}
            <div className="text-right">
              <p
                className="font-black tabular-nums text-white"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}
              >
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-[#3D5A3E]" style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)" }}>
                {currentTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
              </p>
            </div>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="rounded-lg border border-white/10 p-2 text-[#3D5A3E] hover:bg-white/5 hover:text-white transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize style={{ width: "clamp(1rem, 1.5vw, 1.5rem)", height: "clamp(1rem, 1.5vw, 1.5rem)" }} />
              ) : (
                <Maximize style={{ width: "clamp(1rem, 1.5vw, 1.5rem)", height: "clamp(1rem, 1.5vw, 1.5rem)" }} />
              )}
            </button>
          </div>
        </div>

        {/* Slide progress bar */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div
              className="h-full bg-emerald-500 transition-all duration-200 ease-linear"
              style={{ width: `${slideProgress * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden">
        <div
          key={currentSlideType}
          className="absolute inset-0 p-[clamp(1rem,2vw,2rem)] animate-in fade-in duration-500"
        >
          {renderSlide()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0A2E12]/90 backdrop-blur px-[clamp(1rem,2vw,2rem)] py-[clamp(0.4rem,0.8vh,0.75rem)]">
        <div className="flex items-center justify-between">
          <p className="text-[#3D5A3E]" style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.75rem)" }}>
            Live Tournament Dashboard
          </p>
          <div className="flex items-center gap-4">
            {activeSlides.length > 1 && (
              <div className="flex items-center gap-2">
                {activeSlides.map((type, i) => (
                  <button
                    key={type + "-" + i}
                    onClick={() => {
                      setCurrentSlideIndex(i);
                      progressRef.current = 0;
                      setSlideProgress(0);
                    }}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      i === currentSlideIndex % activeSlides.length
                        ? "h-2 w-8 bg-emerald-500"
                        : "h-2 w-2 bg-white/20 hover:bg-white/40"
                    )}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[#3D5A3E]" style={{ fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)" }}>
              {reconnecting ? (
                <WifiOff className="h-3 w-3 text-amber-400" />
              ) : (
                <Wifi className="h-3 w-3 text-emerald-500" />
              )}
              <span>Real-time</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
