"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Clock, CheckCircle2 } from "lucide-react";
import type { TournamentFormat } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MatchData {
  id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  score: string | null;
  status: string;
  bracket?: string;
  player1?: { id: string; display_name: string; avatar_url: string | null } | null;
  player2?: { id: string; display_name: string; avatar_url: string | null } | null;
}

interface LiveBracketSlideProps {
  matches: MatchData[];
  format: TournamentFormat;
  currentRound: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MATCH_W = "clamp(11rem, 16vw, 16rem)";
const MATCH_H = "clamp(4.5rem, 6vh, 5.5rem)";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function roundLabel(round: number, maxRound: number): string {
  if (round === maxRound) return "Final";
  if (round === maxRound - 1) return "Semifinals";
  if (round === maxRound - 2) return "Quarterfinals";
  return `Round ${round}`;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TVPlayerSlot({
  name,
  isWinner,
  isLoser,
  color,
}: {
  name: string;
  isWinner: boolean;
  isLoser: boolean;
  color: "top" | "bottom";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-[clamp(0.5rem,1vw,0.75rem)] transition-all",
        isWinner && "bg-emerald-500/15",
        isLoser && "opacity-40",
      )}
      style={{ height: `calc(${MATCH_H} / 2)` }}
    >
      <div className="flex items-center gap-[clamp(0.25rem,0.5vw,0.5rem)] min-w-0">
        <div
          className={cn(
            "shrink-0 rounded-full",
            color === "top" ? "bg-emerald-500" : "bg-blue-500",
          )}
          style={{
            width: "clamp(0.4rem, 0.6vw, 0.5rem)",
            height: "clamp(0.4rem, 0.6vw, 0.5rem)",
          }}
        />
        <span
          className={cn(
            "truncate font-medium",
            isWinner ? "text-emerald-400" : "text-white",
          )}
          style={{ fontSize: "clamp(0.6rem, 1vw, 0.875rem)" }}
        >
          {name}
        </span>
      </div>
      {isWinner && (
        <CheckCircle2
          className="shrink-0 text-emerald-400"
          style={{ width: "clamp(0.75rem, 1vw, 1rem)", height: "clamp(0.75rem, 1vw, 1rem)" }}
        />
      )}
    </div>
  );
}

function TVMatchCard({ match }: { match: MatchData }) {
  const isInProgress = match.status === "in_progress";
  const isCompleted = match.status === "completed";
  const p1Won = isCompleted && match.winner_id === match.player1_id;
  const p2Won = isCompleted && match.winner_id === match.player2_id;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border",
        isInProgress
          ? "border-amber-500/50 ring-1 ring-amber-500/20"
          : isCompleted
            ? "border-emerald-500/30"
            : "border-white/10",
        "bg-[#0A2E12]",
      )}
      style={{ width: MATCH_W, height: MATCH_H }}
    >
      {/* Left accent bar */}
      {isCompleted && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500" />
      )}
      {isInProgress && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500 animate-pulse" />
      )}

      {/* Status badge */}
      <div className="absolute right-[clamp(0.25rem,0.5vw,0.5rem)] top-[clamp(0.15rem,0.3vh,0.25rem)]">
        {isInProgress && (
          <span
            className="flex items-center gap-1 rounded-full bg-amber-500/20 px-1.5 py-0.5 font-bold text-amber-400"
            style={{ fontSize: "clamp(0.4rem, 0.6vw, 0.55rem)" }}
          >
            <Clock style={{ width: "clamp(0.5rem, 0.6vw, 0.6rem)", height: "clamp(0.5rem, 0.6vw, 0.6rem)" }} />
            LIVE
          </span>
        )}
        {isCompleted && match.score && (
          <span
            className="rounded bg-white/5 px-1.5 py-0.5 font-medium text-[#a8c8b4] tabular-nums"
            style={{ fontSize: "clamp(0.4rem, 0.6vw, 0.55rem)" }}
          >
            {match.score}
          </span>
        )}
      </div>

      <TVPlayerSlot
        name={match.player1?.display_name ?? "TBD"}
        isWinner={p1Won}
        isLoser={p2Won}
        color="top"
      />
      <div className="border-t border-white/5" />
      <TVPlayerSlot
        name={match.player2?.display_name ?? "TBD"}
        isWinner={p2Won}
        isLoser={p1Won}
        color="bottom"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function LiveBracketSlide({ matches, format, currentRound }: LiveBracketSlideProps) {
  const roundMap = useMemo(() => {
    const map = new Map<number, MatchData[]>();
    for (const m of matches) {
      const arr = map.get(m.round) ?? [];
      arr.push(m);
      map.set(m.round, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.match_number - b.match_number);
    }
    return map;
  }, [matches]);

  const roundNumbers = useMemo(
    () => Array.from(roundMap.keys()).sort((a, b) => a - b),
    [roundMap],
  );

  if (matches.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Trophy
            className="mx-auto mb-4 text-[#3D5A3E]"
            style={{ width: "clamp(3rem, 6vw, 5rem)", height: "clamp(3rem, 6vw, 5rem)" }}
          />
          <h3
            className="font-black text-[#3D5A3E]"
            style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}
          >
            Bracket Not Generated
          </h3>
          <p className="mt-2 text-[#3D5A3E]" style={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)" }}>
            Waiting for the tournament to start...
          </p>
        </div>
      </div>
    );
  }

  const maxRound = Math.max(...roundNumbers);

  return (
    <div className="flex h-full flex-col">
      <h2
        className="mb-[clamp(0.5rem,1vh,1rem)] font-black uppercase tracking-wider text-emerald-400"
        style={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)" }}
      >
        Tournament Bracket — {format === "round_robin" ? "Round Robin" : "Elimination"}
      </h2>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div
          className="flex items-start gap-[clamp(0.5rem,1vw,1rem)]"
          style={{ minHeight: "100%" }}
        >
          {roundNumbers.map((round) => {
            const roundMatches = roundMap.get(round) ?? [];
            const isCurrentRound = round === currentRound;

            return (
              <div key={round} className="flex flex-col shrink-0">
                <h4
                  className={cn(
                    "mb-[clamp(0.4rem,0.8vh,0.75rem)] text-center font-semibold uppercase tracking-wider",
                    isCurrentRound ? "text-emerald-400" : "text-[#3D5A3E]",
                  )}
                  style={{ fontSize: "clamp(0.55rem, 0.9vw, 0.75rem)" }}
                >
                  {roundLabel(round, maxRound)}
                  {isCurrentRound && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <span className="live-dot" style={{ width: 6, height: 6 }} />
                    </span>
                  )}
                </h4>

                <div className="flex flex-col justify-around gap-[clamp(0.5rem,1vh,0.75rem)] flex-1">
                  {roundMatches.map((match) => (
                    <TVMatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
