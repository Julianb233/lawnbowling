"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { PlayerStatsCard } from "@/components/stats/PlayerStatsCard";
import { MatchHistory } from "@/components/stats/MatchHistory";
import { WeeklyActivity } from "@/components/stats/WeeklyActivity";
import { FavoritePartnersList } from "@/components/stats/FavoritePartnersList";
import { usePlayerStats } from "@/lib/hooks/usePlayerStats";

export default function StatsPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { stats, loading: loadingStats } = usePlayerStats(currentUserId);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      setLoadingAuth(false);
    }
    loadUser();
  }, []);

  const loading = loadingAuth || loadingStats;

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-xl font-bold text-zinc-900">My Stats</h1>
          <p className="text-sm text-zinc-500">Your performance at a glance</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-2xl bg-zinc-100" />
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-100" />
          </div>
        ) : (
          <>
            <PlayerStatsCard stats={stats} />

            {currentUserId && <WeeklyActivity playerId={currentUserId} />}

            {currentUserId && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Favorite Partners
                </h2>
                <FavoritePartnersList playerId={currentUserId} />
              </div>
            )}

            {currentUserId && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Match History
                </h2>
                <MatchHistory playerId={currentUserId} />
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
