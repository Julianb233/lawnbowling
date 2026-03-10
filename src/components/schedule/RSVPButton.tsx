"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

interface RSVPButtonProps {
  gameId: string;
  currentStatus?: "going" | "maybe" | "not_going" | null;
}

const STATUSES = [
  { value: "going" as const, label: "Going", color: "emerald" },
  { value: "maybe" as const, label: "Maybe", color: "amber" },
  { value: "not_going" as const, label: "Can't Go", color: "red" },
];

export function RSVPButton({ gameId, currentStatus }: RSVPButtonProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleRSVP(newStatus: "going" | "maybe" | "not_going") {
    startTransition(async () => {
      const res = await fetch(`/api/schedule/${gameId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setStatus(newStatus);
    });
  }

  return (
    <div className="flex gap-1.5">
      {STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => handleRSVP(s.value)}
          disabled={isPending}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            status === s.value
              ? s.color === "emerald"
                ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                : s.color === "amber"
                ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                : "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
              : "text-zinc-400 hover:bg-zinc-800"
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
