"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TournamentFormat, TournamentBracketType } from "@/lib/types";

interface MatchData {
  id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  score: string | null;
  status: string;
  bracket?: TournamentBracketType;
  player1?: { id: string; display_name: string; avatar_url: string | null } | null;
  player2?: { id: string; display_name: string; avatar_url: string | null } | null;
}

interface TournamentBracketProps {
  matches: MatchData[];
  format: TournamentFormat;
  onReportResult?: (matchId: string) => void;
  currentPlayerId?: string;
}

function PlayerSlot({
  player,
  isWinner,
  isEmpty,
}: {
  player?: { id: string; display_name: string } | null;
  isWinner: boolean;
  isEmpty: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
        isWinner
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : isEmpty
            ? "border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] text-[#3D5A3E]"
            : "border-[#0A2E12]/10 bg-[#0A2E12]/5 text-[#3D5A3E]"
      )}
    >
      {player ? (
        <>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A2E12] text-[10px] font-bold text-[#3D5A3E]">
            {player.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="truncate">{player.display_name}</span>
        </>
      ) : (
        <span className="italic">TBD</span>
      )}
    </div>
  );
}

function EliminationBracket({ matches, onReportResult, currentPlayerId }: Omit<TournamentBracketProps, "format">) {
  const rounds = new Map<number, MatchData[]>();
  for (const match of matches) {
    const roundMatches = rounds.get(match.round) ?? [];
    roundMatches.push(match);
    rounds.set(match.round, roundMatches);
  }

  const roundNumbers = Array.from(rounds.keys()).sort((a, b) => a - b);
  const maxRound = Math.max(...roundNumbers);

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {roundNumbers.map((round) => {
        const roundMatches = rounds.get(round) ?? [];
        const label =
          round === maxRound
            ? "Final"
            : round === maxRound - 1
              ? "Semis"
              : `Round ${round}`;

        return (
          <div key={round} className="flex flex-col gap-2">
            <h4 className="mb-2 text-center text-xs font-semibold uppercase text-[#3D5A3E]">
              {label}
            </h4>
            <div
              className="flex flex-col justify-around gap-4"
              style={{ minHeight: `${roundMatches.length * 100}px` }}
            >
              {roundMatches.map((match) => {
                const canReport =
                  match.status !== "completed" &&
                  currentPlayerId &&
                  (match.player1_id === currentPlayerId || match.player2_id === currentPlayerId) &&
                  match.player1_id &&
                  match.player2_id;

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex w-48 flex-col gap-1"
                  >
                    <PlayerSlot
                      player={match.player1}
                      isWinner={match.winner_id === match.player1_id && !!match.winner_id}
                      isEmpty={!match.player1_id}
                    />
                    <div className="px-2 text-center text-[10px] text-[#3D5A3E]">
                      {match.score ?? "vs"}
                    </div>
                    <PlayerSlot
                      player={match.player2}
                      isWinner={match.winner_id === match.player2_id && !!match.winner_id}
                      isEmpty={!match.player2_id}
                    />
                    {canReport && onReportResult && (
                      <button
                        onClick={() => onReportResult(match.id)}
                        className="mt-1 rounded-lg bg-[#1B5E20]/20 px-2 py-1 text-xs font-medium text-[#1B5E20] hover:bg-[#1B5E20]/30"
                      >
                        Report Result
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoundRobinBracket({ matches, onReportResult, currentPlayerId }: Omit<TournamentBracketProps, "format">) {
  // Group matches by round
  const rounds = new Map<number, MatchData[]>();
  for (const match of matches) {
    const roundMatches = rounds.get(match.round) ?? [];
    roundMatches.push(match);
    rounds.set(match.round, roundMatches);
  }
  const roundNumbers = Array.from(rounds.keys()).sort((a, b) => a - b);

  // Progress tracking
  const completed = matches.filter((m) => m.status === "completed").length;
  const total = matches.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-[#2D4A30]">Tournament Progress</span>
          <span className="text-[#3D5A3E]">{completed}/{total} matches played</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#0A2E12]/5">
          <motion.div
            className="h-full rounded-full bg-[#1B5E20]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Rounds */}
      {roundNumbers.map((roundNum) => {
        const roundMatches = rounds.get(roundNum) ?? [];
        const roundComplete = roundMatches.every((m) => m.status === "completed");

        return (
          <div key={roundNum}>
            <div className="mb-3 flex items-center gap-2">
              <h4 className="text-sm font-semibold text-[#2D4A30]">Round {roundNum}</h4>
              {roundComplete && (
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-500">
                  Complete
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {roundMatches.map((match) => {
                const canReport =
                  match.status !== "completed" &&
                  currentPlayerId &&
                  (match.player1_id === currentPlayerId || match.player2_id === currentPlayerId);
                const p1Won = match.winner_id === match.player1_id && !!match.winner_id;
                const p2Won = match.winner_id === match.player2_id && !!match.winner_id;

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "rounded-xl border p-3 transition-colors",
                      match.status === "completed"
                        ? "border-[#0A2E12]/10 bg-[#0A2E12]/[0.03]"
                        : "border-[#0A2E12]/10 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 space-y-1.5">
                        <div className={cn(
                          "flex items-center gap-2 text-sm font-medium",
                          p1Won ? "text-[#1B5E20]" : "text-[#2D4A30]"
                        )}>
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A2E12]/5 text-[10px] font-bold text-[#3D5A3E]">
                            {match.player1?.display_name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span className="truncate">{match.player1?.display_name ?? "TBD"}</span>
                          {p1Won && <span className="text-[#1B5E20]">W</span>}
                        </div>
                        <div className={cn(
                          "flex items-center gap-2 text-sm font-medium",
                          p2Won ? "text-[#1B5E20]" : "text-[#2D4A30]"
                        )}>
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A2E12]/5 text-[10px] font-bold text-[#3D5A3E]">
                            {match.player2?.display_name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span className="truncate">{match.player2?.display_name ?? "TBD"}</span>
                          {p2Won && <span className="text-[#1B5E20]">W</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {match.score && (
                          <span className="text-xs font-medium text-[#3D5A3E]">{match.score}</span>
                        )}
                        {canReport && onReportResult ? (
                          <button
                            onClick={() => onReportResult(match.id)}
                            className="rounded-lg bg-[#1B5E20]/20 px-2.5 py-1 text-xs font-medium text-[#1B5E20] hover:bg-[#1B5E20]/30"
                          >
                            Report
                          </button>
                        ) : (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium",
                              match.status === "completed"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-[#0A2E12]/5 text-[#3D5A3E]"
                            )}
                          >
                            {match.status === "completed" ? "Done" : "Pending"}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DoubleEliminationBracket({ matches, onReportResult, currentPlayerId }: Omit<TournamentBracketProps, "format">) {
  const [activeBracket, setActiveBracket] = useState<"winners" | "losers" | "grand_final">("winners");
  const winnerMatches = matches.filter((m) => m.bracket === "winners");
  const loserMatches = matches.filter((m) => m.bracket === "losers");
  const grandFinal = matches.filter((m) => m.bracket === "grand_final");
  const bracketTabs: { key: typeof activeBracket; label: string; count: number }[] = [
    { key: "winners", label: "Winners", count: winnerMatches.length },
    { key: "losers", label: "Losers", count: loserMatches.length },
    { key: "grand_final", label: "Grand Final", count: grandFinal.length },
  ];
  const activeMatches = activeBracket === "winners" ? winnerMatches : activeBracket === "losers" ? loserMatches : grandFinal;
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {bracketTabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveBracket(tab.key)} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors", activeBracket === tab.key ? "bg-[#0A2E12] text-white" : "bg-[#0A2E12]/5 text-[#3D5A3E] hover:bg-[#0A2E12]/5")}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
      <EliminationBracket matches={activeMatches} onReportResult={onReportResult} currentPlayerId={currentPlayerId} />
    </div>
  );
}

export function TournamentBracket({ matches, format, onReportResult, currentPlayerId }: TournamentBracketProps) {
  if (matches.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[#3D5A3E]">
        Bracket has not been generated yet
      </div>
    );
  }

  if (format === "round_robin") {
    return <RoundRobinBracket matches={matches} onReportResult={onReportResult} currentPlayerId={currentPlayerId} />;
  }

  if (format === "double_elimination") {
    return <DoubleEliminationBracket matches={matches} onReportResult={onReportResult} currentPlayerId={currentPlayerId} />;
  }

  return <EliminationBracket matches={matches} onReportResult={onReportResult} currentPlayerId={currentPlayerId} />;
}
