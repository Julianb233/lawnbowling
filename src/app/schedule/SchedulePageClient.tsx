"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { UpcomingGames } from "@/components/schedule/UpcomingGames";
import { CreateGameModal } from "@/components/schedule/CreateGameModal";
import { BottomNav } from "@/components/board/BottomNav";
import type { ScheduledGame } from "@/lib/types";

interface SchedulePageClientProps {
  games: ScheduledGame[];
  currentPlayerId: string;
}

export function SchedulePageClient({ games, currentPlayerId }: SchedulePageClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  const handleCreated = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="min-h-screen bg-animated-gradient pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 glass border-b border-[#0A2E12]/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-xl font-black text-[#0A2E12] lg:text-2xl">
              <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-[#1B5E20]" strokeWidth={1.5} /><span className="text-gradient">Schedule</span></span>
            </h1>
            <p className="text-sm text-[#3D5A3E]">Upcoming games</p>
          </motion.div>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-gradient-to-r from-[#1B5E20] to-green-600 px-4 py-2.5 text-sm font-bold text-white hover:shadow-lg transition-all min-h-[44px] touch-manipulation"
          >
            + New Game
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <UpcomingGames games={games} currentPlayerId={currentPlayerId} />
        </motion.div>
      </div>

      <CreateGameModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />

      <BottomNav />
    </div>
  );
}
