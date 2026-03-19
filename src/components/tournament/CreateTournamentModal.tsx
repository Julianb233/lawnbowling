"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import { TOURNAMENT_FORMAT_LABELS } from "@/lib/types";
import type { TournamentFormat } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL_FORMATS: TournamentFormat[] = ["round_robin", "single_elimination", "double_elimination"];

interface CreateTournamentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateTournamentModal({ open, onOpenChange, onCreated }: CreateTournamentModalProps) {
  const [name, setName] = useState("");
  const [sport] = useState("lawn_bowling");
  const [format, setFormat] = useState<TournamentFormat>("single_elimination");
  const [maxPlayers, setMaxPlayers] = useState("16");
  const [startsAt, setStartsAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tournament", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          sport,
          format,
          max_players: parseInt(maxPlayers) || 16,
          starts_at: startsAt || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create tournament");
      }

      setName("");
      setFormat("single_elimination");
      setMaxPlayers("16");
      setStartsAt("");
      onOpenChange(false);
      onCreated();
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
              New Tournament
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1 text-[#3D5A3E] hover:bg-[#0A2E12]/5 hover:text-[#2D4A30]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#3D5A3E]">Tournament Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Spring Championship"
                className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-4 py-3 text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#3D5A3E]">Format</label>
              <div className="grid grid-cols-1 gap-2">
                {ALL_FORMATS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left",
                      format === f
                        ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                        : "border-[#0A2E12]/10 bg-[#0A2E12]/5 text-[#3D5A3E] hover:border-[#0A2E12]/10"
                    )}
                  >
                    {TOURNAMENT_FORMAT_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#3D5A3E]">Max Players</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  min={2}
                  max={64}
                  className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-4 py-3 text-[#0A2E12] focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#3D5A3E]">Start Date</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-4 py-3 text-[#0A2E12] focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#1B5E20] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {loading ? "Creating..." : "Set Up Tournament"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
