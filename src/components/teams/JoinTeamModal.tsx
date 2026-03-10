"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, KeyRound, Users } from "lucide-react";

interface JoinTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoined: () => void;
}

export function JoinTeamModal({ open, onOpenChange, onJoined }: JoinTeamModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{
    id: string;
    name: string;
    sport: string;
    captain: { name: string };
  } | null>(null);

  async function handleLookup() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setPreview(null);

    try {
      const res = await fetch(`/api/teams/join/${code.trim()}`);
      if (!res.ok) throw new Error("Invalid invite code");
      const data = await res.json();
      setPreview(data.team);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/teams/join/${code.trim()}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join");
      }

      setCode("");
      setPreview(null);
      onOpenChange(false);
      onJoined();
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
              Join a Team
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">Invite Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter invite code..."
                  className="flex-1 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={handleLookup}
                  disabled={loading || !code.trim()}
                  className="rounded-xl bg-zinc-700 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-600 disabled:opacity-50"
                >
                  <KeyRound className="h-4 w-4" />
                </button>
              </div>
            </div>

            {preview && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-100 p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-zinc-900">{preview.name}</h3>
                    <p className="text-sm text-zinc-500">
                      {preview.sport} &middot; Captain: {preview.captain?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="mt-4 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loading ? "Joining..." : "Join Team"}
                </button>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
