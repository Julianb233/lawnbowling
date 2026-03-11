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
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { PrintDrawSheet } from "@/components/bowls/PrintDrawSheet";
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
  const tournamentId = (params?.id ?? "") as string;

  const [view, setView] = useState<PageView>("checkin");
  const [players, setPlayers] = useState<Player[]>([]);
  const [checkins, setCheckins] = useState<BowlsCheckin[]>([]);
  const [format, setFormat] = useState<BowlsGameFormat>("fours");
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingDraw, setGeneratingDraw] = useState(false);
  const [tournamentName, setTournamentName] = useState("Lawn Bowls");
  const [drawRound, setDrawRound] = useState(1);

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

    const interval = setInterval(loadCheckins, 5000);
    return () => clearInterval(interval);
  }, [loadPlayers, loadCheckins, loadTournament]);

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

  async function handleGenerateDraw() {
    setGeneratingDraw(true);
    try {
      const res = await fetch("/api/bowls/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          format,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDrawResult(data);
        setView("draw");
      }
    } catch {
      // Handle error
    }
    setGeneratingDraw(false);
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                {tournamentName}
              </h1>
              <p className="text-sm text-zinc-500">
                Tournament Check-in &middot; {checkins.length} players registered
              </p>
            </div>

            {/* Format selector */}
            <div className="flex items-center gap-2">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as BowlsGameFormat)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
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
                    : "text-zinc-500 hover:bg-zinc-100"
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
        {/* ===== CHECK-IN VIEW ===== */}
        {view === "checkin" && (
          <div>
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for your name..."
                className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-lg text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
              />
            </div>

            <p className="mb-4 text-center text-sm text-zinc-500">
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
                        : "bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
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
                        checked ? "text-blue-700" : "text-zinc-600"
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
        )}

        {/* ===== BOARD VIEW ===== */}
        {view === "board" && (
          <div>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {positionsNeeded.map((pos) => (
                <div
                  key={pos}
                  className="rounded-2xl bg-white border border-zinc-200 p-4 text-center"
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

            <div className="mb-6 rounded-2xl bg-white border border-zinc-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-zinc-900">
                    {checkins.length}
                  </p>
                  <p className="text-xs text-zinc-500">players checked in</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#1B5E20]">
                    {possibleRinks}
                  </p>
                  <p className="text-xs text-zinc-500">
                    rinks possible ({BOWLS_FORMAT_LABELS[format].label})
                  </p>
                </div>
                <button
                  onClick={handleGenerateDraw}
                  disabled={possibleRinks < 1 || generatingDraw}
                  className="rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#145218] disabled:opacity-40 min-h-[48px] touch-manipulation"
                >
                  {generatingDraw ? "Generating..." : "Generate Draw"}
                </button>
              </div>
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
                    className="flex items-center gap-4 rounded-xl bg-white border border-zinc-200 px-4 py-3"
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
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {BOWLS_POSITION_LABELS[checkin.preferred_position as BowlsPosition]?.label}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold text-white",
                        POSITION_COLORS[checkin.preferred_position as BowlsPosition]
                      )}
                    >
                      {BOWLS_POSITION_LABELS[checkin.preferred_position as BowlsPosition]?.label}
                    </span>
                  </motion.div>
                );
              })}

              {checkins.length === 0 && (
                <div className="rounded-2xl bg-white border border-zinc-200 p-12 text-center">
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
        )}

        {/* ===== DRAW VIEW ===== */}
        {view === "draw" && (
          <div>
            {!drawResult ? (
              <div className="rounded-2xl bg-white border border-zinc-200 p-12 text-center">
                <p className="text-lg font-semibold text-zinc-400">
                  No draw generated yet
                </p>
                <p className="mt-1 text-sm text-zinc-400">
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
                <PrintDrawSheet
                  drawResult={drawResult}
                  tournamentName={tournamentName}
                  round={drawRound}
                />
                <div className="screen-draw-view">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-zinc-900">
                      Tournament Draw &mdash; Round {drawRound}
                    </h2>
                    <p className="text-sm text-zinc-500">
                      {tournamentName} &middot; {BOWLS_FORMAT_LABELS[drawResult.format].label} &middot;{" "}
                      {drawResult.rinkCount} rink
                      {drawResult.rinkCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 no-print">
                    <button
                      onClick={() => window.print()}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 min-h-[44px] touch-manipulation"
                    >
                      Print Draw Sheet
                    </button>
                    <button
                      onClick={() => {
                        setDrawRound((prev) => prev + 1);
                        handleGenerateDraw();
                      }}
                      className="rounded-xl border border-[#1B5E20]/30 bg-[#1B5E20]/5 px-4 py-2 text-sm font-semibold text-[#1B5E20] hover:bg-[#1B5E20]/10 min-h-[44px] touch-manipulation"
                    >
                      Next Round Draw
                    </button>
                    <button
                      onClick={handleGenerateDraw}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 min-h-[44px] touch-manipulation"
                    >
                      Re-Draw
                    </button>
                  </div>
                </div>

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
                        className="rounded-2xl bg-white border border-zinc-200 overflow-hidden"
                      >
                        <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3">
                          <h3 className="text-sm font-bold text-zinc-700">
                            Rink {idx + 1}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-zinc-100">
                          <div className="p-4">
                            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                              Team 1
                            </p>
                            <div className="space-y-2">
                              {team1
                                .sort(
                                  (a, b) =>
                                    BOWLS_POSITION_LABELS[b.position].order -
                                    BOWLS_POSITION_LABELS[a.position].order
                                )
                                .map((a) => (
                                  <div
                                    key={a.player_id}
                                    className="flex items-center gap-3"
                                  >
                                    <span
                                      className={cn(
                                        "inline-flex h-7 items-center rounded-full px-2 text-[11px] font-bold text-white",
                                        POSITION_COLORS[a.position]
                                      )}
                                    >
                                      {BOWLS_POSITION_LABELS[a.position].label}
                                    </span>
                                    <span className="text-sm font-medium text-zinc-700 truncate">
                                      {a.player?.display_name ?? "TBD"}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div className="p-4">
                            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                              Team 2
                            </p>
                            <div className="space-y-2">
                              {team2
                                .sort(
                                  (a, b) =>
                                    BOWLS_POSITION_LABELS[b.position].order -
                                    BOWLS_POSITION_LABELS[a.position].order
                                )
                                .map((a) => (
                                  <div
                                    key={a.player_id}
                                    className="flex items-center gap-3"
                                  >
                                    <span
                                      className={cn(
                                        "inline-flex h-7 items-center rounded-full px-2 text-[11px] font-bold text-white",
                                        POSITION_COLORS[a.position]
                                      )}
                                    >
                                      {BOWLS_POSITION_LABELS[a.position].label}
                                    </span>
                                    <span className="text-sm font-medium text-zinc-700 truncate">
                                      {a.player?.display_name ?? "TBD"}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {drawResult.unassigned.length > 0 && (
                  <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-5">
                    <h3 className="mb-2 text-sm font-bold text-amber-800">
                      Unassigned Players ({drawResult.unassigned.length})
                    </h3>
                    <p className="mb-3 text-xs text-amber-600">
                      Not enough players for a full rink. These players can be
                      added as substitutes or wait for more check-ins.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {drawResult.unassigned.map((u) => (
                        <span
                          key={u.player_id}
                          className="rounded-full bg-amber-200/60 px-3 py-1 text-xs font-medium text-amber-800"
                        >
                          {u.player?.display_name ?? "Unknown"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                </div>
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
              <h3 className="mb-1 text-xl font-black text-zinc-900">
                {selectedPlayer.display_name}
              </h3>
              <p className="mb-6 text-sm text-zinc-500">
                Choose your preferred position for{" "}
                {BOWLS_FORMAT_LABELS[format].label}
              </p>

              <div className="space-y-3">
                {positionsNeeded.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => handlePositionSelect(pos)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 p-4 text-left transition-all hover:border-[#1B5E20]/30 hover:bg-[#1B5E20]/5 active:scale-[0.98] min-h-[72px] touch-manipulation"
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
                      <p className="text-base font-bold text-zinc-900">
                        {BOWLS_POSITION_LABELS[pos].label}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {BOWLS_POSITION_LABELS[pos].description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedPlayer(null)}
                className="mt-4 w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 min-h-[48px] touch-manipulation"
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
