"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy } from "lucide-react";
import { BottomNav } from "@/components/board/BottomNav";
import { Leaderboard } from "@/components/stats/Leaderboard";

export default function LeaderboardPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-zinc-900">Leaderboard</h1>
          </div>
          <p className="text-sm text-zinc-500">Top players by win rate (min 5 games)</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <Leaderboard currentUserId={currentUserId} />
      </div>

      <BottomNav />
    </div>
  );
}
