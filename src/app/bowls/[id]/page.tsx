"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
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
import type { DrawStyle } from "@/lib/bowls-draw";
import { DRAW_STYLE_LABELS, validateDrawCompatibility } from "@/lib/bowls-draw";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GreenConditionsWidget } from "@/components/bowls/GreenConditionsWidget";
import { GreenConditionsForm } from "@/components/bowls/GreenConditionsForm";
import { GuestPlayerBadge } from "@/components/bowls/GuestPlayerBadge";
import Link from "next/link";

type PageView = "checkin" | "board" | "draw";

interface DrawResult {
  rinks: BowlsTeamAssignment[][];
  unassigned: BowlsCheckin[];
  rinkCount: number;
  format: BowlsGameFormat;
}

const POSITION_COLORS: Record<BowlsPosition, string> = {
  skip: "bg-blue-500",
  vice: "bg-purple-500",
  second: "bg-amber-500",
  lead: "bg-emerald-500",
};

const POSITION_RING_COLORS: Record<BowlsPosition, string> = {
  skip: "ring-blue-500/40",
  vice: "ring-purple-500/40",
  second: "ring-amber-500/40",
  lead: "ring-emerald-500/40",
};

export default function BowlsTournamentPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [view, setView] = useState<PageView>("checkin");
  const [players, setPlayers] = useState<Player[]>([]);
  const [checkins, setCheckins] = useState<BowlsCheckin[]>([]);
  const [format, setFormat] = useState<BowlsGameFormat>("fours");
  const [roundDraws, setRoundDraws] = useState<Record<number, DrawResult>>({});
  const [activeRound, setActiveRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingDraw, setGeneratingDraw] = useState(false);
  const [drawStyle, setDrawStyle] = useState<DrawStyle>("random");
  const [tournamentName, setTournamentName] = useState("Lawn Bowls");
  const [showInsuranceOffer, setShowInsuranceOffer] = useState(false);
  const [insuranceOfferPlayer, setInsuranceOfferPlayer] = useState<string | null>(null);
  const [playerTopRatings, setPlayerTopRatings] = useState<Map<string, { position: string; elo: number }>>(new Map());
  const [greenConditions, setGreenConditions] = useState<GreenConditions | null>(null);
  const [showConditionsForm, setShowConditionsForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tournamentDate] = useState(() =>
    new Date().toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );

  const drawResult = roundDraws[activeRound] ?? null;
  const totalRounds = Object.keys(roundDraws).length;
  const roundNumbers = Object.keys(roundDraws)
    .map(Number)
    .sort((a, b) => a - b);

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

  const loadConditions = useCallback(async () => {
    try {
      const res = await fetch(`/api/bowls/green-conditions?tournament_id=${tournamentId}`);
      if (res.ok) {
        const data = await res.json();
        setGreenConditions(data);
      }
    } catch {
      // ignore
    }
  }, [tournamentId]);

  // Check if current user is admin
  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: player } = await supabase
        .from("players")
        .select("role")
        .eq("user_id", user.id)
        .single();
      if (player?.role === "admin") setIsAdmin(true);
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    loadPlayers();
    loadCheckins();
    loadTournament();
    loadConditions();

    // UCI-04: Realtime subscription for bowls_checkins -- kiosk check-ins appear within 3 seconds
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

    // REQ-15-12: Realtime subscription for green_conditions
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
          loadConditions();
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
  }, [loadPlayers, loadCheckins, loadTournament, loadConditions, tournamentId]);

  // Fetch top position rating for all players (REQ-11-11 check-in badge)
  useEffect(() => {
    async function loadTopRatings() {
      const supabase = createClient();
      const season = new Date().getFullYear().toString();
      const { data } = await supabase
        .from("bowls_position_ratings")
        .select("player_id, position, elo_rating")
        .eq("season", season)
        .gte("games_played", 1)
        .order("elo_rating", { ascending: false });

      if (data) {
        const topMap = new Map<string, { position: string; elo: number }>();
        for (const row of data) {
          if (!topMap.has(row.player_id)) {
            topMap.set(row.player_id, { position: row.position, elo: Math.round(row.elo_rating) });
          }
        }
        setPlayerTopRatings(topMap);
      }
    }
    loadTopRatings();
  }, []);

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
        const checkedInPlayer = selectedPlayer;
        setJustCheckedIn(selectedPlayer.id);
        setSelectedPlayer(null);
        await loadCheckins();
        setTimeout(() => setJustCheckedIn(null), 2000);

        // Show insurance offer for players without active coverage
        if (checkedInPlayer.insurance_status !== "active") {
          setInsuranceOfferPlayer(checkedInPlayer.display_name);
          setShowInsuranceOffer(true);
          setTimeout(() => setShowInsuranceOffer(false), 8000);
        }
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

  // Mead Draw compatibility check
  const meadCompatibility = validateDrawCompatibility(checkins.length, format, drawStyle);
  const showMeadWarning = drawStyle === "mead" && !meadCompatibility.compatible;

  async function handleGenerateDraw(targetRound?: number) {
    setGeneratingDraw(true);
    const round = targetRound ?? activeRound;
    // If Mead Draw is selected but incompatible, fall back to random
    const effectiveStyle = (drawStyle === "mead" && showMeadWarning) ? "random" : drawStyle;
    try {
      const res = await fetch("/api/bowls/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          format,
          draw_style: effectiveStyle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoundDraws((prev) => ({ ...prev, [round]: data }));
        setActiveRound(round);
        setView("draw");
      }
    } catch {
      // Handle error
    }
    setGeneratingDraw(false);
  }

  function handleNextRound() {
    const nextRound = (roundNumbers.length > 0 ? Math.max(...roundNumbers) : 0) + 1;
    handleGenerateDraw(nextRound);
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
  const guestPlayerIds = new Set(checkins.filter((c) => c.is_guest).map((c) => c.player_id));

  const positionCounts: Record<string, number> = {};
  for (const pos of positionsNeeded) {
    positionCounts[pos] = checkins.filter(
      (c) => c.preferred_position === pos
    ).length;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A2E12]/[0.03] pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#0A2E12]">
                {tournamentName}
              </h1>
              <p className="text-sm text-[#3D5A3E]">
                Tournament Check-in &middot; {checkins.length} players registered
              </p>
            </div>

            {/* Format selector */}
            <div className="flex items-center gap-2 no-print">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as BowlsGameFormat)}
                className="rounded-xl border border-[#0A2E12]/10 bg-white px-3 py-2 text-sm font-medium text-[#2D4A30] focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
              >
                {(Object.entries(BOWLS_FORMAT_LABELS) as [BowlsGameFormat, typeof BOWLS_FORMAT_LABELS[BowlsGameFormat]][]).map(
                  ([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* View tabs */}
          <div className="mt-3 flex gap-1 no-print">
            {(
              [
                { key: "checkin" as PageView, label: "Check In" },
                { key: "board" as PageView, label: `Board (${checkins.length})` },
                { key: "draw" as PageView, label: "Draw" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                  view === tab.key
                    ? "bg-[#1B5E20] text-white"
                    : "text-[#3D5A3E] hover:bg-[#0A2E12]/5"
                )}
              >
                {tab.label}
              </button>
            ))}
            <Link
              href={`/bowls/${tournamentId}/scores`}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
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
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* ===== GREEN CONDITIONS WIDGET (REQ-15-06) ===== */}
        {(view === "checkin" || view === "board") && (
          <div className="mb-4">
            <GreenConditionsWidget
              conditions={greenConditions}
              onEdit={isAdmin ? () => setShowConditionsForm(true) : undefined}
            />
          </div>
        )}

        {/* ===== GREEN CONDITIONS FORM MODAL ===== */}
        {showConditionsForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <GreenConditionsForm
                tournamentId={tournamentId}
                existing={greenConditions}
                onSaved={(saved) => {
                  setGreenConditions(saved);
                  setShowConditionsForm(false);
                }}
                onCancel={() => setShowConditionsForm(false)}
              />
            </div>
          </div>
        )}

        {/* ===== CHECK-IN VIEW ===== */}
        {view === "checkin" && (
          <div>
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for your name..."
                className="w-full rounded-2xl border border-[#0A2E12]/10 bg-white px-5 py-4 text-lg text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
              />
            </div>

            <p className="mb-4 text-center text-sm text-[#3D5A3E]">
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
                        : "bg-white border border-[#0A2E12]/10 hover:border-[#0A2E12]/10 hover:shadow-sm"
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
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1B5E20] to-emerald-600 text-sm font-bold text-white"
                        >
                          {initials}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <span
                      className={cn(
                        "text-sm font-medium truncate max-w-full",
                        checked ? "text-blue-700" : "text-[#3D5A3E]"
                      )}
                    >
                      {player.display_name}
                    </span>
                    {playerTopRatings.has(player.id) && (() => {
                      const r = playerTopRatings.get(player.id)!;
                      return (
                        <span className="text-xs font-bold text-[#1B5E20]">
                          {r.position.charAt(0).toUpperCase() + r.position.slice(1)} {r.elo}
                        </span>
                      );
                    })()}
                    {checked && (
                      <span className="text-sm text-[#3D5A3E]">
                        tap to undo
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== BOARD VIEW ===== */}
        {view === "board" && (
          <div>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {positionsNeeded.map((pos) => (
                <div
                  key={pos}
                  className="rounded-2xl bg-white border border-[#0A2E12]/10 p-4 text-center"
                >
                  <div
                    className={cn(
                      "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold",
                      POSITION_COLORS[pos]
                    )}
                  >
                    {positionCounts[pos] ?? 0}
                  </div>
                  <p className="text-sm font-semibold text-[#2D4A30]">
                    {BOWLS_POSITION_LABELS[pos].label}
                  </p>
                  <p className="text-xs text-[#3D5A3E]">
                    {BOWLS_POSITION_LABELS[pos].description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-6 rounded-2xl bg-white border border-[#0A2E12]/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-[#0A2E12]">
                    {checkins.length}
                  </p>
                  <p className="text-xs text-[#3D5A3E]">players checked in</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#1B5E20]">
                    {possibleRinks}
                  </p>
                  <p className="text-xs text-[#3D5A3E]">
                    rinks possible ({BOWLS_FORMAT_LABELS[format].label})
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={drawStyle}
                    onChange={(e) => setDrawStyle(e.target.value as DrawStyle)}
                    className="rounded-xl border border-[#0A2E12]/10 bg-white px-3 py-2 text-sm font-medium text-[#2D4A30] focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                  >
                    {(Object.entries(DRAW_STYLE_LABELS) as [DrawStyle, string][]).map(
                      ([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                  <button
                    onClick={() => handleGenerateDraw()}
                    disabled={possibleRinks < 1 || generatingDraw}
                    className="rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#145218] disabled:opacity-40 min-h-[48px] touch-manipulation"
                  >
                    {generatingDraw ? "Generating..." : "Generate Draw"}
                  </button>
                </div>
              </div>

              {/* US-009: Mead Draw player count warning */}
              {showMeadWarning && (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Mead Draw supports {meadCompatibility.supported_counts?.join(", ")} players.
                      You have {checkins.length} checked in.
                      The system will use Random Draw instead.
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      Consider adjusting check-ins to match a supported count, or choose Random Draw.
                    </p>
                  </div>
                </div>
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
                    className="flex items-center gap-4 rounded-xl bg-white border border-[#0A2E12]/10 px-4 py-3"
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
                      <p className="text-sm font-semibold text-[#0A2E12] truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-[#3D5A3E]">
                        {BOWLS_POSITION_LABELS[checkin.preferred_position as BowlsPosition]?.label}
                      </p>
                    </div>
                    {/* Guest badge for visiting players */}
                    {checkin.is_guest && <GuestPlayerBadge />}
                    {/* UCI-10: Check-in source badge */}
                    {checkin.checkin_source && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                        checkin.checkin_source === "kiosk"
                          ? "bg-blue-100 text-blue-700"
                          : checkin.checkin_source === "app"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-[#0A2E12]/5 text-[#3D5A3E]"
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
                    {/* UCI-11: Remove button for drawmaster */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUndoCheckin(checkin.player_id);
                      }}
                      className="ml-1 rounded-lg border border-[#0A2E12]/10 px-3 py-2 text-sm font-medium text-[#3D5A3E] hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors min-h-[44px] touch-manipulation"
                      title="Remove player from check-in list"
                    >
                      Remove
                    </button>
                  </motion.div>
                );
              })}

              {checkins.length === 0 && (
                <div className="rounded-2xl bg-white border border-[#0A2E12]/10 p-12 text-center">
                  <p className="text-lg font-semibold text-[#3D5A3E]">
                    No players checked in yet
                  </p>
                  <p className="mt-1 text-sm text-[#3D5A3E]">
                    Switch to the Check In tab to register players
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== DRAW VIEW ===== */}
        {view === "draw" && (
          <div>
            {/* REQ-15-08: Log Conditions shortcut in draw view */}
            {isAdmin && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowConditionsForm(true)}
                  className="rounded-xl border border-[#1B5E20]/30 bg-[#1B5E20]/5 px-4 py-2 text-sm font-semibold text-[#1B5E20] hover:bg-[#1B5E20]/10 transition-colors min-h-[44px]"
                >
                  Log Conditions
                </button>
              </div>
            )}
            {totalRounds === 0 ? (
              <div className="rounded-2xl bg-white border border-[#0A2E12]/10 p-12 text-center">
                <p className="text-lg font-semibold text-[#3D5A3E]">
                  No draw generated yet
                </p>
                <p className="mt-1 text-sm text-[#3D5A3E]">
                  Check in players and generate a draw from the Board tab
                </p>
                <button
                  onClick={() => setView("board")}
                  className="mt-4 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218]"
                >
                  Go to Board
                </button>
              </div>
            ) : (
              <div>
                {/* Round Tabs */}
                {totalRounds > 1 && (
                  <div className="mb-4 flex gap-1 overflow-x-auto no-print">
                    {roundNumbers.map((round) => (
                      <button
                        key={round}
                        onClick={() => setActiveRound(round)}
                        className={cn(
                          "shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                          activeRound === round
                            ? "bg-[#1B5E20] text-white"
                            : "bg-white border border-[#0A2E12]/10 text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03]"
                        )}
                      >
                        Round {round}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mb-6 flex items-center justify-between no-print">
                  <div>
                    <h2 className="text-xl font-black text-[#0A2E12]">
                      Tournament Draw &mdash; Round {activeRound}
                    </h2>
                    {drawResult && (
                      <p className="text-sm text-[#3D5A3E]">
                        {tournamentName} &middot; {BOWLS_FORMAT_LABELS[drawResult.format].label} &middot;{" "}
                        {drawResult.rinkCount} rink
                        {drawResult.rinkCount !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-2 text-sm font-semibold text-[#2D4A30] hover:bg-[#0A2E12]/[0.03] min-h-[44px] touch-manipulation"
                    >
                      Print Draw Sheet
                    </button>
                    <button
                      onClick={handleNextRound}
                      disabled={generatingDraw}
                      className="rounded-xl border border-[#1B5E20]/30 bg-[#1B5E20]/5 px-4 py-2 text-sm font-semibold text-[#1B5E20] hover:bg-[#1B5E20]/10 disabled:opacity-40 min-h-[44px] touch-manipulation"
                    >
                      {generatingDraw ? "Generating..." : "Generate Next Round"}
                    </button>
                    <button
                      onClick={() => handleGenerateDraw()}
                      disabled={generatingDraw}
                      className="rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-2 text-sm font-semibold text-[#2D4A30] hover:bg-[#0A2E12]/[0.03] disabled:opacity-40 min-h-[44px] touch-manipulation"
                    >
                      Re-Draw
                    </button>
                  </div>
                </div>

                {/* Print-only draw sheet header */}
                <div className="hidden print:block print:mb-4">
                  <div className="border-b-2 border-[#1B5E20] pb-3 mb-4">
                    <h1 className="text-2xl font-black text-[#0A2E12]">{tournamentName}</h1>
                    <div className="flex justify-between text-sm text-[#3D5A3E] mt-1">
                      <span>{tournamentDate}</span>
                      <span>Round {activeRound}{totalRounds > 1 ? ` of ${totalRounds}` : ""}</span>
                      {drawResult && <span>{BOWLS_FORMAT_LABELS[drawResult.format].label}</span>}
                    </div>
                  </div>
                </div>

                {drawResult && (
                  <>
                    <div className="space-y-4">
                      {drawResult.rinks.map((rink, idx) => {
                        const team1 = rink.filter((a) => a.team === 1);
                        const team2 = rink.filter((a) => a.team === 2);

                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="rounded-2xl bg-white border border-[#0A2E12]/10 overflow-hidden print:rounded print:border-[#0A2E12]/10"
                          >
                            <div className="bg-[#0A2E12]/[0.03] border-b border-[#0A2E12]/10 px-5 py-3 print:bg-[#0A2E12]/5 print:py-2">
                              <h3 className="text-sm font-bold text-[#2D4A30]">
                                Rink {idx + 1}
                              </h3>
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-[#0A2E12]/10 print:divide-[#0A2E12]/10">
                              <div className="p-4 print:p-3">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#3D5A3E] print:text-[#3D5A3E]">
                                  Team 1
                                </p>
                                <div className="space-y-2 print:space-y-1">
                                  {team1
                                    .sort(
                                      (a, b) =>
                                        BOWLS_POSITION_LABELS[b.position].order -
                                        BOWLS_POSITION_LABELS[a.position].order
                                    )
                                    .map((a) => (
                                      <div
                                        key={a.player_id}
                                        className="flex items-center gap-3 print:gap-2"
                                      >
                                        <span
                                          className={cn(
                                            "inline-flex h-7 items-center rounded-full px-2 text-sm font-bold text-white print:bg-[#0A2E12] print:h-auto print:py-0.5 print:text-xs",
                                            POSITION_COLORS[a.position]
                                          )}
                                        >
                                          {BOWLS_POSITION_LABELS[a.position].label}
                                        </span>
                                        <span className="text-sm font-medium text-[#2D4A30] truncate print:text-xs print:text-black">
                                          {a.player?.display_name ?? "TBD"}
                                        </span>
                                        {guestPlayerIds.has(a.player_id) && <GuestPlayerBadge />}
                                      </div>
                                    ))}
                                </div>
                              </div>

                              <div className="p-4 print:p-3">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#3D5A3E] print:text-[#3D5A3E]">
                                  Team 2
                                </p>
                                <div className="space-y-2 print:space-y-1">
                                  {team2
                                    .sort(
                                      (a, b) =>
                                        BOWLS_POSITION_LABELS[b.position].order -
                                        BOWLS_POSITION_LABELS[a.position].order
                                    )
                                    .map((a) => (
                                      <div
                                        key={a.player_id}
                                        className="flex items-center gap-3 print:gap-2"
                                      >
                                        <span
                                          className={cn(
                                            "inline-flex h-7 items-center rounded-full px-2 text-sm font-bold text-white print:bg-[#0A2E12] print:h-auto print:py-0.5 print:text-xs",
                                            POSITION_COLORS[a.position]
                                          )}
                                        >
                                          {BOWLS_POSITION_LABELS[a.position].label}
                                        </span>
                                        <span className="text-sm font-medium text-[#2D4A30] truncate print:text-xs print:text-black">
                                          {a.player?.display_name ?? "TBD"}
                                        </span>
                                        {guestPlayerIds.has(a.player_id) && <GuestPlayerBadge />}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Print-only score recording table */}
                    <div className="hidden print:block mt-6">
                      <h3 className="text-sm font-bold text-[#2D4A30] mb-2">Score Recording</h3>
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr>
                            <th className="border border-[#0A2E12]/10 px-2 py-1 text-left bg-[#0A2E12]/5">Rink</th>
                            {Array.from({ length: 12 }, (_, i) => (
                              <th key={i} className="border border-[#0A2E12]/10 px-2 py-1 text-center bg-[#0A2E12]/5 w-8">
                                {i + 1}
                              </th>
                            ))}
                            <th className="border border-[#0A2E12]/10 px-2 py-1 text-center bg-[#0A2E12]/5">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {drawResult.rinks.map((_, idx) => (
                            <Fragment key={idx}>
                              <tr>
                                <td className="border border-[#0A2E12]/10 px-2 py-2 font-medium">R{idx + 1} - T1</td>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <td key={i} className="border border-[#0A2E12]/10 px-2 py-2">&nbsp;</td>
                                ))}
                                <td className="border border-[#0A2E12]/10 px-2 py-2">&nbsp;</td>
                              </tr>
                              <tr>
                                <td className="border border-[#0A2E12]/10 px-2 py-2 font-medium">R{idx + 1} - T2</td>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <td key={i} className="border border-[#0A2E12]/10 px-2 py-2">&nbsp;</td>
                                ))}
                                <td className="border border-[#0A2E12]/10 px-2 py-2">&nbsp;</td>
                              </tr>
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {drawResult.unassigned.length > 0 && (
                      <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-5 print:bg-white print:border-[#0A2E12]/10 print:rounded">
                        <h3 className="mb-2 text-sm font-bold text-amber-800 print:text-black">
                          Unassigned Players ({drawResult.unassigned.length})
                        </h3>
                        <p className="mb-3 text-xs text-amber-600 print:text-[#3D5A3E]">
                          Not enough players for a full rink. These players can be
                          added as substitutes or wait for more check-ins.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {drawResult.unassigned.map((u) => (
                            <span
                              key={u.player_id}
                              className="rounded-full bg-amber-200/60 px-3 py-1 text-xs font-medium text-amber-800 print:bg-[#0A2E12]/5 print:text-black"
                            >
                              {u.player?.display_name ?? "Unknown"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Position Selection Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mx-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <h3 className="mb-1 text-xl font-black text-[#0A2E12]">
                {selectedPlayer.display_name}
              </h3>
              <p className="mb-6 text-sm text-[#3D5A3E]">
                Choose your preferred position for{" "}
                {BOWLS_FORMAT_LABELS[format].label}
              </p>

              <div className="space-y-3">
                {positionsNeeded.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => handlePositionSelect(pos)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-[#0A2E12]/10 p-4 text-left transition-all hover:border-[#1B5E20]/30 hover:bg-[#1B5E20]/5 active:scale-[0.98] min-h-[72px] touch-manipulation"
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
                      <p className="text-base font-bold text-[#0A2E12]">
                        {BOWLS_POSITION_LABELS[pos].label}
                      </p>
                      <p className="text-sm text-[#3D5A3E]">
                        {BOWLS_POSITION_LABELS[pos].description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedPlayer(null)}
                className="mt-4 w-full rounded-2xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] py-3 text-sm font-semibold text-[#3D5A3E] hover:bg-[#0A2E12]/5 min-h-[48px] touch-manipulation"
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
