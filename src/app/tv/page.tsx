"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { TournamentScore, PennantTeam, PennantFixture, PennantFixtureResult, PennantDivision, PennantSeason, GreenConditions } from "@/lib/types";
import { GreenConditionsWidget } from "@/components/bowls/GreenConditionsWidget";
import { DashboardHeader } from "@/components/tv/DashboardHeader";
import LiveScoresSlide from "@/components/tv/LiveScoresSlide";
import StandingsSlide from "@/components/tv/StandingsSlide";
import NextDrawSlide from "@/components/tv/NextDrawSlide";
import WeatherAnnouncementsSlide, {
  type Announcement,
} from "@/components/tv/WeatherAnnouncementsSlide";
import PennantLadderSlide from "@/components/tv/PennantLadderSlide";
import { calculateDivisionStandings } from "@/lib/pennant-engine";
import type { PennantStanding } from "@/lib/pennant-engine";

// --- Types ---

type SlideType = "scores" | "standings" | "draw" | "weather" | "pennant";

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

const DEFAULT_INTERVAL_SECONDS = 12;
const RINKS_PER_PAGE = 6;
const VALID_SLIDE_TYPES: SlideType[] = ["scores", "standings", "draw", "weather", "pennant"];

// --- Page wrapper with Suspense for useSearchParams ---

export default function TVScoreboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0A2E12]">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <TVDashboard />
    </Suspense>
  );
}

function TVDashboard() {
  const searchParams = useSearchParams();

  // REQ-LD-17: ?slide= locks to a single slide type
  const slideParam = searchParams.get("slide") as SlideType | null;
  // REQ-LD-18: ?preview= shows a single slide without rotation
  const previewParam = searchParams.get("preview") as SlideType | null;
  // REQ-LD-02: ?interval= configurable auto-advance interval
  const intervalParam = searchParams.get("interval");
  const intervalSeconds = intervalParam
    ? Math.max(5, parseInt(intervalParam, 10) || DEFAULT_INTERVAL_SECONDS)
    : DEFAULT_INTERVAL_SECONDS;

  // --- Data state ---
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [scores, setScores] = useState<TournamentScore[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [drawAnnouncement, setDrawAnnouncement] =
    useState<DrawAnnouncement | null>(null);

  // --- Green conditions state (REQ-15-07) ---
  const [greenConditions, setGreenConditions] = useState<GreenConditions | null>(null);

  // --- Pennant state (REQ-14-14) ---
  const [pennantStandings, setPennantStandings] = useState<PennantStanding[]>([]);
  const [pennantDivisionName, setPennantDivisionName] = useState<string | undefined>();
  const [pennantSeasonName, setPennantSeasonName] = useState<string | undefined>();

  // --- Carousel state ---
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [scorePageIndex, setScorePageIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // --- Fullscreen ---
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ========== Data Loading ==========

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

  const loadScores = useCallback(async () => {
    if (!tournament) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("tournament_scores")
      .select("*")
      .eq("tournament_id", tournament.id)
      .order("round", { ascending: true })
      .order("rink", { ascending: true });

    if (data) {
      setScores(data as TournamentScore[]);
    }
  }, [tournament]);

  const loadAnnouncements = useCallback(async () => {
    if (!tournament) return;
    try {
      const res = await fetch(
        "/api/tv/announcements?tournament_id=" + tournament.id
      );
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch {
      // Will retry on next poll
    }
  }, [tournament]);

  // REQ-14-14: Load pennant data when tournament is linked to a fixture
  const loadPennantData = useCallback(async () => {
    if (!tournament) return;
    const supabase = createClient();

    // Check if this tournament is linked to a pennant fixture
    const { data: fixture } = await supabase
      .from("pennant_fixtures")
      .select("id, season_id, division_id")
      .eq("tournament_id", tournament.id)
      .single();

    if (!fixture) {
      setPennantStandings([]);
      return;
    }

    // Load division info, season info, teams, all fixtures & results for this division
    const [divRes, seasonRes, teamsRes, fixturesRes, resultsRes] = await Promise.all([
      supabase.from("pennant_divisions").select("*").eq("id", fixture.division_id).single(),
      supabase.from("pennant_seasons").select("*").eq("id", fixture.season_id).single(),
      supabase.from("pennant_teams").select("*").eq("division_id", fixture.division_id),
      supabase.from("pennant_fixtures").select("*").eq("division_id", fixture.division_id),
      supabase.from("pennant_fixture_results").select("*"),
    ]);

    if (divRes.data) setPennantDivisionName((divRes.data as PennantDivision).name);
    if (seasonRes.data) setPennantSeasonName((seasonRes.data as PennantSeason).name);

    const teams = (teamsRes.data as PennantTeam[]) ?? [];
    const fixtures = (fixturesRes.data as PennantFixture[]) ?? [];
    const results = (resultsRes.data as PennantFixtureResult[]) ?? [];

    // Filter results to only those for this division's fixtures
    const fixtureIds = new Set(fixtures.map((f) => f.id));
    const divResults = results.filter((r) => fixtureIds.has(r.fixture_id));

    const standings = calculateDivisionStandings(teams, fixtures, divResults);
    setPennantStandings(standings);
  }, [tournament]);

  // REQ-15-07: Load green conditions for TV display
  const loadConditions = useCallback(async () => {
    if (!tournament) return;
    try {
      const res = await fetch("/api/bowls/green-conditions?tournament_id=" + tournament.id);
      if (res.ok) {
        const data = await res.json();
        setGreenConditions(data);
      }
    } catch {
      // Will retry on next poll
    }
  }, [tournament]);

  // Initial data load
  useEffect(() => {
    loadTournament();
  }, [loadTournament]);

  useEffect(() => {
    if (tournament) {
      loadScores();
      loadAnnouncements();
      loadPennantData();
      loadConditions();
    }
  }, [tournament, loadScores, loadAnnouncements, loadPennantData, loadConditions]);

  // ========== Supabase Realtime (REQ-LD-04, REQ-LD-09, REQ-LD-15) ==========

  useEffect(() => {
    if (!tournament) return;

    const supabase = createClient();

    // REQ-LD-04: Live score updates with reconnection handling (REQ-LD-15)
    const scoresChannel = supabase
      .channel("tv-scores-" + tournament.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournament_scores",
          filter: "tournament_id=eq." + tournament.id,
        },
        (payload) => {
          loadScores();

          // Draw announcement overlay when new round scores appear
          if (payload.eventType === "INSERT") {
            const newScore = payload.new as TournamentScore;
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
                return { round, rinks: [rinkData], timestamp: Date.now() };
              });
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setReconnecting(false);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setReconnecting(true);
        }
      });

    // REQ-LD-09: Realtime announcements
    const announcementsChannel = supabase
      .channel("tv-announcements-" + tournament.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tv_announcements",
        },
        () => {
          loadAnnouncements();
        }
      )
      .subscribe();

    // REQ-14-14: Realtime pennant results updates
    const pennantChannel = supabase
      .channel("tv-pennant-results")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pennant_fixture_results",
        },
        () => {
          loadPennantData();
        }
      )
      .subscribe();

    // REQ-15-12: Realtime green conditions updates
    const conditionsChannel = supabase
      .channel("tv-conditions-" + tournament.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "green_conditions",
          filter: "tournament_id=eq." + tournament.id,
        },
        () => {
          loadConditions();
        }
      )
      .subscribe();

    // Fallback polling
    const pollInterval = setInterval(() => {
      loadScores();
      loadAnnouncements();
      loadConditions();
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(scoresChannel);
      supabase.removeChannel(announcementsChannel);
      supabase.removeChannel(pennantChannel);
      supabase.removeChannel(conditionsChannel);
    };
  }, [tournament, loadScores, loadAnnouncements, loadPennantData, loadConditions]);

  // Auto-dismiss draw announcement after 30 seconds
  useEffect(() => {
    if (!drawAnnouncement) return;
    const timer = setTimeout(() => setDrawAnnouncement(null), 30000);
    return () => clearTimeout(timer);
  }, [drawAnnouncement]);

  // ========== Page Visibility (REQ-LD-16) ==========

  useEffect(() => {
    function handleVisibility() {
      setIsVisible(!document.hidden);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ========== Build slide list ==========

  const maxRound =
    scores.length > 0 ? Math.max(...scores.map((s) => s.round)) : 1;
  const currentRound = maxRound;
  const roundScores = scores.filter((s) => s.round === currentRound);
  const totalScorePages = Math.max(
    1,
    Math.ceil(roundScores.length / RINKS_PER_PAGE)
  );

  // REQ-LD-07: Only include draw slide if next draw data exists
  const hasNextDraw = scores.some(
    (s) =>
      s.round === maxRound &&
      !s.is_finalized &&
      s.team_a_players?.length > 0
  );

  // REQ-14-14: Include pennant slide when tournament is linked to a pennant fixture
  const hasPennant = pennantStandings.length > 0;

  // REQ-LD-01, REQ-LD-05: Build the slide sequence with score sub-pages
  const allSlideTypes: SlideType[] = [];
  for (let i = 0; i < totalScorePages; i++) {
    allSlideTypes.push("scores");
  }
  allSlideTypes.push("standings");
  if (hasPennant) {
    allSlideTypes.push("pennant");
  }
  if (hasNextDraw) {
    allSlideTypes.push("draw");
  }
  allSlideTypes.push("weather");

  // REQ-LD-17: Lock to single slide type
  const activeSlides: SlideType[] =
    slideParam && VALID_SLIDE_TYPES.includes(slideParam)
      ? [slideParam]
      : allSlideTypes;

  // REQ-LD-18: Preview mode
  const previewSlide =
    previewParam && VALID_SLIDE_TYPES.includes(previewParam)
      ? previewParam
      : null;

  // ========== Carousel Timer (REQ-LD-02, REQ-LD-03, REQ-LD-16) ==========

  const progressRef = useRef(0);

  const advanceSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      const next = (prev + 1) % activeSlides.length;
      let scorePagesEncountered = 0;
      for (let i = 0; i <= next; i++) {
        if (activeSlides[i] === "scores") scorePagesEncountered++;
      }
      if (activeSlides[next] === "scores") {
        setScorePageIndex(scorePagesEncountered - 1);
      }
      return next;
    });
    progressRef.current = 0;
    setSlideProgress(0);
  }, [activeSlides]);

  useEffect(() => {
    if (previewSlide || !isVisible) {
      return;
    }

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
  }, [intervalSeconds, isVisible, previewSlide, advanceSlide]);

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

  // ========== Render ==========

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A2E12]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const currentSlideType =
    previewSlide ??
    activeSlides[currentSlideIndex % activeSlides.length] ??
    "scores";

  function renderSlide() {
    switch (currentSlideType) {
      case "scores":
        return (
          <LiveScoresSlide
            scores={scores}
            currentRound={currentRound}
            pageIndex={scorePageIndex}
            rinksPerPage={RINKS_PER_PAGE}
          />
        );
      case "standings":
        return (
          <StandingsSlide
            scores={scores}
            tournamentName={tournament?.name ?? "Tournament"}
          />
        );
      case "draw":
        return <NextDrawSlide scores={scores} maxRound={maxRound} />;
      case "weather":
        return <WeatherAnnouncementsSlide announcements={announcements} />;
      case "pennant":
        return (
          <PennantLadderSlide
            standings={pennantStandings}
            divisionName={pennantDivisionName}
            seasonName={pennantSeasonName}
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
      {/* REQ-LD-12: Persistent header */}
      <DashboardHeader
        tournamentName={tournament?.name ?? "Lawn Bowls"}
        status={tournament?.status ?? ""}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        slideProgress={previewSlide ? 0 : slideProgress}
        reconnecting={reconnecting}
      />

      {/* REQ-15-07: Green conditions on TV display */}
      {tournament && (
        <div className="px-6 py-2 border-b border-white/10 bg-[#0A2E12]/50">
          <GreenConditionsWidget conditions={greenConditions} variant="tv" />
        </div>
      )}

      {/* Draw Announcement Overlay */}
      {drawAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="mx-8 w-full max-w-5xl animate-in fade-in zoom-in duration-500">
            <div className="rounded-3xl border border-emerald-500/30 bg-[#0A2E12] p-8 shadow-2xl shadow-emerald-500/10">
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
                      className="rounded-2xl border border-white/10 bg-[#0A2E12]/50 p-5"
                    >
                      <p className="mb-3 text-center text-sm font-bold uppercase tracking-wider text-[#3D5A3E]">
                        Rink {rink.rink}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                            Team A
                          </p>
                          {rink.team_a_players.map((p) => (
                            <p key={p.player_id} className="text-sm font-medium text-white">
                              {p.display_name}
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                            Team B
                          </p>
                          {rink.team_b_players.map((p) => (
                            <p key={p.player_id} className="text-sm font-medium text-white">
                              {p.display_name}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <p className="mt-6 text-center text-sm text-[#3D5A3E]">
                This announcement will dismiss automatically
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REQ-LD-03: Slide content with crossfade animation */}
      <main className="flex-1 relative overflow-hidden">
        {!tournament ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#0A2E12]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#3D5A3E]"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h2
                className="font-black text-[#3D5A3E]"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
              >
                No Active Tournament
              </h2>
              <p
                className="mt-2 text-[#3D5A3E]"
                style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
              >
                Waiting for a tournament to begin...
              </p>
            </div>
          </div>
        ) : (
          <div
            key={currentSlideType + "-" + scorePageIndex}
            className="absolute inset-0 p-[clamp(1rem,2vw,2rem)] animate-in fade-in duration-500"
          >
            {renderSlide()}
          </div>
        )}
      </main>

      {/* REQ-LD-14: Footer - no site navigation */}
      <footer className="border-t border-white/5 bg-[#0A2E12]/90 backdrop-blur px-8 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#3D5A3E]">Powered by Lawnbowling App</p>
          <div className="flex items-center gap-4">
            {activeSlides.length > 1 && !previewSlide && (
              <div className="flex items-center gap-1.5">
                {activeSlides.map((type, i) => (
                  <div
                    key={type + "-" + i}
                    className={"h-1.5 rounded-full transition-all duration-300 " +
                      (i === currentSlideIndex % activeSlides.length
                        ? "w-6 bg-emerald-500"
                        : "w-1.5 bg-[#0A2E12]")
                    }
                  />
                ))}
              </div>
            )}
            <p className="text-xs text-[#3D5A3E]">
              Auto-refreshing · TV Display Mode
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
