"use client";

import { useEffect, useState, useCallback } from "react";
import type { PlayerStats } from "@/lib/types";

type StatsWithPlayer = PlayerStats & {
  player: { id: string; name: string; avatar_url: string | null; skill_level: string; sports: string[] };
};

export function usePlayerStats(playerId: string | null) {
  const [stats, setStats] = useState<StatsWithPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!playerId) return;
    try {
      const res = await fetch(`/api/stats/${playerId}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [playerId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
