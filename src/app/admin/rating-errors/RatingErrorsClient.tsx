"use client";

import { useState } from "react";

interface RatingError {
  id: string;
  tournament_id: string;
  error_message: string;
  error_stack: string | null;
  round: number | null;
  player_count: number | null;
  created_at: string;
}

export function RatingErrorsClient({ errors }: { errors: RatingError[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-[#0A2E12]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Rating Calculation Errors
        </h1>
        <p className="text-sm text-[#3D5A3E]">
          ELO rating failures logged during tournament finalization
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
          <p className="text-xs text-[#3D5A3E] uppercase tracking-wider">
            Total Errors
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#0A2E12]">
            {errors.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
          <p className="text-xs text-[#3D5A3E] uppercase tracking-wider">
            Last 24h
          </p>
          <p
            className={`mt-1 text-2xl font-bold tabular-nums ${
              countRecent(errors) > 0 ? "text-red-600" : "text-[#0A2E12]"
            }`}
          >
            {countRecent(errors)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5">
          <p className="text-xs text-[#3D5A3E] uppercase tracking-wider">
            Affected Tournaments
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#0A2E12]">
            {new Set(errors.map((e) => e.tournament_id)).size}
          </p>
        </div>
      </div>

      {/* Error list */}
      {errors.length === 0 ? (
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-8 text-center">
          <p className="text-[#3D5A3E]">
            No rating calculation errors. All ELO calculations are healthy.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {errors.map((error) => (
            <div
              key={error.id}
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-800">
                    {error.error_message}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-red-600">
                    <span>
                      Tournament:{" "}
                      <code className="font-mono">
                        {error.tournament_id.slice(0, 8)}...
                      </code>
                    </span>
                    {error.round != null && <span>Round {error.round}</span>}
                    <span>{formatTimestamp(error.created_at)}</span>
                  </div>
                </div>
                {error.error_stack && (
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === error.id ? null : error.id
                      )
                    }
                    className="shrink-0 rounded-lg px-2 py-1 text-xs text-red-700 hover:bg-red-100 transition-colors min-h-[44px] flex items-center"
                  >
                    {expandedId === error.id ? "Hide" : "Stack"}
                  </button>
                )}
              </div>
              {expandedId === error.id && error.error_stack && (
                <pre className="mt-3 text-xs font-mono text-red-700 bg-red-100 rounded p-3 overflow-x-auto whitespace-pre-wrap">
                  {error.error_stack}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function countRecent(errors: RatingError[]): number {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return errors.filter((e) => new Date(e.created_at).getTime() > cutoff)
    .length;
}

function formatTimestamp(value: string): string {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}
