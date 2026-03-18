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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-[#0A2E12]">Standings</h1>
          </div>
          <p className="mt-0.5 text-sm text-[#3D5A3E]">
            Top players ranked by performance. Filter by sport and experience.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <Leaderboard currentUserId={currentUserId} />
      </div>

      <BottomNav />
    </div>
  );
}
