"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { PlayerStatsCard } from "@/components/stats/PlayerStatsCard";
import { MatchHistory } from "@/components/stats/MatchHistory";
import { WeeklyActivity } from "@/components/stats/WeeklyActivity";
import { FavoritePartnersList } from "@/components/stats/FavoritePartnersList";
import { ClubStats } from "@/components/stats/ClubStats";
import { usePlayerStats } from "@/lib/hooks/usePlayerStats";

export default function StatsPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [homeClubId, setHomeClubId] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { stats, loading: loadingStats } = usePlayerStats(currentUserId);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: player } = await supabase
          .from("players")
          .select("home_club_id")
          .eq("user_id", user.id)
          .single();
        if (player?.home_club_id) {
          setHomeClubId(player.home_club_id);
        }
      }
      setLoadingAuth(false);
    }
    loadUser();
  }, []);

  const loading = loadingAuth || loadingStats;

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
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

            {homeClubId && <ClubStats clubId={homeClubId} />}

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
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    Match History
                  </h2>
                  <Link
                    href="/match-history"
                    className="flex items-center gap-1 text-xs font-medium text-[#1B5E20] hover:text-[#2E7D32]"
                  >
                    View All <ChevronRight className="h-3 w-3" />
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
