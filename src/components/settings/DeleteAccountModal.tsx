"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ open, onClose }: DeleteAccountModalProps) {
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!open) return null;

  function handleDelete() {
    if (confirmation !== "DELETE") return;
    startTransition(async () => {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (res.ok) {
        router.push("/login");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl glass p-6">
        <h2 className="text-lg font-bold text-red-400 mb-2">Delete Account</h2>
        <p className="text-sm text-zinc-400 mb-4">
          This action is permanent and cannot be undone. All your data,
          including match history, teams, and profile will be deleted.
        </p>

        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-1">
            Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm
          </label>
          <input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="DELETE"
            className="w-full rounded-xl bg-zinc-100 border border-red-500/30 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmation !== "DELETE" || isPending}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all",
              confirmation === "DELETE"
                ? "bg-red-600 hover:bg-red-500"
                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
            )}
          >
            {isPending ? "Deleting..." : "Delete Forever"}
          </button>
        </div>
      </div>
    </div>
  );
}
