"use client";

import { useState } from "react";
import { Clock, Loader2 } from "lucide-react";

interface JoinWaitlistButtonProps {
  venueId: string;
  sport: string;
  onJoined?: (position: number) => void;
}

export function JoinWaitlistButton({ venueId, sport, onJoined }: JoinWaitlistButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venue_id: venueId, sport }),
      });
      const data = await res.json();
      if (data.position) onJoined?.(data.position);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 min-h-[44px] transition-colors"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
      Join Waitlist
    </button>
  );
}
