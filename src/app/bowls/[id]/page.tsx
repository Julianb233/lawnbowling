"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import {
  BOWLS_POSITION_LABELS,
  BOWLS_FORMAT_LABELS,
  getPositionsForFormat,
} from "@/lib/types";
import type {
  Player,
  BowlsPosition,
  BowlsGameFormat,
  BowlsCheckin,
  BowlsTeamAssignment,
  GreenConditions,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { DrawSheet } from "@/components/draw/DrawSheet";
import { TournamentWizard } from "@/components/bowls/TournamentWizard";
import { GreenConditionsWidget } from "@/components/bowls/GreenConditionsWidget";
import { GreenConditionsForm } from "@/components/bowls/GreenConditionsForm";
import Link from "next/link";
import type { DrawStyle, MultiRoundDrawResult } from "@/lib/bowls-draw";
import { DRAW_STYLE_LABELS } from "@/lib/bowls-draw";

interface DrawResult {
  rinks: BowlsTeamAssignment[][];
  unassigned: BowlsCheckin[];
  rinkCount: number;
  format: BowlsGameFormat;
}

const POSITION_COLORS: Record<BowlsPosition, string> = {
  skip: "bg-[#1B5E20]",
  vice: "bg-purple-500",
  second: "bg-amber-500",
  lead: "bg-[#1B5E20]",
};

const POSITION_RING_COLORS: Record<BowlsPosition, string> = {
  skip: "ring-[#1B5E20]/40",
  vice: "ring-purple-500/40",
  second: "ring-amber-500/40",
  lead: "ring-[#1B5E20]/40",
};

export default function BowlsTournamentPage() {
  const params = useParams();
  const tournamentId = (params?.id ?? "") as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [checkins, setCheckins] = useState<BowlsCheckin[]>([]);
  const [format, setFormat] = useState<BowlsGameFormat>("fours");
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [multiRoundDraw, setMultiRoundDraw] = useState<MultiRoundDrawResult | null>(null);
  const [drawStyle, setDrawStyle] = useState<DrawStyle>("random");
  const [selectedRound, setSelectedRound] = useState(0);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingDraw, setGeneratingDraw] = useState(false);
  const [tournamentName, setTournamentName] = useState("Lawn Bowls");
  const [drawRound, setDrawRound] = useState(1);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [greenConditions, setGreenConditions] = useState<GreenConditions | null>(null);
  const [showConditionsForm, setShowConditionsForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load current user's player ID for draw highlighting + admin check
  useEffect(() => {
    async function loadCurrentUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: player } = await supabase
        .from("players")
        .select("id, role")
        .eq("user_id", user.id)
        .single();
      if (player) {
        setCurrentUserId(player.id);
        setIsAdmin(player.role === "admin");
      }
    }
    loadCurrentUser();
  }, []);

  const loadGreenConditions = useCallback(async () => {
    try {
      const res = await fetch(`/api/bowls/green-conditions?tournament_id=${tournamentId}`);
      if (res.ok) {
        const data = await res.json();
        setGreenConditions(data);
      }
    } catch {
      // Non-critical
    }
  }, [tournamentId]);

  const loadPlayers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("players")
      .select("*")
      .order("display_name");
    setPlayers((data as Player[]) ?? []);
    setLoading(false);
  }, []);

  const loadCheckins = useCallback(async () => {
    try {
      const res = await fetch(`/api/bowls/checkin?tournament_id=${tournamentId}`);
      if (res.ok) {
        const data = await res.json();
        setCheckins(data);
      }
    } catch {
      // Will retry on next poll
    }
  }, [tournamentId]);

  const loadTournament = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tournaments")
      .select("name, format, sport")
      .eq("id", tournamentId)
      .single();
    if (data) {
      setTournamentName(data.name);
      const bowlsFormats = ["fours", "triples", "pairs", "singles"];
      if (bowlsFormats.includes(data.format)) {
        setFormat(data.format as BowlsGameFormat);
      }
    }
  }, [tournamentId]);

  useEffect(() => {
    loadPlayers();
    loadCheckins();
    loadTournament();
    loadGreenConditions();

    // UCI-04: Realtime subscription for bowls_checkins — kiosk check-ins appear within 3 seconds
    const supabase = createClient();
    const channel = supabase
      .channel(`bowls_checkins_${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bowls_checkins",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          loadCheckins();
        }
      )
      .subscribe();

    // Realtime subscription for green conditions (REQ-15-12)
    const conditionsChannel = supabase
      .channel(`green_conditions_${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "green_conditions",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          loadGreenConditions();
        }
      )
      .subscribe();

    // Fallback polling in case realtime is not available
    const interval = setInterval(loadCheckins, 5000);
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      supabase.removeChannel(conditionsChannel);
    };
  }, [loadPlayers, loadCheckins, loadTournament, loadGreenConditions, tournamentId]);

  function handlePlayerTap(player: Player) {
    const existing = checkins.find((c) => c.player_id === player.id);
    if (existing) return;
    setSelectedPlayer(player);
  }

  async function handlePositionSelect(position: BowlsPosition) {
    if (!selectedPlayer) return;

    try {
      const res = await fetch("/api/bowls/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: selectedPlayer.id,
          tournament_id: tournamentId,
          preferred_position: position,
        }),
      });

      if (res.ok) {
        setJustCheckedIn(selectedPlayer.id);
        setSelectedPlayer(null);
        await loadCheckins();
        setTimeout(() => setJustCheckedIn(null), 2000);
      }
    } catch {
      // Handle error
    }
  }

  async function handleUndoCheckin(playerId: string) {
    try {
      await fetch("/api/bowls/checkin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: playerId,
          tournament_id: tournamentId,
        }),
      });
      await loadCheckins();
    } catch {
      // Handle error
    }
  }

  async function handleGenerateDraw(fmt?: BowlsGameFormat) {
    setGeneratingDraw(true);
    setDrawError(null);
    try {
      const res = await fetch("/api/bowls/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          format: fmt ?? format,
          draw_style: drawStyle,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "incompatible_player_count") {
          setDrawError(
            `${checkins.length} players not supported for ${DRAW_STYLE_LABELS[drawStyle]}. ` +
            `Supported counts: ${data.supported_counts?.join(", ") ?? "none"}`
          );
        } else {
          setDrawError(data.error || "Draw generation failed");
        }
        setGeneratingDraw(false);
        return;
      }

      if (drawStyle === "mead" || drawStyle === "gavel") {
        const multiResult = data as MultiRoundDrawResult;
        setMultiRoundDraw(multiResult);
        setSelectedRound(0);
        const firstRound = multiResult.rounds[0];
        setDrawResult({
          rinks: firstRound.rinks,
          unassigned: firstRound.unassigned,
          rinkCount: firstRound.rinks.length,
          format: fmt ?? format,
        });
      } else {
        setMultiRoundDraw(null);
        setDrawResult(data);
      }
    } catch {
      setDrawError("Draw generation failed");
    }
    setGeneratingDraw(false);
  }

  function handleRoundChange(roundIdx: number) {
    if (!multiRoundDraw) return;
    setSelectedRound(roundIdx);
    const round = multiRoundDraw.rounds[roundIdx];
    setDrawResult({
      rinks: round.rinks,
      unassigned: round.unassigned,
      rinkCount: round.rinks.length,
      format,
    });
  }

  const isCheckedIn = (playerId: string) =>
    checkins.some((c) => c.player_id === playerId);

  const getCheckin = (playerId: string) =>
    checkins.find((c) => c.player_id === playerId);

  const filteredPlayers = players.filter((p) =>
    p.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const positionsNeeded = getPositionsForFormat(format);
  const playersPerRink = BOWLS_FORMAT_LABELS[format].playersPerTeam * 2;
  const possibleRinks = Math.floor(checkins.length / playersPerRink);

  const positionCounts: Record<string, number> = {};
  for (const pos of positionsNeeded) {
    positionCounts[pos] = checkins.filter(
      (c) => c.preferred_position === pos
    ).length;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-card">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  // Render functions for the wizard's Advanced escape hatch (TWZ-15)
  function renderCheckinView() {
    return (
          <div data-onboarding-target="add-players">
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for your name..."
                className="w-full rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-4 text-lg text-zinc-900 dark:text-foreground placeholder:text-zinc-400 focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
              />
            </div>

            <p className="mb-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Tap your name, then choose your preferred position
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredPlayers.map((player) => {
                const checked = isCheckedIn(player.id);
                const checkin = getCheckin(player.id);
                const isJust = justCheckedIn === player.id;

                const initials = player.display_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <motion.button
                    key={player.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      checked
                        ? handleUndoCheckin(player.id)
                        : handlePlayerTap(player)
                    }
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-2xl p-4 transition-all min-h-[120px] touch-manipulation",
                      checked
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "bg-white dark:bg-card border border-zinc-200 dark:border-white/10 hover:border-zinc-300 hover:shadow-sm"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {isJust ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1B5E20]"
                        >
                          <span className="text-xl text-white">&#10003;</span>
                        </motion.div>
                      ) : checked && checkin ? (
                        <motion.div
                          key="position"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-full text-white text-xs font-bold ring-4",
                            POSITION_COLORS[checkin.preferred_position as BowlsPosition],
                            POSITION_RING_COLORS[checkin.preferred_position as BowlsPosition]
                          )}
                        >
                          {BOWLS_POSITION_LABELS[checkin.preferred_position as BowlsPosition]?.label}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="avatar"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1B5E20] to-[#1B5E20] text-sm font-bold text-white"
                        >
                          {initials}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <span
                      className={cn(
                        "text-sm font-medium truncate max-w-full",
                        checked ? "text-[#2E7D32]" : "text-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      {player.display_name}
                    </span>
                    {checked && (
                      <span className="text-[11px] text-zinc-400">
                        tap to undo
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
    );
  }

  function renderBoardView() {
    return (
          <div>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {positionsNeeded.map((pos) => (
                <div
                  key={pos}
                  className="rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-white/10 p-4 text-center"
                >
                  <div
                    className={cn(
                      "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold",
                      POSITION_COLORS[pos]
                    )}
                  >
                    {positionCounts[pos] ?? 0}
                  </div>
                  <p className="text-sm font-semibold text-zinc-700">
                    {BOWLS_POSITION_LABELS[pos].label}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {BOWLS_POSITION_LABELS[pos].description}
                  </p>
                </div>
              ))}
            </div>

            {/* Draw Style Selector */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Draw Style</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["random", "seeded", "mead", "gavel"] as DrawStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setDrawStyle(style)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left",
                      drawStyle === style
                        ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                        : "border-zinc-200 dark:border-white/10 bg-white dark:bg-card text-zinc-500 hover:border-zinc-400"
                    )}
                  >
                    {DRAW_STYLE_LABELS[style]}
                  </button>
                ))}
              </div>
              {drawStyle === "gavel" && format !== "fours" && (
                <p className="mt-2 text-xs text-amber-600">Gavel Draw is only available for Fours format.</p>
              )}
            </div>

            <div className="mb-6 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {checkins.length}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">players checked in</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#1B5E20]">
                    {possibleRinks}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    rinks possible ({BOWLS_FORMAT_LABELS[format].label})
                  </p>
                </div>
                <button
                  onClick={() => handleGenerateDraw()}
                  disabled={possibleRinks < 1 || generatingDraw}
                  data-onboarding-target="generate-draw"
                  className="rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#145218] disabled:opacity-40 min-h-[48px] touch-manipulation"
                >
                  {generatingDraw ? "Generating..." : "Generate Draw"}
                </button>
              </div>
              {drawError && (
                <p className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{drawError}</p>
              )}
            </div>

            <div className="space-y-2">
              {checkins.map((checkin) => {
                const player = checkin.player;
                const displayName = player?.display_name ?? "Unknown";
                const initials = displayName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <motion.div
                    key={checkin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 rounded-xl bg-white dark:bg-card border border-zinc-200 dark:border-white/10 px-4 py-3"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold",
                        POSITION_COLORS[checkin.preferred_position as BowlsPosition]
                      )}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-foreground truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {BOWLS_POSITION_LABELS[checkin.preferred_position as BowlsPosition]?.label}
                      </p>
                    </div>
                    {checkin.checkin_source && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        checkin.checkin_source === "kiosk"
                          ? "bg-blue-100 text-blue-700"
                          : checkin.checkin_source === "app"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-zinc-100 text-zinc-500 dark:text-zinc-400"
                      )}>
                        {checkin.checkin_source}
                      </span>
                    )}
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold text-white",
                        POSITION_COLORS[checkin.preferred_position as BowlsPosition]
                      )}
                    >
                      {BOWLS_POSITION_LABELS[checkin.preferred_position as BowlsPosition]?.label}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUndoCheckin(checkin.player_id);
                      }}
                      className="ml-1 rounded-lg border border-zinc-200 dark:border-white/10 px-2 py-1 text-xs font-medium text-zinc-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors min-h-[32px] touch-manipulation"
                      title="Remove player from check-in list"
                    >
                      Remove
                    </button>
                  </motion.div>
                );
              })}

              {checkins.length === 0 && (
                <div className="rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-white/10 p-12 text-center">
                  <p className="text-lg font-semibold text-zinc-400">
                    No players checked in yet
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Switch to the Check In tab to register players
                  </p>
                </div>
              )}
            </div>
          </div>
    );
  }

  function renderDrawView() {
    return (
      <div>
        {!drawResult ? (
              <div className="rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-white/10 p-12 text-center">
                <p className="text-lg font-semibold text-zinc-400">
                  No draw generated yet
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Check in players and generate a draw using the wizard above
                </p>
              </div>
            ) : (
              <div>
                {/* Draw style label */}
                {multiRoundDraw && (
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#1B5E20]/10 px-3 py-1">
                    <span className="text-xs font-bold text-[#1B5E20]">
                      {DRAW_STYLE_LABELS[multiRoundDraw.style as DrawStyle]}
                    </span>
                    <span className="text-xs text-[#1B5E20]/60">
                      {multiRoundDraw.totalRounds} rounds &middot; {multiRoundDraw.playerCount} players
                    </span>
                  </div>
                )}

                {/* Multi-round selector */}
                {multiRoundDraw && multiRoundDraw.totalRounds > 1 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {multiRoundDraw.rounds.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRoundChange(idx)}
                        className={cn(
                          "rounded-lg px-4 py-2 text-sm font-semibold transition-colors min-h-[40px] touch-manipulation",
                          selectedRound === idx
                            ? "bg-[#1B5E20] text-white"
                            : "bg-white dark:bg-card border border-zinc-200 dark:border-white/10 text-zinc-600 hover:border-zinc-400"
                        )}
                      >
                        Round {idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                      Tournament Draw &mdash; Round {multiRoundDraw ? selectedRound + 1 : drawRound}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {tournamentName} &middot; {BOWLS_FORMAT_LABELS[drawResult.format].label} &middot;{" "}
                      {drawResult.rinkCount} rink
                      {drawResult.rinkCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 no-print">
                    {!multiRoundDraw && (
                      <button
                        onClick={() => {
                          setDrawRound((prev) => prev + 1);
                          handleGenerateDraw();
                        }}
                        className="rounded-xl border border-[#1B5E20]/30 bg-[#1B5E20]/5 px-4 py-2 text-sm font-semibold text-[#1B5E20] hover:bg-[#1B5E20]/10 min-h-[44px] touch-manipulation"
                      >
                        Next Round Draw
                      </button>
                    )}
                    <button
                      onClick={() => handleGenerateDraw()}
                      className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:bg-background min-h-[44px] touch-manipulation"
                    >
                      Re-Draw
                    </button>
                  </div>
                </div>

                <DrawSheet
                  draw={drawResult}
                  currentUserId={currentUserId ?? undefined}
                  tournamentName={tournamentName}
                  roundNumber={multiRoundDraw ? selectedRound + 1 : drawRound}
                />
              </div>
            )}
          </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-background pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#1a3d28]/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/bowls" className="text-sm text-zinc-400 hover:text-zinc-600 mb-1 block">
                &larr; Tournaments
              </Link>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {tournamentName}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {checkins.length} players checked in
              </p>
            </div>

            <div className="flex items-center gap-2" data-onboarding-target="publish-scores">
              <Link
                href={`/bowls/${tournamentId}/scores`}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[#1B5E20] hover:bg-[#1B5E20]/5 transition-colors"
              >
                Scores
              </Link>
              <Link
                href={`/bowls/${tournamentId}/results`}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-colors"
              >
                Results
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Green Conditions Widget (REQ-15-06) */}
        <div className="mb-4">
          <GreenConditionsWidget
            conditions={greenConditions}
            onEdit={isAdmin ? () => setShowConditionsForm(true) : undefined}
          />
        </div>

        {/* Green Conditions Form Modal */}
        <AnimatePresence>
          {showConditionsForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mx-4 w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-2xl"
              >
                <GreenConditionsForm
                  tournamentId={tournamentId}
                  existing={greenConditions}
                  onSaved={(saved) => {
                    setGreenConditions(saved);
                    setShowConditionsForm(false);
                  }}
                  onCancel={() => setShowConditionsForm(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <TournamentWizard
          tournamentId={tournamentId}
          tournamentName={tournamentName}
          format={format}
          checkins={checkins}
          drawResult={drawResult}
          onGenerateDraw={handleGenerateDraw}
          onFormatChange={setFormat}
          renderCheckinView={renderCheckinView}
          renderBoardView={renderBoardView}
          renderDrawView={renderDrawView}
        />
      </main>

      {/* Position Selection Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mx-4 w-full max-w-md rounded-3xl bg-white dark:bg-[#1a3d28] p-6 shadow-2xl"
            >
              <h3 className="mb-1 text-xl font-black text-zinc-900 dark:text-zinc-100">
                {selectedPlayer.display_name}
              </h3>
              <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                Choose your preferred position for{" "}
                {BOWLS_FORMAT_LABELS[format].label}
              </p>

              <div className="space-y-3">
                {positionsNeeded.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => handlePositionSelect(pos)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 dark:border-white/10 p-4 text-left transition-all hover:border-[#1B5E20]/30 hover:bg-[#1B5E20]/5 active:scale-[0.98] min-h-[72px] touch-manipulation"
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold",
                        POSITION_COLORS[pos]
                      )}
                    >
                      {BOWLS_POSITION_LABELS[pos].order}
                    </div>
                    <div>
                      <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {BOWLS_POSITION_LABELS[pos].label}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {BOWLS_POSITION_LABELS[pos].description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedPlayer(null)}
                className="mt-4 w-full rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-background py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 min-h-[48px] touch-manipulation"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
