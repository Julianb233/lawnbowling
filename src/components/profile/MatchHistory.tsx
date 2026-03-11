"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, X, Minus, ChevronDown, Clock } from "lucide-react";

interface MatchEntry {
  id: string;
  tournament_id: string;
  tournament_name: string;
  tournament_format: string;
  round: number;
  rink: number;
  date: string;
  player_score: number;
  opponent_score: number;
  result: "win" | "loss" | "draw";
  teammates: { id: string; name: string }[];
  opponents: { id: string; name: string }[];
}

interface MatchHistoryProps {
  playerId: string;
}

export function MatchHistory({ playerId }: MatchHistoryProps) {
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/profile/${playerId}/matches?limit=20`);
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches);
          setTotal(data.total);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [playerId]);

  if (loading) {
    return (
      <div>
        <h2 className="mb-2 text-sm font-medium text-zinc-600">Match History</h2>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center">
          <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-[#1B5E20] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div>
        <h2 className="mb-2 text-sm font-medium text-zinc-600">Match History</h2>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center">
          <Clock className="mx-auto mb-1 h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-500">No matches played yet</p>
        </div>
      </div>
    );
  }

  const displayMatches = expanded ? matches : matches.slice(0, 5);

  return (
    <div>
      <h2 className="mb-2 text-sm font-medium text-zinc-600">
        Match History
        <span className="ml-1 text-zinc-400">({total})</span>
      </h2>

      <div className="space-y-2">
        {displayMatches.map((match) => {
          const resultColor =
            match.result === "win"
              ? "border-l-[#1B5E20] bg-green-50/50"
              : match.result === "loss"
                ? "border-l-red-400 bg-red-50/30"
                : "border-l-zinc-300 bg-zinc-50";

          const ResultIcon =
            match.result === "win"
              ? Trophy
              : match.result === "loss"
                ? X
                : Minus;

          const resultIconColor =
            match.result === "win"
              ? "text-[#1B5E20]"
              : match.result === "loss"
                ? "text-red-400"
                : "text-zinc-400";

          const resultLabel =
            match.result === "win"
              ? "W"
              : match.result === "loss"
                ? "L"
                : "D";

          return (
            <div
              key={match.id}
              className={`rounded-xl border border-zinc-200 border-l-4 p-3 ${resultColor}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/bowls/${match.tournament_id}/results`}
                    className="text-sm font-semibold text-zinc-900 hover:text-[#1B5E20] truncate block"
                  >
                    {match.tournament_name}
                  </Link>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Round {match.round}, Rink {match.rink}
                    {" \u00B7 "}
                    {new Date(match.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-zinc-900">
                    {match.player_score} - {match.opponent_score}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${
                      match.result === "win"
                        ? "bg-[#1B5E20]/10 text-[#1B5E20]"
                        : match.result === "loss"
                          ? "bg-red-100 text-red-600"
                          : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    <ResultIcon className={`h-3 w-3 ${resultIconColor}`} />
                    {resultLabel}
                  </span>
                </div>
              </div>

              {(match.teammates.length > 0 || match.opponents.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                  {match.teammates.length > 0 && (
                    <span>
                      w/{" "}
                      {match.teammates.map((t) => t.name).join(", ")}
                    </span>
                  )}
                  {match.opponents.length > 0 && (
                    <span>
                      vs{" "}
                      {match.opponents.map((o) => o.name).join(", ")}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {matches.length > 5 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 min-h-[40px]"
        >
          <ChevronDown className="h-4 w-4" />
          View All ({total})
        </button>
      )}
    </div>
  );
}
