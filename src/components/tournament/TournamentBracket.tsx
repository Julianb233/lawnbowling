"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TournamentFormat } from "@/lib/types";

interface MatchData {
  id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  score: string | null;
  status: string;
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
            ? "border-zinc-200 bg-zinc-50 text-zinc-600"
            : "border-zinc-200 bg-zinc-100 text-zinc-600"
      )}
    >
      {player ? (
        <>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-bold text-zinc-600">
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
            <h4 className="mb-2 text-center text-xs font-semibold uppercase text-zinc-500">
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
                    <div className="px-2 text-center text-[10px] text-zinc-600">
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
                        className="mt-1 rounded-lg bg-emerald-600/20 px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30"
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
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">#</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Player 1</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase text-zinc-500">Score</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Player 2</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase text-zinc-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => {
            const canReport =
              match.status !== "completed" &&
              currentPlayerId &&
              (match.player1_id === currentPlayerId || match.player2_id === currentPlayerId);

            return (
              <tr key={match.id} className="border-b border-zinc-200/50 hover:bg-zinc-50">
                <td className="px-4 py-3 text-sm text-zinc-500">{match.match_number}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      match.winner_id === match.player1_id ? "text-green-400" : "text-zinc-600"
                    )}
                  >
                    {match.player1?.display_name ?? "TBD"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-zinc-400">
                  {match.score ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      match.winner_id === match.player2_id ? "text-green-400" : "text-zinc-600"
                    )}
                  >
                    {match.player2?.display_name ?? "TBD"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {canReport && onReportResult ? (
                    <button
                      onClick={() => onReportResult(match.id)}
                      className="rounded-lg bg-emerald-600/20 px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30"
                    >
                      Report
                    </button>
                  ) : (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        match.status === "completed"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-zinc-700/50 text-zinc-500"
                      )}
                    >
                      {match.status === "completed" ? "Done" : "Pending"}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TournamentBracket({ matches, format, onReportResult, currentPlayerId }: TournamentBracketProps) {
  if (matches.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500">
        Bracket has not been generated yet
      </div>
    );
  }

  if (format === "round_robin") {
    return <RoundRobinBracket matches={matches} onReportResult={onReportResult} currentPlayerId={currentPlayerId} />;
  }

  return <EliminationBracket matches={matches} onReportResult={onReportResult} currentPlayerId={currentPlayerId} />;
}
