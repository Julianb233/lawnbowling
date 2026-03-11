"use client";

import { useState } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface JoinTournamentButtonProps {
  tournamentId: string;
  isJoined: boolean;
  isFull: boolean;
  status: string;
  onToggle: () => void;
}

export function JoinTournamentButton({ tournamentId, isJoined, isFull, status, onToggle }: JoinTournamentButtonProps) {
  const [loading, setLoading] = useState(false);

  const canJoin = status === "registration" && !isFull && !isJoined;
  const canLeave = status === "registration" && isJoined;

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tournament/${tournamentId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isJoined ? "leave" : "join" }),
      });
      if (res.ok) {
        onToggle();
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  if (status !== "registration") return null;

  return (
    <button
      onClick={handleClick}
      disabled={loading || (!canJoin && !canLeave)}
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50",
        isJoined
          ? "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : "bg-[#1B5E20] text-white hover:bg-[#1B5E20]"
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isJoined ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {loading ? "..." : isJoined ? "Leave" : isFull ? "Full" : "Join"}
    </button>
  );
}
