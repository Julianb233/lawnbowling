"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import {
  useRealtimeMatches,
  useRealtimeScores,
  type ConnectionStatus,
} from "@/lib/hooks/use-realtime";
import type { Match, TournamentScore } from "@/lib/types";

// ---------------------------------------------------------------------------
// Connection indicator
// ---------------------------------------------------------------------------

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const config: Record<
    ConnectionStatus,
    { icon: typeof Wifi; label: string; color: string; bg: string; pulse: boolean }
  > = {
    connected: {
      icon: Wifi,
      label: "Live",
      color: "#1B5E20",
      bg: "rgba(27,94,32,0.10)",
      pulse: true,
    },
    reconnecting: {
      icon: Loader2,
      label: "Reconnecting",
      color: "#E65100",
      bg: "rgba(230,81,0,0.10)",
      pulse: false,
    },
    disconnected: {
      icon: WifiOff,
      label: "Offline",
      color: "#B71C1C",
      bg: "rgba(183,28,28,0.10)",
      pulse: false,
    },
  };

  const { icon: Icon, label, color, bg, pulse } = config[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: bg, color }}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: color }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        </span>
      )}
      <Icon
        className={`h-3 w-3 ${status === "reconnecting" ? "animate-spin" : ""}`}
      />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Score display for a single rink/match
// ---------------------------------------------------------------------------

function ScoreRow({ score }: { score: TournamentScore }) {
  const teamANames = score.team_a_players
    .map((p) => p.display_name)
    .join(", ");
  const teamBNames = score.team_b_players
    .map((p) => p.display_name)
    .join(", ");

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white border border-[#0A2E12]/10 p-3 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#3D5A3E] truncate">
          Rink {score.rink}
        </p>
        <p className="text-sm font-semibold text-[#0A2E12] truncate">
          {teamANames || "Team A"}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <AnimatePresence mode="wait">
          <motion.span
            key={score.total_a}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="text-lg font-bold tabular-nums text-[#1B5E20]"
          >
            {score.total_a}
          </motion.span>
        </AnimatePresence>
        <span className="text-xs text-[#3D5A3E]/50">-</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={score.total_b}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="text-lg font-bold tabular-nums text-[#1B5E20]"
          >
            {score.total_b}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex-1 min-w-0 text-right">
        <p className="text-xs font-medium text-[#3D5A3E] truncate">
          End {score.team_a_scores.length}
        </p>
        <p className="text-sm font-semibold text-[#0A2E12] truncate">
          {teamBNames || "Team B"}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Match status badge
// ---------------------------------------------------------------------------

function MatchStatusBadge({ status }: { status: Match["status"] }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    queued: { bg: "rgba(13,71,161,0.10)", text: "#0D47A1", label: "Queued" },
    playing: { bg: "rgba(27,94,32,0.10)", text: "#1B5E20", label: "Playing" },
    completed: { bg: "rgba(61,90,62,0.10)", text: "#3D5A3E", label: "Completed" },
  };

  const s = styles[status] ?? styles.queued;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status === "playing" && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: s.text }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: s.text }}
          />
        </span>
      )}
      {s.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// LiveMatchStatus — main component
// ---------------------------------------------------------------------------

interface LiveMatchStatusProps {
  /** Tournament or venue ID to subscribe to match updates */
  tournamentId: string;
  /** Optional: subscribe to scores for a specific tournament */
  scoresTournamentId?: string;
}

export function LiveMatchStatus({
  tournamentId,
  scoresTournamentId,
}: LiveMatchStatusProps) {
  const {
    matches,
    loading: matchesLoading,
    connectionStatus: matchConnectionStatus,
  } = useRealtimeMatches(tournamentId);

  const {
    scores,
    loading: scoresLoading,
    connectionStatus: scoreConnectionStatus,
  } = useRealtimeScores(scoresTournamentId ?? null);

  // Use the "best" connection status
  const connectionStatus: ConnectionStatus =
    matchConnectionStatus === "connected" || scoreConnectionStatus === "connected"
      ? "connected"
      : matchConnectionStatus === "reconnecting" || scoreConnectionStatus === "reconnecting"
        ? "reconnecting"
        : "disconnected";

  const activeMatches = matches.filter((m) => m.status === "playing");
  const queuedMatches = matches.filter((m) => m.status === "queued");

  const loading = matchesLoading || scoresLoading;

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-[#0A2E12]/10" />
          <div className="h-5 w-16 rounded-full bg-[#0A2E12]/10" />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-[#0A2E12]/5 border border-[#0A2E12]/10"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with connection badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3D5A3E]">
          Match Status
        </h3>
        <ConnectionBadge status={connectionStatus} />
      </div>

      {/* Active matches */}
      {activeMatches.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#1B5E20]">
            In Progress ({activeMatches.length})
          </p>
          <AnimatePresence mode="popLayout">
            {activeMatches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between rounded-xl bg-white border border-[#1B5E20]/20 p-3 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0A2E12]">
                    Match #{match.id.slice(0, 6)}
                  </p>
                  {match.started_at && (
                    <p className="text-xs text-[#3D5A3E]">
                      Started{" "}
                      {new Date(match.started_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
                <MatchStatusBadge status={match.status} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Queued matches */}
      {queuedMatches.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#3D5A3E]">
            Up Next ({queuedMatches.length})
          </p>
          {queuedMatches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between rounded-xl bg-white border border-[#0A2E12]/10 p-3 shadow-sm"
            >
              <p className="text-sm text-[#3D5A3E]">
                Match #{match.id.slice(0, 6)}
              </p>
              <MatchStatusBadge status={match.status} />
            </div>
          ))}
        </div>
      )}

      {/* Live scores */}
      {scores.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#1B5E20]">Live Scores</p>
          <AnimatePresence mode="popLayout">
            {scores.map((score) => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <ScoreRow score={score} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {matches.length === 0 && scores.length === 0 && (
        <div className="text-center py-8 rounded-xl bg-white border border-dashed border-[#0A2E12]/15">
          <p className="text-sm font-medium text-[#3D5A3E]">
            No active matches
          </p>
          <p className="text-xs text-[#3D5A3E]/60 mt-1">
            Scores will appear here when matches begin.
          </p>
        </div>
      )}
    </div>
  );
}
