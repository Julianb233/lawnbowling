"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateTeamModal({ open, onOpenChange, onCreated }: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sport] = useState("lawn_bowling");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, sport }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create team");
      }

      setName("");
      setDescription("");
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
              Create Team
            </Dialog.Title>
            <Dialog.Close aria-label="Close dialog" className="rounded-full p-1 text-[#3D5A3E] hover:bg-[#0A2E12]/5 hover:text-[#2D4A30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#3D5A3E]">Team Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Picklers"
                className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-4 py-3 text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#3D5A3E]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people about your team..."
                rows={3}
                className="w-full resize-none rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-4 py-3 text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
              />
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
              {loading ? "Creating..." : "Create Team"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
