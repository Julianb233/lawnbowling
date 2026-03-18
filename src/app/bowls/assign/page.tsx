"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { TeamAssignmentPreview } from "@/components/bowls/TeamAssignmentPreview";
import { PlayerSwap } from "@/components/bowls/PlayerSwap";
import { BOWLS_FORMAT_LABELS } from "@/lib/types";
import type { BowlsGameFormat } from "@/lib/types";
import type {
  AssignmentResult,
  LockedAssignment,
} from "@/lib/team-assignment-engine";
import { cn } from "@/lib/utils";
import {
  Users,
  Shuffle,
  ChevronLeft,
  BarChart3,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import type { BowlsCheckin } from "@/lib/types";

const FORMAT_OPTIONS: { value: BowlsGameFormat; label: string; icon: string }[] = [
  { value: "fours", label: "Fours", icon: "4" },
  { value: "triples", label: "Triples", icon: "3" },
  { value: "pairs", label: "Pairs", icon: "2" },
  { value: "singles", label: "Singles", icon: "1" },
];

export default function AssignTeamsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAF5]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A2E12]/20 border-t-[#0A2E12]" />
        </div>
      }
    >
      <AssignTeamsContent />
    </Suspense>
  );
}

function AssignTeamsContent() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournament_id") ?? "";

  const [format, setFormat] = useState<BowlsGameFormat>("fours");
  const [checkins, setCheckins] = useState<BowlsCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AssignmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tournamentName, setTournamentName] = useState("Lawn Bowls");

  // Swap state
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [lockedPlayerIds, setLockedPlayerIds] = useState<Set<string>>(new Set());

  // Load check-ins
  const loadCheckins = useCallback(async () => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();

      // Load tournament name
      const { data: tournament } = await supabase
        .from("tournaments")
        .select("name, format")
        .eq("id", tournamentId)
        .single();

      if (tournament) {
        setTournamentName(tournament.name ?? "Lawn Bowls");
        if (tournament.format) {
          setFormat(tournament.format as BowlsGameFormat);
        }
      }

      // Load checkins
      const res = await fetch(`/api/bowls/checkin?tournament_id=${tournamentId}`);
      if (res.ok) {
        const data = await res.json();
        setCheckins(data.checkins ?? []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadCheckins();
  }, [loadCheckins]);

  // Generate smart assignment
  const generateTeams = useCallback(async () => {
    if (!tournamentId || checkins.length === 0) return;

    setGenerating(true);
    setError(null);

    try {
      // Build locked assignments from lockedPlayerIds
      const lockedAssignments: LockedAssignment[] = [];
      if (result) {
        for (const rink of result.rinks) {
          for (const slot of [...rink.teamA, ...rink.teamB]) {
            if (lockedPlayerIds.has(slot.player_id)) {
              lockedAssignments.push({
                player_id: slot.player_id,
                rink: rink.rink,
                team: rink.teamA.some((s) => s.player_id === slot.player_id) ? 1 : 2,
                position: slot.position,
              });
            }
          }
        }
      }

      const res = await fetch("/api/bowls/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          format,
          locked_assignments: lockedAssignments.length > 0 ? lockedAssignments : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error ?? "Failed to do the draw");
        return;
      }

      const data: AssignmentResult = await res.json();
      setResult(data);
      setSelectedPlayerId(null);
    } catch {
      setError("Failed to do the draw. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [tournamentId, checkins.length, format, lockedPlayerIds, result]);

  // Handle player click for swap
  const handlePlayerClick = useCallback(
    (playerId: string) => {
      if (lockedPlayerIds.has(playerId)) return;

      if (!selectedPlayerId) {
        // Select first player
        setSelectedPlayerId(playerId);
        return;
      }

      if (selectedPlayerId === playerId) {
        // Deselect
        setSelectedPlayerId(null);
        return;
      }

      // Perform swap via client-side engine
      if (!result) return;

      // Import and use swapPlayers
      import("@/lib/team-assignment-engine").then(({ swapPlayers }) => {
        const swapped = swapPlayers(result, selectedPlayerId, playerId, {
          format,
        });
        setResult(swapped);
        setSelectedPlayerId(null);
      });
    },
    [selectedPlayerId, lockedPlayerIds, result, format]
  );

  // Toggle lock
  const handleToggleLock = useCallback((playerId: string) => {
    setLockedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }, []);

  // Get selected player name
  const selectedPlayerName = result
    ? (() => {
        for (const rink of result.rinks) {
          for (const slot of [...rink.teamA, ...rink.teamB]) {
            if (slot.player_id === selectedPlayerId) return slot.display_name;
          }
        }
        return null;
      })()
    : null;

  const formatInfo = BOWLS_FORMAT_LABELS[format];
  const playersPerRink = formatInfo.playersPerTeam * formatInfo.teams;
  const possibleRinks = Math.floor(checkins.length / playersPerRink);

  return (
    <div className="min-h-screen bg-[#FAFAF5] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-[#0A2E12]/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <Link
            href={tournamentId ? `/bowls/${tournamentId}` : "/bowls"}
            className="rounded-lg p-1.5 text-[#3D5A3E] hover:bg-[#0A2E12]/5"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#0A2E12]">Smart Team Assignment</h1>
            <p className="text-xs text-[#3D5A3E]">{tournamentName}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4">
        {/* Player count summary */}
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A2E12]/5">
            <Users className="h-5 w-5 text-[#0A2E12]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#0A2E12]">
              {checkins.length} Player{checkins.length !== 1 ? "s" : ""} Signed In
            </p>
            <p className="text-xs text-[#3D5A3E]">
              {possibleRinks} rink{possibleRinks !== 1 ? "s" : ""} possible
              {checkins.length % playersPerRink > 0 &&
                ` (${checkins.length % playersPerRink} sit out)`}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
        </div>

        {/* Format selector */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]/70">
            Game Format
          </label>
          <div className="grid grid-cols-4 gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setFormat(opt.value);
                  setResult(null);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                  format === opt.value
                    ? "border-[#0A2E12] bg-[#0A2E12] text-white"
                    : "border-[#0A2E12]/10 bg-white text-[#3D5A3E] hover:border-[#0A2E12]/30"
                )}
              >
                <span className="text-lg">{opt.icon}</span>
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        {!result && (
          <button
            onClick={generateTeams}
            disabled={generating || loading || checkins.length < playersPerRink}
            className={cn(
              "mb-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all",
              generating || loading || checkins.length < playersPerRink
                ? "bg-[#0A2E12]/10 text-[#3D5A3E]/50"
                : "bg-[#0A2E12] text-white shadow-lg shadow-[#0A2E12]/20 hover:bg-[#0A2E12]/90"
            )}
          >
            <Shuffle className={cn("h-4 w-4", generating && "animate-spin")} />
            {generating
              ? "Generating Balanced Teams..."
              : loading
              ? "Loading Players..."
              : checkins.length < playersPerRink
              ? `Need at least ${playersPerRink} players`
              : "Do the Draw"}
          </button>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Score breakdown */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-[#0A2E12]/10 bg-white p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#0A2E12]" />
              <h3 className="text-sm font-bold text-[#0A2E12]">Balance Score</h3>
              <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                {result.totalScore}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Skill", value: result.scoreBreakdown.skill, color: "bg-blue-400" },
                { label: "Position", value: result.scoreBreakdown.position, color: "bg-purple-400" },
                { label: "Variety", value: result.scoreBreakdown.variety, color: "bg-amber-400" },
                { label: "Social", value: result.scoreBreakdown.social, color: "bg-emerald-400" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="mx-auto mb-1 h-1.5 w-full overflow-hidden rounded-full bg-[#0A2E12]/5">
                    <div
                      className={cn("h-full rounded-full", item.color)}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-medium text-[#3D5A3E]/70">{item.label}</p>
                  <p className="text-xs font-bold text-[#0A2E12]">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Swap controls */}
        {result && (
          <div className="mb-4">
            <PlayerSwap
              selectedPlayerId={selectedPlayerId}
              selectedPlayerName={selectedPlayerName ?? null}
              lockedCount={lockedPlayerIds.size}
              regenerating={generating}
              onCancelSelect={() => setSelectedPlayerId(null)}
              onRegenerate={generateTeams}
              onUnlockAll={() => setLockedPlayerIds(new Set())}
            />
          </div>
        )}

        {/* Team preview */}
        {result && (
          <TeamAssignmentPreview
            rinks={result.rinks}
            selectedPlayerId={selectedPlayerId}
            lockedPlayerIds={lockedPlayerIds}
            onPlayerClick={handlePlayerClick}
            onToggleLock={handleToggleLock}
          />
        )}

        {/* Sit-outs */}
        {result && result.sitOuts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"
          >
            <h3 className="mb-2 text-sm font-bold text-amber-800">
              Sitting Out ({result.sitOuts.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.sitOuts.map((p) => (
                <span
                  key={p.player_id}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-700 shadow-sm"
                >
                  {p.display_name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Checked-in players list (when no result) */}
        {!result && !loading && checkins.length > 0 && (
          <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-[#0A2E12]">Signed-In Players</h3>
            <div className="space-y-2">
              {checkins.map((c) => (
                <div
                  key={c.player_id}
                  className="flex items-center gap-3 rounded-lg bg-[#F5F0E8]/50 px-3 py-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A2E12]/10 text-xs font-bold text-[#0A2E12]">
                    {(c.player?.display_name ?? "?")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0A2E12]">
                      {c.player?.display_name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-[#3D5A3E]">
                      Prefers: {c.preferred_position}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A2E12]/20 border-t-[#0A2E12]" />
          </div>
        )}

        {/* Empty state */}
        {!loading && checkins.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#0A2E12]/20 bg-[#F5F0E8]/30 p-8 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-[#3D5A3E]/40" />
            <p className="text-sm font-semibold text-[#0A2E12]">No Players Signed In</p>
            <p className="mt-1 text-xs text-[#3D5A3E]">
              Players need to sign in before teams can be assigned.
            </p>
            {tournamentId && (
              <Link
                href={`/bowls/${tournamentId}`}
                className="mt-3 inline-block rounded-xl bg-[#0A2E12] px-4 py-2 text-sm font-semibold text-white"
              >
                Go to Tournament
              </Link>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
