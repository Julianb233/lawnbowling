"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Minus, Plus } from "lucide-react";

interface ScoreEntryProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (team: 1 | 2, shots: number) => void;
  team1Name: string;
  team2Name: string;
  endNumber: number;
}

export function ScoreEntry({
  open,
  onClose,
  onSubmit,
  team1Name,
  team2Name,
  endNumber,
}: ScoreEntryProps) {
  const [selectedTeam, setSelectedTeam] = useState<1 | 2>(1);
  const [shots, setShots] = useState(1);

  function handleSubmit() {
    onSubmit(selectedTeam, shots);
    setSelectedTeam(1);
    setShots(1);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
            style={{ border: "1px solid rgba(10,46,18,0.1)" }}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h3
                className="text-xl font-bold"
                style={{ color: "#0A2E12", fontFamily: "var(--font-display)" }}
              >
                End {endNumber}
              </h3>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" style={{ color: "#3D5A3E" }} />
              </button>
            </div>

            {/* Team Selection */}
            <div className="mb-6">
              <p
                className="mb-3 text-sm font-semibold"
                style={{ color: "#3D5A3E" }}
              >
                Who scored this end?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { team: 1 as const, name: team1Name },
                  { team: 2 as const, name: team2Name },
                ].map(({ team, name }) => (
                  <button
                    key={team}
                    onClick={() => setSelectedTeam(team)}
                    className="rounded-2xl p-4 text-center transition-all"
                    style={{
                      minHeight: "64px",
                      backgroundColor:
                        selectedTeam === team
                          ? "rgba(27,94,32,0.12)"
                          : "rgba(10,46,18,0.04)",
                      border:
                        selectedTeam === team
                          ? "2px solid #1B5E20"
                          : "2px solid transparent",
                      color: selectedTeam === team ? "#1B5E20" : "#3D5A3E",
                    }}
                  >
                    <span className="block text-base font-bold">{name}</span>
                    <span className="block text-xs mt-1 opacity-70">
                      {team === 1 ? "Team 1" : "Team 2"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shots Picker */}
            <div className="mb-8">
              <p
                className="mb-3 text-sm font-semibold"
                style={{ color: "#3D5A3E" }}
              >
                How many shots?
              </p>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setShots(Math.max(1, shots - 1))}
                  disabled={shots <= 1}
                  className="flex h-14 w-14 items-center justify-center rounded-full transition disabled:opacity-30"
                  style={{
                    backgroundColor: "rgba(10,46,18,0.06)",
                    color: "#0A2E12",
                  }}
                  aria-label="Decrease shots"
                >
                  <Minus className="h-6 w-6" />
                </button>

                <motion.span
                  key={shots}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-bold tabular-nums"
                  style={{ color: "#1B5E20", fontFamily: "var(--font-display)" }}
                >
                  {shots}
                </motion.span>

                <button
                  onClick={() => setShots(Math.min(8, shots + 1))}
                  disabled={shots >= 8}
                  className="flex h-14 w-14 items-center justify-center rounded-full transition disabled:opacity-30"
                  style={{
                    backgroundColor: "rgba(10,46,18,0.06)",
                    color: "#0A2E12",
                  }}
                  aria-label="Increase shots"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>

              {/* Quick select buttons */}
              <div className="mt-4 flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setShots(n)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition"
                    style={{
                      backgroundColor:
                        shots === n
                          ? "#1B5E20"
                          : "rgba(10,46,18,0.06)",
                      color: shots === n ? "#fff" : "#3D5A3E",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm */}
            <button
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold text-white transition hover:opacity-90"
              style={{
                backgroundColor: "#1B5E20",
                minHeight: "56px",
              }}
            >
              <Check className="h-5 w-5" />
              Confirm End {endNumber}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
