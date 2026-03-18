"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { PlayerStatsCard } from "@/components/stats/PlayerStatsCard";
import { BowlsRatingsCard } from "@/components/stats/BowlsRatingsCard";
import { MatchHistory } from "@/components/stats/MatchHistory";
import { WeeklyActivity } from "@/components/stats/WeeklyActivity";
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
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-xl font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>My Stats</h1>
          <p className="text-sm text-[#3D5A3E]">Your performance at a glance</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-2xl bg-[#0A2E12]/5" />
            <div className="h-32 animate-pulse rounded-2xl bg-[#0A2E12]/5" />
          </div>
        ) : (
          <>
            <PlayerStatsCard stats={stats} />

            {currentUserId && <BowlsRatingsCard playerId={currentUserId} />}

            {currentUserId && <WeeklyActivity playerId={currentUserId} />}

            {currentUserId && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#3D5A3E]" style={{ fontFamily: "var(--font-display)" }}>
                    Match History
                  </h2>
                  <Link
                    href="/match-history"
                    className="text-xs font-medium text-emerald-500 hover:text-emerald-600"
                  >
                    View All &rarr;
                  </Link>
                </div>
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
