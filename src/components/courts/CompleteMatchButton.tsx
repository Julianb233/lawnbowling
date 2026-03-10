"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CompleteMatchButtonProps {
  matchId: string;
  onCompleted?: () => void;
}

export function CompleteMatchButton({
  matchId,
  onCompleted,
}: CompleteMatchButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!confirm("End this match?")) return;
    setLoading(true);
    const res = await fetch("/api/matches/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    });
    setLoading(false);
    if (res.ok) onCompleted?.();
  };

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={loading}
      onClick={handleComplete}
    >
      {loading ? "Ending..." : "End Match"}
    </Button>
  );
}
