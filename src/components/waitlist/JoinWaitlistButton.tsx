"use client";

import { useState } from "react";
import { Clock, Loader2, AlertCircle } from "lucide-react";

interface JoinWaitlistButtonProps {
  venueId: string;
  sport: string;
  partnerId?: string;
  onJoined?: (
    position: number,
    estimatedWaitMinutes?: number | null,
  ) => void;
}

export function JoinWaitlistButton({
  venueId,
  sport,
  partnerId,
  onJoined,
}: JoinWaitlistButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venue_id: venueId,
          sport,
          partner_id: partnerId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError("You are already on the waitlist");
        } else {
          setError(data.error || "Failed to join waitlist");
        }
        return;
      }

      if (data.position) {
        onJoined?.(data.position, data.estimated_wait_minutes);
      }
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/30 disabled:opacity-50 min-h-[44px] transition-colors"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        Join Waitlist
      </button>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
