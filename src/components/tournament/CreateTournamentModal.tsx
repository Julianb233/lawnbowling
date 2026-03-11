"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import { ALL_SPORTS, SPORT_LABELS, TOURNAMENT_FORMAT_LABELS } from "@/lib/types";
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
  const [sport, setSport] = useState(ALL_SPORTS[0]);
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
      setSport(ALL_SPORTS[0]);
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-300 bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-zinc-900">
              Create Tournament
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">Tournament Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Spring Championship"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Sport</label>
              <div className="flex gap-2">
                {ALL_SPORTS.map((s) => {
                  const label = SPORT_LABELS[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSport(s)}
                      className={cn(
                        "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                        sport === s
                          ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                          : "border-zinc-200 bg-zinc-100 text-zinc-400 hover:border-zinc-400"
                      )}
                    >
                      {label.emoji} {label.short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Format</label>
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
                        : "border-zinc-200 bg-zinc-100 text-zinc-400 hover:border-zinc-400"
                    )}
                  >
                    {TOURNAMENT_FORMAT_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">Max Players</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  min={2}
                  max={64}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-zinc-900 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">Start Date</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-zinc-900 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
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
              {loading ? "Creating..." : "Create Tournament"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
