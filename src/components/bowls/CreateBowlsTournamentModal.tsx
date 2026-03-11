"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import { BOWLS_FORMAT_LABELS } from "@/lib/types";
import type { BowlsGameFormat } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL_BOWLS_FORMATS: BowlsGameFormat[] = ["fours", "triples", "pairs", "singles"];

interface CreateBowlsTournamentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateBowlsTournamentModal({ open, onOpenChange, onCreated }: CreateBowlsTournamentModalProps) {
  const [name, setName] = useState("");
  const [bowlsFormat, setBowlsFormat] = useState<BowlsGameFormat>("fours");
  const [maxPlayers, setMaxPlayers] = useState("32");
  const [startsAt, setStartsAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bowls/tournament", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bowls_format: bowlsFormat,
          max_players: parseInt(maxPlayers) || 32,
          starts_at: startsAt || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create tournament");
      }

      setName("");
      setBowlsFormat("fours");
      setMaxPlayers("32");
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
              Create Bowls Tournament
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
                placeholder="e.g. Saturday Social Draw"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Bowls Format</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_BOWLS_FORMATS.map((f) => {
                  const info = BOWLS_FORMAT_LABELS[f];
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setBowlsFormat(f)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left",
                        bowlsFormat === f
                          ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                          : "border-zinc-200 bg-zinc-100 text-zinc-400 hover:border-zinc-400"
                      )}
                    >
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">Max Players</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  min={4}
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
