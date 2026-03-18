"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  Users,
  Shuffle,
  ClipboardCheck,
  BarChart3,
  Trophy,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardStepRail } from "./WizardStepRail";
import { ConfirmRedrawModal } from "./ConfirmRedrawModal";
import {
  BOWLS_FORMAT_LABELS,
} from "@/lib/types";
import type { BowlsGameFormat, BowlsCheckin, BowlsTeamAssignment } from "@/lib/types";

type TournamentState =
  | "registration"
  | "checkin"
  | "draw"
  | "scoring"
  | "results"
  | "complete";

interface ProgressionInfo {
  tournament_id: string;
  current_state: TournamentState;
  current_round: number;
  total_rounds_played: number;
  available_actions: string[];
  checkin_count: number;
  all_scores_finalized: boolean;
  can_advance: boolean;
}

interface DrawResult {
  rinks: BowlsTeamAssignment[][];
  unassigned: BowlsCheckin[];
  rinkCount: number;
  format: BowlsGameFormat;
}

interface RinkScore {
  rink: number;
  is_finalized: boolean;
  team_a_scores: number[];
  team_b_scores: number[];
  total_a: number;
  total_b: number;
}

interface PlayerStanding {
  player_id: string;
  display_name: string;
  wins: number;
  losses: number;
  draws: number;
  games_played: number;
  total_shots_for: number;
  total_shots_against: number;
}

interface TournamentWizardProps {
  tournamentId: string;
  tournamentName: string;
  format: BowlsGameFormat;
  checkins: BowlsCheckin[];
  drawResult: DrawResult | null;
  onGenerateDraw: (format: BowlsGameFormat) => Promise<void>;
  onFormatChange: (format: BowlsGameFormat) => void;
  renderCheckinView: () => React.ReactNode;
  renderBoardView: () => React.ReactNode;
  renderDrawView: () => React.ReactNode;
}

const STEP_LABELS: Record<TournamentState, string> = {
  registration: "Tournament Setup",
  checkin: "Check In Players",
  draw: "Generate Draw",
  scoring: "Play & Score",
  results: "Round Results",
  complete: "Tournament Complete",
};

const STEP_DESCRIPTIONS: Record<TournamentState, string> = {
  registration: "Set up your tournament and open registration for players.",
  checkin: "Players check in and select their preferred positions.",
  draw: "Generate the rink draw from checked-in players.",
  scoring: "Players play their games and scores are entered.",
  results: "Review round results and decide whether to play another round.",
  complete: "The tournament is finished. View final results and standings.",
};

const STEP_ICONS: Record<TournamentState, React.ReactNode> = {
  registration: <Users className="h-5 w-5" />,
  checkin: <ClipboardCheck className="h-5 w-5" />,
  draw: <Shuffle className="h-5 w-5" />,
  scoring: <BarChart3 className="h-5 w-5" />,
  results: <BarChart3 className="h-5 w-5" />,
  complete: <Trophy className="h-5 w-5" />,
};

const STATE_ORDER: TournamentState[] = [
  "registration",
  "checkin",
  "draw",
  "scoring",
  "results",
  "complete",
];

export function TournamentWizard({
  tournamentId,
  tournamentName,
  format,
  checkins,
  drawResult,
  onGenerateDraw,
  onFormatChange,
  renderCheckinView,
  renderBoardView,
  renderDrawView,
}: TournamentWizardProps) {
  const [progression, setProgression] = useState<ProgressionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedTab, setAdvancedTab] = useState<"checkin" | "board" | "draw">("checkin");
  const [showRedrawConfirm, setShowRedrawConfirm] = useState(false);
  const [redrawLoading, setRedrawLoading] = useState(false);
  const [rinkScores, setRinkScores] = useState<RinkScore[]>([]);
  const [standings, setStandings] = useState<PlayerStanding[]>([]);
  const [totalRoundsPlayed, setTotalRoundsPlayed] = useState(0);

  const fetchProgression = useCallback(async () => {
    try {
      const res = await fetch(`/api/bowls/progression?tournament_id=${tournamentId}`);
      if (res.ok) {
        const data: ProgressionInfo = await res.json();
        setProgression(data);
      }
    } catch {
      // Will retry on next poll
    }
    setLoading(false);
  }, [tournamentId]);

  const fetchScores = useCallback(async () => {
    if (!progression) return;
    try {
      const res = await fetch(
        `/api/bowls/scores?tournament_id=${tournamentId}&round=${progression.current_round}`
      );
      if (res.ok) {
        const data: RinkScore[] = await res.json();
        setRinkScores(data);
      }
    } catch {
      // ignore
    }
  }, [tournamentId, progression]);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`/api/bowls/results?tournament_id=${tournamentId}`);
      if (res.ok) {
        const data = await res.json();
        setStandings(data.player_standings ?? []);
        setTotalRoundsPlayed(data.total_rounds ?? 0);
      }
    } catch {
      // ignore
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchProgression();
    const interval = setInterval(fetchProgression, 5000);
    return () => clearInterval(interval);
  }, [fetchProgression]);

  useEffect(() => {
    if (progression?.current_state === "scoring" || progression?.current_state === "results") {
      fetchScores();
      fetchResults();
      const interval = setInterval(() => {
        fetchScores();
        fetchResults();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [progression?.current_state, fetchScores, fetchResults]);

  async function performAction(action: string) {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/bowls/progression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournament_id: tournamentId, action }),
      });
      if (res.ok) {
        const data: ProgressionInfo = await res.json();
        setProgression(data);
      } else {
        const err = await res.json();
        setActionError(err.error ?? "Action failed");
      }
    } catch {
      setActionError("Network error. Please try again.");
    }
    setActionLoading(false);
  }

  async function handleRedraw() {
    setRedrawLoading(true);
    try {
      await onGenerateDraw(format);
      setShowRedrawConfirm(false);
    } catch {
      setActionError("Failed to re-draw");
    }
    setRedrawLoading(false);
  }

  if (loading || !progression) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
      </div>
    );
  }

  const currentState = progression.current_state;
  const currentIndex = STATE_ORDER.indexOf(currentState);
  const stepLabels = STATE_ORDER.map((s) => STEP_LABELS[s]);

  // Re-draw guard logic
  const hasLiveScores = rinkScores.some(
    (r) => !r.is_finalized && (r.team_a_scores?.length > 0 || r.team_b_scores?.length > 0)
  );
  const canRedraw = currentState === "draw" && !hasLiveScores;

  // Finalize guard: count unfinalized rinks
  const unfinalizedRinks = rinkScores.filter((r) => !r.is_finalized);
  const allFinalized = rinkScores.length > 0 && unfinalizedRinks.length === 0;

  // Min players for format
  const playersPerRink = BOWLS_FORMAT_LABELS[format].playersPerTeam * 2;
  const hasEnoughPlayers = checkins.length >= playersPerRink;

  return (
    <div>
      {/* Step Rail */}
      <div className="mb-6 rounded-2xl bg-white border border-[#0A2E12]/10 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3D5A3E]">
            Round {progression.current_round}
          </span>
          <span className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold",
            currentState === "complete"
              ? "bg-[#0A2E12]/5 text-[#3D5A3E]"
              : "bg-[#1B5E20]/10 text-[#2E7D32]"
          )}>
            {STEP_LABELS[currentState]}
          </span>
        </div>
        <WizardStepRail steps={stepLabels} currentIndex={currentIndex} />
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentState}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="rounded-2xl bg-white border border-[#0A2E12]/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B5E20]/10 text-[#1B5E20]">
                {STEP_ICONS[currentState]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0A2E12]">
                  {STEP_LABELS[currentState]}
                </h2>
                <p className="text-sm text-[#3D5A3E]">
                  {STEP_DESCRIPTIONS[currentState]}
                </p>
              </div>
            </div>

            {/* === REGISTRATION === */}
            {currentState === "registration" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#0A2E12]/[0.03] p-4">
                  <p className="text-sm text-[#3D5A3E]">
                    <span className="font-semibold">{tournamentName}</span> is ready
                    to begin. Start check-in to allow players to register.
                  </p>
                </div>
                <CTAButton
                  label="Open Check-In"
                  loading={actionLoading}
                  onClick={() => performAction("start_checkin")}
                />
              </div>
            )}

            {/* === CHECK-IN === */}
            {currentState === "checkin" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-[#0A2E12]/[0.03] p-4">
                  <div>
                    <p className="text-2xl font-black text-[#0A2E12]">
                      {progression.checkin_count}
                    </p>
                    <p className="text-xs text-[#3D5A3E]">players checked in</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#3D5A3E]">
                      Minimum: <span className="font-semibold text-[#2D4A30]">{playersPerRink}</span> for{" "}
                      {BOWLS_FORMAT_LABELS[format].label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-[#3D5A3E]">Format:</label>
                  <select
                    value={format}
                    onChange={(e) => onFormatChange(e.target.value as BowlsGameFormat)}
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

                <CTAButton
                  label="Generate Draw"
                  loading={actionLoading}
                  disabled={!hasEnoughPlayers}
                  tooltip={
                    !hasEnoughPlayers
                      ? `Need at least ${playersPerRink} players for ${BOWLS_FORMAT_LABELS[format].label}`
                      : undefined
                  }
                  onClick={async () => {
                    await onGenerateDraw(format);
                    await performAction("generate_draw");
                  }}
                />
              </div>
            )}

            {/* === DRAW === */}
            {currentState === "draw" && (
              <div className="space-y-4">
                {drawResult && (
                  <div className="rounded-xl bg-[#0A2E12]/[0.03] p-4">
                    <p className="text-sm text-[#3D5A3E]">
                      Draw generated: <span className="font-semibold">{drawResult.rinkCount} rink{drawResult.rinkCount !== 1 ? "s" : ""}</span>{" "}
                      for {BOWLS_FORMAT_LABELS[drawResult.format].label}
                    </p>
                    {drawResult.unassigned.length > 0 && (
                      <p className="mt-1 text-xs text-amber-600">
                        {drawResult.unassigned.length} unassigned player{drawResult.unassigned.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <CTAButton
                    label="Start Scoring"
                    loading={actionLoading}
                    onClick={() => performAction("start_scoring")}
                  />
                  <button
                    onClick={() => {
                      if (canRedraw) {
                        setShowRedrawConfirm(true);
                      }
                    }}
                    disabled={!canRedraw}
                    title={
                      hasLiveScores
                        ? "Cannot re-draw while scores are in progress. Finalize or clear all scores first."
                        : undefined
                    }
                    className="rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-3 text-sm font-semibold text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Re-Draw
                  </button>
                </div>
              </div>
            )}

            {/* === SCORING === */}
            {currentState === "scoring" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#0A2E12]/[0.03] p-4">
                  <p className="text-sm text-[#3D5A3E]">
                    Round {progression.current_round} is in progress. Enter scores for
                    each rink.
                  </p>
                  {rinkScores.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {rinkScores.map((r) => (
                        <div key={r.rink} className="flex items-center justify-between text-sm">
                          <span className="text-[#3D5A3E]">Rink {r.rink}</span>
                          <span className={cn(
                            "font-medium",
                            r.is_finalized ? "text-[#1B5E20]" : "text-amber-600"
                          )}>
                            {r.is_finalized
                              ? `${r.total_a} - ${r.total_b} (Finalized)`
                              : r.team_a_scores?.length > 0
                                ? `${r.total_a} - ${r.total_b} (In progress)`
                                : "No scores yet"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <CTAButton
                  label={
                    allFinalized
                      ? "Finalize Round"
                      : `Waiting for ${unfinalizedRinks.length} rink${unfinalizedRinks.length !== 1 ? "s" : ""} to be finalized`
                  }
                  loading={actionLoading}
                  disabled={!allFinalized}
                  tooltip={
                    !allFinalized
                      ? `Waiting for ${unfinalizedRinks.length} rink${unfinalizedRinks.length !== 1 ? "s" : ""} to be finalized.`
                      : undefined
                  }
                  onClick={() => performAction("finalize_round")}
                />

                <button
                  onClick={() => {
                    if (!hasLiveScores) {
                      setShowRedrawConfirm(true);
                    }
                  }}
                  disabled={hasLiveScores}
                  title={
                    hasLiveScores
                      ? "Cannot re-draw while scores are in progress. Finalize or clear all scores first."
                      : undefined
                  }
                  className="text-sm text-[#3D5A3E] hover:text-[#3D5A3E] disabled:cursor-not-allowed disabled:hover:text-[#3D5A3E]"
                >
                  Re-Draw Round
                </button>
              </div>
            )}

            {/* === RESULTS === */}
            {currentState === "results" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#0A2E12]/[0.03] p-4">
                  <p className="text-sm text-[#3D5A3E]">
                    Round {progression.current_round} results are in. You can start
                    another round or complete the tournament.
                  </p>
                  {standings.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#3D5A3E] mb-2">
                        Top Players
                      </p>
                      {standings.slice(0, 5).map((p, i) => (
                        <div key={p.player_id} className="flex items-center justify-between text-sm py-1">
                          <span className="text-[#2D4A30]">
                            <span className="font-semibold text-[#3D5A3E] mr-2">{i + 1}.</span>
                            {p.display_name}
                          </span>
                          <span className="text-xs text-[#3D5A3E]">
                            {p.wins}W {p.losses}L {p.draws}D &middot; +{p.total_shots_for - p.total_shots_against}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* US-008: Round summary + prominent Start Next Round CTA */}
                <div className="rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SkipForward className="h-4 w-4 text-[#22c55e]" />
                    <p className="text-sm font-bold text-[#0A2E12]">
                      Round {progression.current_round} Complete
                      {rinkScores.length > 0 && (
                        <span className="font-normal text-[#3D5A3E]">
                          {" "}&mdash; {rinkScores.length} game{rinkScores.length !== 1 ? "s" : ""} played
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-[#3D5A3E] ml-6">
                    Ready to generate the draw for Round {progression.current_round + 1}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative group flex-1">
                    <button
                      onClick={() => performAction("next_round")}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-6 text-base font-bold text-white transition-colors hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed w-full shadow-lg shadow-[#22c55e]/25"
                      style={{ minHeight: "56px" }}
                    >
                      {actionLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                      Start Round {progression.current_round + 1}
                    </button>
                  </div>
                  <button
                    onClick={() => performAction("complete")}
                    disabled={actionLoading}
                    className="rounded-xl border border-[#0A2E12]/10 bg-white px-4 text-sm font-semibold text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03] disabled:opacity-50"
                    style={{ minHeight: "56px" }}
                  >
                    End Tournament
                  </button>
                </div>
              </div>
            )}

            {/* === COMPLETE === */}
            {currentState === "complete" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#1B5E20]/5 border border-[#1B5E20]/20 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="h-6 w-6 text-[#1B5E20]" />
                    <h3 className="text-lg font-bold text-[#0A2E12]">Tournament Complete</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-black text-[#1B5E20]">
                        {totalRoundsPlayed}
                      </p>
                      <p className="text-xs text-[#3D5A3E]">Rounds Played</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-[#1B5E20]">
                        {progression.checkin_count}
                      </p>
                      <p className="text-xs text-[#3D5A3E]">Total Players</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-[#1B5E20]">
                        {standings[0]?.display_name ?? "-"}
                      </p>
                      <p className="text-xs text-[#3D5A3E]">Winner</p>
                    </div>
                  </div>
                  {standings.length > 0 && (
                    <div className="mt-4 border-t border-[#1B5E20]/10 pt-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#3D5A3E] mb-2">
                        Final Standings
                      </p>
                      {standings.slice(0, 5).map((p, i) => (
                        <div key={p.player_id} className="flex items-center justify-between text-sm py-1">
                          <span className="text-[#2D4A30]">
                            <span className="font-bold text-[#1B5E20] mr-2">{i + 1}.</span>
                            {p.display_name}
                          </span>
                          <span className="text-xs text-[#3D5A3E]">
                            {p.wins}W-{p.losses}L-{p.draws}D
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error display (TWZ-14) */}
            {actionError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">{actionError}</p>
                <button
                  onClick={() => setActionError(null)}
                  className="ml-auto text-xs font-medium text-red-500 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* TWZ-15: Advanced escape hatch */}
      {currentState !== "complete" && (
        <div className="mt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-sm text-[#3D5A3E] hover:text-[#3D5A3E]"
          >
            {showAdvanced ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Advanced
          </button>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="rounded-2xl bg-white border border-[#0A2E12]/10 overflow-hidden">
                <div className="flex gap-1 p-2 border-b border-[#0A2E12]/10">
                  {(
                    [
                      { key: "checkin" as const, label: "Check In" },
                      { key: "board" as const, label: "Board" },
                      { key: "draw" as const, label: "Draw" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setAdvancedTab(tab.key)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                        advancedTab === tab.key
                          ? "bg-[#0A2E12]/5 text-[#0A2E12]"
                          : "text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03]"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  {advancedTab === "checkin" && renderCheckinView()}
                  {advancedTab === "board" && renderBoardView()}
                  {advancedTab === "draw" && renderDrawView()}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Re-draw confirmation modal (TWZ-06) */}
      <ConfirmRedrawModal
        open={showRedrawConfirm}
        round={progression.current_round}
        onConfirm={handleRedraw}
        onCancel={() => setShowRedrawConfirm(false)}
        loading={redrawLoading}
      />
    </div>
  );
}

function CTAButton({
  label,
  loading,
  disabled,
  tooltip,
  onClick,
}: {
  label: string;
  loading: boolean;
  disabled?: boolean;
  tooltip?: string;
  onClick: () => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="flex items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#145218] disabled:opacity-50 disabled:cursor-not-allowed w-full min-h-[48px]"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </button>
      {tooltip && disabled && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
          <div className="rounded-lg bg-[#0A2E12] px-3 py-2 text-xs text-white max-w-xs text-center shadow-lg">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
}
