"use client";

import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { MatchQueue } from "@/components/partner/MatchQueue";
import { BottomNav } from "@/components/board/BottomNav";
import { SPORT_LABELS } from "@/lib/types";
import type { Sport, Player } from "@/lib/types";

interface ActiveMatch {
  id: string;
  status: string;
  sport: string;
  created_at: string;
  court_id: string | null;
  courts?: { name: string } | { name: string }[] | null;
}

export function QueuePageClient({
  player,
  activeMatch,
}: {
  player: Player;
  activeMatch: ActiveMatch | null;
}) {
  const displayName = player.display_name || "Player";

  return (
    <div className="min-h-screen bg-animated-gradient pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-zinc-200 dark:border-white/10">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              <span className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-[#1B5E20]" strokeWidth={1.5} /><span className="text-gradient">Match Queue</span></span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Waiting to play</p>
          </motion.div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Current player status banner */}
        {activeMatch ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl glass border border-[#1B5E20]/30 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="live-dot !h-2 !w-2" />
                <span className="text-sm font-semibold text-[#1B5E20]">
                  You&apos;re in the queue
                </span>
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              {displayName} &mdash;{" "}
              {SPORT_LABELS[activeMatch.sport as Sport]?.label || activeMatch.sport}
              {activeMatch.courts
                ? ` \u2022 Court: ${Array.isArray(activeMatch.courts) ? activeMatch.courts[0]?.name : activeMatch.courts.name}`
                : " \u2022 Waiting for court assignment"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl glass border border-zinc-200 p-4 text-center"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              You&apos;re not in the queue. Head to the{" "}
              <a href="/board" className="text-[#1B5E20] underline underline-offset-2">
                board
              </a>{" "}
              to find a partner!
            </p>
          </motion.div>
        )}

        {/* Full match queue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl glass p-4"
        >
          <MatchQueue />
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
