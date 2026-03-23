"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  onReported: () => void;
}

export function ReportResultModal({ open, onOpenChange, matchId, onReported }: ReportResultModalProps) {
  const [winnerTeam, setWinnerTeam] = useState<1 | 2 | null>(null);
  const [team1Score, setTeam1Score] = useState("");
  const [team2Score, setTeam2Score] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/matches/${matchId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winner_team: winnerTeam,
          team1_score: team1Score ? parseInt(team1Score) : null,
          team2_score: team2Score ? parseInt(team2Score) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to report");
      }

      onOpenChange(false);
      onReported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-[#0A2E12]">
              Report Result
            </Dialog.Title>
            <Dialog.Close aria-label="Close dialog" className="rounded-full p-1 text-[#3D5A3E] hover:bg-[#0A2E12]/5 hover:text-[#2D4A30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Winner selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#3D5A3E]">Who won?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWinnerTeam(1)}
                  className={cn(
                    "rounded-xl border p-4 text-center transition-all",
                    winnerTeam === 1
                      ? "border-[#1B5E20] bg-[#1B5E20]/10 text-blue-400"
                      : "border-[#0A2E12]/10 bg-[#0A2E12]/5 text-[#3D5A3E] hover:border-[#0A2E12]/10"
                  )}
                >
                  <Trophy className="mx-auto mb-1 h-5 w-5" />
                  <span className="text-sm font-semibold">Team 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWinnerTeam(2)}
                  className={cn(
                    "rounded-xl border p-4 text-center transition-all",
                    winnerTeam === 2
                      ? "border-red-500 bg-red-500/10 text-red-400"
                      : "border-[#0A2E12]/10 bg-[#0A2E12]/5 text-[#3D5A3E] hover:border-[#0A2E12]/10"
                  )}
                >
                  <Trophy className="mx-auto mb-1 h-5 w-5" />
                  <span className="text-sm font-semibold">Team 2</span>
                </button>
              </div>
            </div>

            {/* Score entry */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#3D5A3E]">Score (optional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={team1Score}
                  onChange={(e) => setTeam1Score(e.target.value)}
                  placeholder="T1"
                  className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-4 py-3 text-center text-lg font-bold text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20] focus:outline-none"
                />
                <span className="text-[#3D5A3E] font-bold">vs</span>
                <input
                  type="number"
                  min="0"
                  value={team2Score}
                  onChange={(e) => setTeam2Score(e.target.value)}
                  placeholder="T2"
                  className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-4 py-3 text-center text-lg font-bold text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || winnerTeam === null}
              className="w-full rounded-xl bg-[#1B5E20] py-3 font-semibold text-white transition-colors hover:bg-[#1B5E20] disabled:opacity-50"
            >
              {loading ? "Reporting..." : "Submit Result"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
