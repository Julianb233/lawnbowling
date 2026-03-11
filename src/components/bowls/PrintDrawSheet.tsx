"use client";

import {
  BOWLS_POSITION_LABELS,
  BOWLS_FORMAT_LABELS,
} from "@/lib/types";
import type {
  BowlsTeamAssignment,
  BowlsCheckin,
  BowlsGameFormat,
  BowlsPosition,
} from "@/lib/types";
import type { MultiRoundDrawResult } from "@/lib/bowls-draw";
import { DRAW_STYLE_LABELS } from "@/lib/bowls-draw";
import type { DrawStyle } from "@/lib/bowls-draw";

interface DrawResult {
  rinks: BowlsTeamAssignment[][];
  unassigned: BowlsCheckin[];
  rinkCount: number;
  format: BowlsGameFormat;
}

interface PrintDrawSheetProps {
  drawResult?: DrawResult;
  multiRoundDraw?: MultiRoundDrawResult;
  tournamentName: string;
  round?: number;
}

function RoundSection({
  rinks,
  unassigned,
  format,
  tournamentName,
  roundNum,
  totalRounds,
  drawStyleLabel,
}: {
  rinks: BowlsTeamAssignment[][];
  unassigned: BowlsCheckin[];
  format: BowlsGameFormat;
  tournamentName: string;
  roundNum: number;
  totalRounds: number;
  drawStyleLabel?: string;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="break-after-page">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-2 mb-4">
        <h1 className="text-2xl font-black m-0">{tournamentName}</h1>
        <p className="text-base font-semibold mt-1">
          {BOWLS_FORMAT_LABELS[format].label}
          {drawStyleLabel && <> &mdash; {drawStyleLabel}</>}
          {" "}&mdash; Round {roundNum}
          {totalRounds > 1 && <> of {totalRounds}</>}
        </p>
        <p className="text-sm text-[#3D5A3E] mt-0.5">{today}</p>
      </div>

      {/* Rinks grid */}
      <div className="pds-rinks-grid">
        {rinks.map((rink, idx) => {
          const team1 = rink
            .filter((a) => a.team === 1)
            .sort(
              (a, b) =>
                BOWLS_POSITION_LABELS[b.position].order -
                BOWLS_POSITION_LABELS[a.position].order
            );
          const team2 = rink
            .filter((a) => a.team === 2)
            .sort(
              (a, b) =>
                BOWLS_POSITION_LABELS[b.position].order -
                BOWLS_POSITION_LABELS[a.position].order
            );

          return (
            <div
              key={idx}
              className="border border-black break-inside-avoid"
            >
              <div className="bg-black text-white font-bold text-sm text-center py-1 px-2">
                Rink {idx + 1}
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-[8pt] font-bold uppercase tracking-wide text-left py-1 px-1.5 border-b border-black">
                      Position
                    </th>
                    <th className="text-[8pt] font-bold uppercase tracking-wide text-left py-1 px-1.5 border-b border-black">
                      Team 1
                    </th>
                    <th className="text-[8pt] font-bold uppercase tracking-wide text-left py-1 px-1.5 border-b border-black">
                      Team 2
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {team1.map((a, i) => (
                    <tr
                      key={a.player_id}
                      className="border-b border-gray-300 last:border-b-0"
                    >
                      <td className="text-[10pt] font-bold py-1 px-1.5 w-16">
                        {BOWLS_POSITION_LABELS[a.position as BowlsPosition].label}
                      </td>
                      <td className="text-[10pt] py-1 px-1.5">
                        {a.player?.display_name ?? "TBD"}
                      </td>
                      <td className="text-[10pt] py-1 px-1.5">
                        {team2[i]?.player?.display_name ?? "TBD"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Unassigned players */}
      {unassigned.length > 0 && (
        <div className="mt-3 text-[9pt] p-1.5 border border-dashed border-gray-500">
          <strong>Bye:</strong>{" "}
          {unassigned
            .map((u) => u.player?.display_name ?? "Unknown")
            .join(", ")}
        </div>
      )}
    </div>
  );
}

export function PrintDrawSheet({
  drawResult,
  multiRoundDraw,
  tournamentName,
  round,
}: PrintDrawSheetProps) {
  // Multi-round mode: print all rounds
  if (multiRoundDraw) {
    const styleLabel = DRAW_STYLE_LABELS[multiRoundDraw.style as DrawStyle];
    return (
      <div className="print-draw-sheet hidden print:block">
        {multiRoundDraw.rounds.map((r) => (
          <RoundSection
            key={r.round}
            rinks={r.rinks}
            unassigned={r.unassigned}
            format={multiRoundDraw.format}
            tournamentName={tournamentName}
            roundNum={r.round}
            totalRounds={multiRoundDraw.totalRounds}
            drawStyleLabel={styleLabel}
          />
        ))}
      </div>
    );
  }

  // Single-round mode (backward compatible)
  if (!drawResult) return null;

  return (
    <div className="print-draw-sheet hidden print:block">
      <RoundSection
        rinks={drawResult.rinks}
        unassigned={drawResult.unassigned}
        format={drawResult.format}
        tournamentName={tournamentName}
        roundNum={round ?? 1}
        totalRounds={1}
      />
    </div>
  );
}
