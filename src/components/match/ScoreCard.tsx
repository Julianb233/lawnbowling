"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface EndScore {
  endNumber: number;
  team1Shots: number;
  team2Shots: number;
}

interface ScoreCardProps {
  team1Name: string;
  team2Name: string;
  ends: EndScore[];
  currentEnd?: number;
}

export function ScoreCard({
  team1Name,
  team2Name,
  ends,
  currentEnd,
}: ScoreCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest end
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [ends.length]);

  // Calculate running totals
  let team1Running = 0;
  let team2Running = 0;
  const endsWithTotals = ends.map((end) => {
    team1Running += end.team1Shots;
    team2Running += end.team2Shots;
    return {
      ...end,
      team1Total: team1Running,
      team2Total: team2Running,
    };
  });

  const team1Total = team1Running;
  const team2Total = team2Running;

  if (ends.length === 0) {
    return (
      <div
        className="rounded-2xl bg-white/80 p-6 text-center"
        style={{
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(10,46,18,0.1)",
        }}
      >
        <p className="text-base" style={{ color: "#3D5A3E" }}>
          No ends played yet. Tap &quot;Add End&quot; to start scoring.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-white/80 overflow-hidden"
      style={{
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(10,46,18,0.1)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3"
        style={{ backgroundColor: "rgba(10,46,18,0.04)" }}
      >
        <h4
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: "#0A2E12", fontFamily: "var(--font-display)" }}
        >
          Scorecard
        </h4>
      </div>

      {/* Scrollable table */}
      <div ref={scrollRef} className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(10,46,18,0.1)" }}>
              <th
                className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-sm font-semibold"
                style={{ color: "#3D5A3E", minWidth: "100px" }}
              >
                End
              </th>
              {endsWithTotals.map((end) => (
                <th
                  key={end.endNumber}
                  className="px-3 py-3 text-center text-sm font-semibold"
                  style={{
                    color:
                      currentEnd === end.endNumber ? "#1B5E20" : "#3D5A3E",
                    backgroundColor:
                      currentEnd === end.endNumber
                        ? "rgba(27,94,32,0.06)"
                        : "transparent",
                    minWidth: "48px",
                  }}
                >
                  {end.endNumber}
                </th>
              ))}
              <th
                className="sticky right-0 z-10 bg-white px-4 py-3 text-center text-sm font-bold"
                style={{ color: "#0A2E12", minWidth: "60px" }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Team 1 row */}
            <tr
              style={{
                backgroundColor: "rgba(27,94,32,0.03)",
                borderBottom: "1px solid rgba(10,46,18,0.06)",
              }}
            >
              <td
                className="sticky left-0 z-10 px-4 py-3 text-sm font-bold"
                style={{
                  color: "#0A2E12",
                  backgroundColor: "rgba(27,94,32,0.03)",
                }}
              >
                {team1Name}
              </td>
              {endsWithTotals.map((end) => (
                <td
                  key={end.endNumber}
                  className="px-3 py-3 text-center"
                  style={{
                    backgroundColor:
                      currentEnd === end.endNumber
                        ? "rgba(27,94,32,0.06)"
                        : "transparent",
                  }}
                >
                  <motion.span
                    key={`t1-${end.endNumber}-${end.team1Shots}`}
                    initial={{ scale: 1.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-block text-base font-semibold tabular-nums"
                    style={{
                      color: end.team1Shots > 0 ? "#1B5E20" : "#9CA3AF",
                    }}
                  >
                    {end.team1Shots > 0 ? end.team1Shots : "-"}
                  </motion.span>
                </td>
              ))}
              <td
                className="sticky right-0 z-10 px-4 py-3 text-center text-lg font-bold tabular-nums"
                style={{
                  color: "#0A2E12",
                  backgroundColor: "rgba(27,94,32,0.03)",
                }}
              >
                {team1Total}
              </td>
            </tr>

            {/* Team 2 row */}
            <tr>
              <td
                className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-bold"
                style={{ color: "#0A2E12" }}
              >
                {team2Name}
              </td>
              {endsWithTotals.map((end) => (
                <td
                  key={end.endNumber}
                  className="px-3 py-3 text-center"
                  style={{
                    backgroundColor:
                      currentEnd === end.endNumber
                        ? "rgba(27,94,32,0.06)"
                        : "transparent",
                  }}
                >
                  <motion.span
                    key={`t2-${end.endNumber}-${end.team2Shots}`}
                    initial={{ scale: 1.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-block text-base font-semibold tabular-nums"
                    style={{
                      color: end.team2Shots > 0 ? "#1B5E20" : "#9CA3AF",
                    }}
                  >
                    {end.team2Shots > 0 ? end.team2Shots : "-"}
                  </motion.span>
                </td>
              ))}
              <td
                className="sticky right-0 z-10 bg-white px-4 py-3 text-center text-lg font-bold tabular-nums"
                style={{ color: "#0A2E12" }}
              >
                {team2Total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Running totals strip */}
      <div
        className="flex items-center justify-between px-4 py-3 text-xs font-medium"
        style={{
          backgroundColor: "rgba(10,46,18,0.04)",
          borderTop: "1px solid rgba(10,46,18,0.08)",
          color: "#3D5A3E",
        }}
      >
        <span>{ends.length} end{ends.length !== 1 ? "s" : ""} played</span>
        <span>
          {team1Total > team2Total
            ? `${team1Name} leads by ${team1Total - team2Total}`
            : team2Total > team1Total
              ? `${team2Name} leads by ${team2Total - team1Total}`
              : "Scores level"}
        </span>
      </div>
    </div>
  );
}
