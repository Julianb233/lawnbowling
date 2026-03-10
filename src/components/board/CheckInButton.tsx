"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface CheckInButtonProps {
  playerId: string;
  isAvailable: boolean;
  onToggle?: (newState: boolean) => void;
}

export function CheckInButton({ playerId, isAvailable, onToggle }: CheckInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(isAvailable);
  const supabase = createClient();

  async function handleToggle() {
    setLoading(true);
    const newState = !available;

    const { error } = await supabase
      .from("players")
      .update({
        is_available: newState,
        checked_in_at: newState ? new Date().toISOString() : null,
      })
      .eq("id", playerId);

    if (!error) {
      setAvailable(newState);
      onToggle?.(newState);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "w-full rounded-2xl px-8 py-5 text-xl font-bold text-white shadow-lg transition-all duration-300 active:scale-95",
        "touch-manipulation select-none",
        available
          ? "bg-red-500 hover:bg-red-600 shadow-red-200"
          : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Updating...
        </span>
      ) : available ? (
        "CHECK OUT"
      ) : (
        "I'M AVAILABLE"
      )}
    </button>
  );
}
