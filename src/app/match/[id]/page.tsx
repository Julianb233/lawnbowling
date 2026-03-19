"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { ScoreEntry } from "@/components/match/ScoreEntry";
import { ScoreCard } from "@/components/match/ScoreCard";
import { MatchStatusBadge } from "@/components/match/MatchStatus";
import {
  ArrowLeft,
  Plus,
  Clock,
  CheckCircle2,
  RotateCcw,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import type { MatchStatus } from "@/lib/types";

// ---- Types ----

interface MatchPlayerInfo {
  player_id: string;
  team: 1 | 2 | null;
  player: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

interface EndScore {
  endNumber: number;
  team1Shots: number;
  team2Shots: number;
}

interface MatchData {
  id: string;
  sport: string;
  status: MatchStatus;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  court_id: string | null;
  venue_id: string | null;
  courts?: { name: string } | null;
}

// ---- Helpers ----

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayerAvatar({
  player,
  size = "lg",
}: {
  player: { display_name: string; avatar_url: string | null };
  size?: "sm" | "lg";
}) {
  const initials = player.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const dim = size === "lg" ? "h-16 w-16" : "h-10 w-10";
  const textSize = size === "lg" ? "text-xl" : "text-sm";

  return player.avatar_url ? (
    <img
      src={player.avatar_url}
      alt={player.display_name}
      className={`${dim} rounded-full object-cover ring-2 ring-white shadow-md`}
    />
  ) : (
    <div
      className={`${dim} flex items-center justify-center rounded-full ${textSize} font-bold text-white shadow-md ring-2 ring-white`}
      style={{
        background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
      }}
    >
      {initials}
    </div>
  );
}

// ---- Main Page ----

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = (params?.id ?? "") as string;
  const supabase = createClient();

  const [match, setMatch] = useState<MatchData | null>(null);
  const [players, setPlayers] = useState<MatchPlayerInfo[]>([]);
  const [ends, setEnds] = useState<EndScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScoreEntry, setShowScoreEntry] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Group players by team
  const team1Players = useMemo(
    () => players.filter((p) => p.team === 1),
    [players]
  );
  const team2Players = useMemo(
    () => players.filter((p) => p.team === 2),
    [players]
  );

  // Team names: use first player's name or "Team 1/2"
  const team1Name = useMemo(
    () =>
      team1Players.length === 1
        ? team1Players[0].player.display_name.split(" ")[0]
        : team1Players.length > 0
          ? team1Players.map((p) => p.player.display_name.split(" ")[0]).join(" & ")
          : "Team 1",
    [team1Players]
  );
  const team2Name = useMemo(
    () =>
      team2Players.length === 1
        ? team2Players[0].player.display_name.split(" ")[0]
        : team2Players.length > 0
          ? team2Players.map((p) => p.player.display_name.split(" ")[0]).join(" & ")
          : "Team 2",
    [team2Players]
  );

  // Scores
  const team1Total = useMemo(
    () => ends.reduce((sum, e) => sum + e.team1Shots, 0),
    [ends]
  );
  const team2Total = useMemo(
    () => ends.reduce((sum, e) => sum + e.team2Shots, 0),
    [ends]
  );

  // Winner name for display
  const winnerName = useMemo(() => {
    if (match?.status !== "completed") return null;
    if (team1Total > team2Total) return team1Name;
    if (team2Total > team1Total) return team2Name;
    return "Draw";
  }, [match?.status, team1Total, team2Total, team1Name, team2Name]);

  // Load match data
  const loadMatch = useCallback(async () => {
    try {
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select(
          "*, courts(name), match_players(player_id, team, player:players(id, display_name, avatar_url))"
        )
        .eq("id", matchId)
        .single();

      if (matchError || !matchData) {
        setLoading(false);
        return;
      }

      setMatch({
        id: matchData.id,
        sport: matchData.sport,
        status: matchData.status,
        started_at: matchData.started_at,
        ended_at: matchData.ended_at,
        created_at: matchData.created_at,
        court_id: matchData.court_id,
        venue_id: matchData.venue_id,
        courts: matchData.courts as { name: string } | null,
      });

      setPlayers(
        (matchData.match_players as unknown as MatchPlayerInfo[]) || []
      );

      // Load stored end-by-end data from localStorage
      // (the match_results table stores aggregate scores only)
      try {
        const stored = localStorage.getItem(`match-ends-${matchId}`);
        if (stored) {
          const parsed = JSON.parse(stored) as EndScore[];
          if (Array.isArray(parsed)) {
            setEnds(parsed);
          }
        }
      } catch {
        // ignore parse errors
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [matchId, supabase]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  // Timer
  useEffect(() => {
    if (!match?.started_at || match.status !== "playing") return;
    const startTime = new Date(match.started_at).getTime();

    function tick() {
      const now = Date.now();
      setElapsed(Math.floor((now - startTime) / 1000));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [match?.started_at, match?.status]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        () => loadMatch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_results", filter: `match_id=eq.${matchId}` },
        () => loadMatch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, supabase, loadMatch]);

  // Handle adding an end
  async function handleAddEnd(team: 1 | 2, shots: number) {
    const newEnd: EndScore = {
      endNumber: ends.length + 1,
      team1Shots: team === 1 ? shots : 0,
      team2Shots: team === 2 ? shots : 0,
    };
    const updatedEnds = [...ends, newEnd];
    setEnds(updatedEnds);

    // Persist ends to localStorage
    try {
      localStorage.setItem(`match-ends-${matchId}`, JSON.stringify(updatedEnds));
    } catch {
      // storage full or unavailable
    }

    // Calculate totals
    const t1Total = updatedEnds.reduce((s, e) => s + e.team1Shots, 0);
    const t2Total = updatedEnds.reduce((s, e) => s + e.team2Shots, 0);

    // If match not started yet, start it
    if (match?.status === "queued") {
      await supabase
        .from("matches")
        .update({ status: "playing", started_at: new Date().toISOString() })
        .eq("id", matchId);
    }

    // Upsert match_results with aggregate scores
    const { data: existing } = await supabase
      .from("match_results")
      .select("id")
      .eq("match_id", matchId)
      .single();

    if (existing) {
      await supabase
        .from("match_results")
        .update({ team1_score: t1Total, team2_score: t2Total })
        .eq("id", existing.id);
    } else {
      await supabase.from("match_results").insert({
        match_id: matchId,
        team1_score: t1Total,
        team2_score: t2Total,
      });
    }

    // Reload
    loadMatch();
  }

  // Handle completing the match
  async function handleCompleteMatch() {
    setCompleting(true);
    const t1 = ends.reduce((s, e) => s + e.team1Shots, 0);
    const t2 = ends.reduce((s, e) => s + e.team2Shots, 0);
    const winner: 1 | 2 | null = t1 > t2 ? 1 : t2 > t1 ? 2 : null;

    // Update match status
    await supabase
      .from("matches")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", matchId);

    // Update result with final scores
    const { data: existing } = await supabase
      .from("match_results")
      .select("id")
      .eq("match_id", matchId)
      .single();

    if (existing) {
      await supabase
        .from("match_results")
        .update({ team1_score: t1, team2_score: t2, winner_team: winner })
        .eq("id", existing.id);
    } else {
      await supabase.from("match_results").insert({
        match_id: matchId,
        team1_score: t1,
        team2_score: t2,
        winner_team: winner,
      });
    }

    setCompleting(false);
    setShowCompleteConfirm(false);
    loadMatch();
  }

  // Undo last end
  function handleUndoLastEnd() {
    if (ends.length === 0) return;
    const updated = ends.slice(0, -1);
    setEnds(updated);

    // Persist to localStorage
    try {
      localStorage.setItem(`match-ends-${matchId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Update DB aggregate scores
    const t1 = updated.reduce((s, e) => s + e.team1Shots, 0);
    const t2 = updated.reduce((s, e) => s + e.team2Shots, 0);

    supabase
      .from("match_results")
      .update({ team1_score: t1, team2_score: t2 })
      .eq("match_id", matchId)
      .then();
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FEFCF9]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#0A2E12]/10 border-t-[#1B5E20]" />
          <p className="text-[#3D5A3E]">Loading match...</p>
        </div>
      </div>
    );
  }

  // Match not found
  if (!match) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 bg-[#FEFCF9]">
        <p
          className="text-lg font-bold text-[#0A2E12]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Match not found
        </p>
        <Link
          href="/board"
          className="rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218] min-h-[44px]"
        >
          Back to Board
        </Link>
      </div>
    );
  }

  const isCompleted = match.status === "completed";

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[#0A2E12]/5 min-h-[44px] min-w-[44px]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-[#0A2E12]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-lg font-bold text-[#0A2E12]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Live Match
                </h1>
                {match.status === "playing" && (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
              {match.courts && (
                <p className="flex items-center gap-1 text-xs text-[#3D5A3E]">
                  <span className="font-bold tabular-nums" style={{ color: "#B8860B" }}>Rink</span>{" "}
                  {match.courts.name}
                </p>
              )}
            </div>
          </div>

          {/* Timer */}
          {match.status === "playing" && (
            <div className="flex items-center gap-1.5 rounded-full bg-[#1B5E20]/10 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-[#1B5E20]" />
              <span className="text-sm font-semibold tabular-nums text-[#1B5E20]">
                {formatDuration(elapsed)}
              </span>
            </div>
          )}

          {match.status === "completed" && match.started_at && match.ended_at && (
            <div className="flex items-center gap-1.5 rounded-full bg-[#0A2E12]/5 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-[#3D5A3E]" />
              <span className="text-sm font-medium tabular-nums text-[#3D5A3E]">
                {formatDuration(
                  Math.floor(
                    (new Date(match.ended_at).getTime() -
                      new Date(match.started_at).getTime()) /
                      1000
                  )
                )}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Match Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <MatchStatusBadge status={match.status} winnerName={winnerName} />
          {/* Format label */}
          <span className="mt-2 inline-block rounded-full bg-[#0A2E12]/5 px-2.5 py-1 text-xs font-bold text-[#3D5A3E]">
            {match.sport === "lawn_bowling" ? "Lawn Bowls" : match.sport}
          </span>
        </motion.div>

        {/* Scoreboard */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 rounded-2xl bg-white border border-[#0A2E12]/10 p-5 sm:p-6"
        >
          <div className="flex items-center justify-between">
            {/* Team 1 */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1.5">
                {team1Players.map((p) => (
                  <PlayerAvatar
                    key={p.player_id}
                    player={p.player}
                    size={team1Players.length > 1 ? "sm" : "lg"}
                  />
                ))}
              </div>
              <p className="text-sm font-semibold text-center max-w-[100px] truncate text-[#0A2E12]">
                {team1Name}
              </p>
            </div>

            {/* Score */}
            <div className="flex items-center gap-4 px-4">
              <motion.span
                key={`t1-${team1Total}`}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-bold tabular-nums text-[#0A2E12]"
                style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
              >
                {team1Total}
              </motion.span>

              <span className="text-lg font-semibold text-[#3D5A3E]/50">
                -
              </span>

              <motion.span
                key={`t2-${team2Total}`}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-bold tabular-nums text-[#0A2E12]"
                style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
              >
                {team2Total}
              </motion.span>
            </div>

            {/* Team 2 */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1.5">
                {team2Players.map((p) => (
                  <PlayerAvatar
                    key={p.player_id}
                    player={p.player}
                    size={team2Players.length > 1 ? "sm" : "lg"}
                  />
                ))}
              </div>
              <p className="text-sm font-semibold text-center max-w-[100px] truncate text-[#0A2E12]">
                {team2Name}
              </p>
            </div>
          </div>

          {/* End indicator */}
          <div className="mt-4 text-center text-xs font-medium text-[#3D5A3E]">
            {isCompleted
              ? `Final - ${ends.length} ends`
              : ends.length > 0
                ? `After ${ends.length} end${ends.length !== 1 ? "s" : ""}`
                : "Match ready"}
          </div>
        </motion.div>

        {/* End-by-end strip */}
        {ends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3
                className="text-sm font-bold uppercase tracking-wider text-[#0A2E12]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ends
              </h3>
              {!isCompleted && ends.length > 0 && (
                <button
                  onClick={handleUndoLastEnd}
                  className="flex items-center gap-1 text-xs font-medium text-[#3D5A3E] transition hover:opacity-70 min-h-[44px] px-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Undo last
                </button>
              )}
            </div>

            {/* Horizontal scrollable end strip */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {ends.map((end) => {
                const t1Won = end.team1Shots > 0;
                return (
                  <motion.div
                    key={end.endNumber}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-shrink-0 rounded-xl bg-white border border-[#0A2E12]/10 p-3 text-center"
                    style={{ minWidth: "72px" }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-[#3D5A3E]">
                      End {end.endNumber}
                    </p>
                    <p
                      className="text-sm font-bold tabular-nums"
                      style={{ color: t1Won ? "#1B5E20" : "#B8860B" }}
                    >
                      {t1Won
                        ? `${team1Name} +${end.team1Shots}`
                        : `${team2Name} +${end.team2Shots}`}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Scorecard */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <ScoreCard
            team1Name={team1Name}
            team2Name={team2Name}
            ends={ends}
            currentEnd={ends.length > 0 ? ends[ends.length - 1].endNumber : undefined}
          />
        </motion.div>

        {/* Action Buttons */}
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-3"
          >
            {/* Add End - large kiosk-friendly button */}
            <button
              onClick={() => setShowScoreEntry(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] py-4 text-lg font-bold text-white shadow-md transition hover:bg-[#145218] active:scale-[0.98]"
              style={{ minHeight: "56px" }}
            >
              <Plus className="h-5 w-5" />
              Add End {ends.length + 1}
            </button>

            {/* Complete Match */}
            {ends.length > 0 && (
              <>
                {!showCompleteConfirm ? (
                  <button
                    onClick={() => setShowCompleteConfirm(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0A2E12]/10 bg-white py-3.5 text-base font-semibold text-[#0A2E12] transition hover:bg-[#0A2E12]/5"
                    style={{ minHeight: "56px" }}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Complete Match
                  </button>
                ) : (
                  <div className="rounded-2xl bg-white border border-[#1B5E20]/20 p-5 sm:p-6">
                    <p className="mb-3 text-center text-sm font-semibold text-[#0A2E12]">
                      Finalize match?{" "}
                      {team1Total > team2Total
                        ? `${team1Name} wins ${team1Total}-${team2Total}`
                        : team2Total > team1Total
                          ? `${team2Name} wins ${team2Total}-${team1Total}`
                          : `Draw ${team1Total}-${team2Total}`}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowCompleteConfirm(false)}
                        className="flex-1 rounded-xl border border-[#0A2E12]/10 bg-white py-3 text-sm font-semibold text-[#3D5A3E] transition hover:bg-[#0A2E12]/5 min-h-[44px]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCompleteMatch}
                        disabled={completing}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B5E20] py-3 text-sm font-bold text-white transition hover:bg-[#145218] disabled:opacity-50 min-h-[44px]"
                      >
                        {completing ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Trophy className="h-4 w-4" />
                        )}
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Completed - back to board */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-center"
          >
            <Link
              href="/board"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-8 py-4 text-base font-bold text-white transition hover:bg-[#145218] min-h-[56px]"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Board
            </Link>
          </motion.div>
        )}
      </main>

      {/* Score Entry Modal */}
      <ScoreEntry
        open={showScoreEntry}
        onClose={() => setShowScoreEntry(false)}
        onSubmit={handleAddEnd}
        team1Name={team1Name}
        team2Name={team2Name}
        endNumber={ends.length + 1}
      />

      <BottomNav />
    </div>
  );
}
