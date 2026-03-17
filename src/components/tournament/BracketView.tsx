"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TournamentMatch, Player } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BracketMatch {
  id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  score: string | null;
  status: string;
  player1?: Pick<Player, "id" | "display_name" | "avatar_url"> | null;
  player2?: Pick<Player, "id" | "display_name" | "avatar_url"> | null;
}

interface BracketViewProps {
  matches: BracketMatch[];
  onReportResult?: (matchId: string) => void;
  currentPlayerId?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MATCH_HEIGHT = 72;   // px  – height of one match card
const MATCH_GAP = 16;      // px  – vertical gap between sibling matches
const ROUND_GAP = 48;      // px  – horizontal gap between rounds
const MATCH_WIDTH = 220;   // px  – width of a match card
const CONNECTOR_W = 24;    // px  – width of the horizontal connector stub

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function roundLabel(round: number, maxRound: number, totalFirstRoundMatches: number): string {
  if (round === maxRound) return "Final";
  if (round === maxRound - 1 && totalFirstRoundMatches >= 4) return "Semifinals";
  if (round === maxRound - 2 && totalFirstRoundMatches >= 8) return "Quarterfinals";
  return `Round ${round}`;
}

/** Build a map from round -> sorted matches */
function groupByRound(matches: BracketMatch[]): Map<number, BracketMatch[]> {
  const map = new Map<number, BracketMatch[]>();
  for (const m of matches) {
    const arr = map.get(m.round) ?? [];
    arr.push(m);
    map.set(m.round, arr);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => a.match_number - b.match_number);
  }
  return map;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function PlayerRow({
  player,
  isWinner,
  isLoser,
  seed,
}: {
  player?: Pick<Player, "id" | "display_name"> | null;
  isWinner: boolean;
  isLoser: boolean;
  seed?: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
        isWinner && "bg-[#1B5E20]/8 font-semibold",
        isLoser && "opacity-40",
      )}
    >
      {seed != null && (
        <span className="w-4 shrink-0 text-[10px] text-[#3D5A3E]">{seed}</span>
      )}
      <span
        className={cn(
          "truncate",
          isWinner ? "text-[#1B5E20]" : "text-[#0A2E12]",
          !player && "italic text-[#3D5A3E]/60",
        )}
      >
        {player?.display_name ?? "TBD"}
      </span>
    </div>
  );
}

function MatchCard({
  match,
  isActive,
  onReportResult,
  canReport,
}: {
  match: BracketMatch;
  isActive: boolean;
  onReportResult?: (id: string) => void;
  canReport: boolean;
}) {
  const completed = match.status === "completed";
  const p1Won = completed && match.winner_id === match.player1_id;
  const p2Won = completed && match.winner_id === match.player2_id;

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border bg-white dark:bg-[#1a3d28] shadow-sm",
        isActive
          ? "border-[#1B5E20] ring-1 ring-[#1B5E20]/30 animate-[bracket-pulse_2s_ease-in-out_infinite]"
          : "border-[#0A2E12]/10",
      )}
      style={{ width: MATCH_WIDTH, height: MATCH_HEIGHT }}
    >
      {/* Winner accent bar */}
      {completed && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1B5E20]" />
      )}

      <PlayerRow
        player={match.player1}
        isWinner={p1Won}
        isLoser={p2Won}
      />

      <div className="border-t border-[#0A2E12]/5" />

      <PlayerRow
        player={match.player2}
        isWinner={p2Won}
        isLoser={p1Won}
      />

      {/* Score badge */}
      {match.score && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-[#0A2E12]/5 px-1.5 py-0.5 text-[10px] font-medium text-[#3D5A3E]">
          {match.score}
        </div>
      )}

      {/* Report button */}
      {canReport && onReportResult && (
        <button
          onClick={() => onReportResult(match.id)}
          className="absolute bottom-0.5 right-1 rounded bg-[#1B5E20]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#1B5E20] hover:bg-[#1B5E20]/25 transition-colors"
        >
          Report
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Connector lines (CSS-drawn, no SVG)                                */
/* ------------------------------------------------------------------ */

/**
 * Draws the bracket connectors between two rounds.
 *
 * For each pair of matches in round N that feed into match M in round N+1:
 *   - horizontal stub out of each match (right side)
 *   - vertical bar connecting the two stubs
 *   - horizontal stub into the next-round match (left side)
 */
function RoundConnectors({
  matchCount,
  nextMatchCount,
  roundHeight,
}: {
  matchCount: number;
  nextMatchCount: number;
  roundHeight: number;
}) {
  if (nextMatchCount === 0) return null;

  // Each "pair" in the current round feeds one match in the next round
  const pairs = Math.min(Math.floor(matchCount / 2), nextMatchCount);
  const currentSpacing = roundHeight / matchCount;
  const nextSpacing = roundHeight / nextMatchCount;

  const lines: React.ReactNode[] = [];

  for (let i = 0; i < pairs; i++) {
    const topIdx = i * 2;
    const botIdx = i * 2 + 1;

    // Center Y of each match in current round
    const topY = currentSpacing * topIdx + currentSpacing / 2;
    const botY = currentSpacing * botIdx + currentSpacing / 2;
    // Center Y of the destination match in next round
    const destY = nextSpacing * i + nextSpacing / 2;

    // Vertical connector between the two source matches
    const minY = Math.min(topY, botY);
    const maxY = Math.max(topY, botY);

    lines.push(
      <div key={`pair-${i}`}>
        {/* Horizontal stub from top match */}
        <div
          className="absolute bg-[#0A2E12]/20"
          style={{
            left: 0,
            top: topY - 0.5,
            width: CONNECTOR_W / 2,
            height: 1,
          }}
        />
        {/* Horizontal stub from bottom match */}
        <div
          className="absolute bg-[#0A2E12]/20"
          style={{
            left: 0,
            top: botY - 0.5,
            width: CONNECTOR_W / 2,
            height: 1,
          }}
        />
        {/* Vertical bar */}
        <div
          className="absolute bg-[#0A2E12]/20"
          style={{
            left: CONNECTOR_W / 2 - 0.5,
            top: minY,
            width: 1,
            height: maxY - minY,
          }}
        />
        {/* Horizontal stub to next match */}
        <div
          className="absolute bg-[#0A2E12]/20"
          style={{
            left: CONNECTOR_W / 2,
            top: destY - 0.5,
            width: CONNECTOR_W / 2,
            height: 1,
          }}
        />
      </div>,
    );
  }

  return (
    <div
      className="relative shrink-0"
      style={{ width: CONNECTOR_W, height: roundHeight }}
    >
      {lines}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function BracketView({ matches, onReportResult, currentPlayerId }: BracketViewProps) {
  const roundMap = useMemo(() => groupByRound(matches), [matches]);
  const roundNumbers = useMemo(
    () => Array.from(roundMap.keys()).sort((a, b) => a - b),
    [roundMap],
  );

  if (matches.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-[#3D5A3E]">
        Bracket has not been generated yet.
      </div>
    );
  }

  const maxRound = Math.max(...roundNumbers);
  const firstRoundMatches = roundMap.get(roundNumbers[0])?.length ?? 1;

  // Total height is driven by the first (largest) round
  const totalHeight = firstRoundMatches * (MATCH_HEIGHT + MATCH_GAP) - MATCH_GAP;

  return (
    <>
      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes bracket-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(27,94,32,0.15); }
          50% { box-shadow: 0 0 0 4px rgba(27,94,32,0.08); }
        }
      `}</style>

      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex items-start" style={{ minWidth: roundNumbers.length * (MATCH_WIDTH + CONNECTOR_W + ROUND_GAP) }}>
          {roundNumbers.map((round, ri) => {
            const roundMatches = roundMap.get(round) ?? [];
            const nextRoundMatches = ri < roundNumbers.length - 1
              ? (roundMap.get(roundNumbers[ri + 1])?.length ?? 0)
              : 0;

            return (
              <div key={round} className="flex items-start">
                {/* Round column */}
                <div className="flex flex-col" style={{ width: MATCH_WIDTH }}>
                  {/* Round header */}
                  <h4
                    className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {roundLabel(round, maxRound, firstRoundMatches)}
                  </h4>

                  {/* Matches — evenly distributed across totalHeight */}
                  <div
                    className="flex flex-col justify-around"
                    style={{ height: totalHeight }}
                  >
                    {roundMatches.map((match) => {
                      const isActive =
                        match.status === "in_progress" ||
                        (match.status === "pending" &&
                          match.player1_id != null &&
                          match.player2_id != null);

                      const canReport =
                        match.status !== "completed" &&
                        !!currentPlayerId &&
                        (match.player1_id === currentPlayerId ||
                          match.player2_id === currentPlayerId) &&
                        match.player1_id != null &&
                        match.player2_id != null;

                      return (
                        <MatchCard
                          key={match.id}
                          match={match}
                          isActive={isActive}
                          onReportResult={onReportResult}
                          canReport={canReport}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Connectors to next round */}
                {ri < roundNumbers.length - 1 && (
                  <div className="flex items-start" style={{ paddingTop: 28 }}>
                    <RoundConnectors
                      matchCount={roundMatches.length}
                      nextMatchCount={nextRoundMatches}
                      roundHeight={totalHeight}
                    />
                  </div>
                )}

                {/* Gap between rounds */}
                {ri < roundNumbers.length - 1 && <div style={{ width: ROUND_GAP - CONNECTOR_W }} />}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
