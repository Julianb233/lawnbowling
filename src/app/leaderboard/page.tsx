"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy } from "lucide-react";
import { BottomNav } from "@/components/board/BottomNav";
import { Leaderboard } from "@/components/stats/Leaderboard";
import { ClubScopeToggle } from "@/components/clubs/ClubScopeToggle";

export default function LeaderboardPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [homeClubId, setHomeClubId] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string>("");
  const [scope, setScope] = useState<"club" | "all">("club");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: player } = await supabase
        .from("players")
        .select("home_club_id")
        .eq("user_id", user.id)
        .single();

      if (player?.home_club_id) {
        setHomeClubId(player.home_club_id);
        const { data: club } = await supabase
          .from("clubs")
          .select("name")
          .eq("id", player.home_club_id)
          .single();
        if (club) setClubName(club.name);
      } else {
        setScope("all");
      }
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#FEFCF9] dark:bg-[#0f2518] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#1a3d28]/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Leaderboard</h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {scope === "club" && clubName
              ? `${clubName} — Top players by win rate (min 5 games)`
              : "Top players by win rate (min 5 games)"}
          </p>
          {homeClubId && (
            <div className="mt-3">
              <ClubScopeToggle
                scope={scope}
                onScopeChange={setScope}
                clubName={clubName}
              />
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <Leaderboard
          currentUserId={currentUserId}
          clubId={scope === "club" ? homeClubId : undefined}
        />
      </div>

      <BottomNav />
    </div>
  );
}
