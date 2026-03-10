"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PlayerCard } from "./PlayerCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import type { Player } from "@/lib/types";

interface AvailabilityBoardProps {
  players: Player[];
  loading: boolean;
  onPickMe?: (player: Player) => void;
  pendingTargetIds?: Set<string>;
}

export function AvailabilityBoard({ players, loading, onPickMe, pendingTargetIds }: AvailabilityBoardProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <CardSkeleton />
          </motion.div>
        ))}
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700/50 py-16 text-center glass"
      >
        <motion.p
          className="text-5xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          {"\u{1F3D3}"}
        </motion.p>
        <p className="mt-4 text-lg font-semibold text-zinc-300">No players available</p>
        <p className="mt-1 text-sm text-zinc-500">
          Check in to be the first on the board!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      <AnimatePresence mode="popLayout">
        {players.map((player, i) => (
          <PlayerCard key={player.id} player={player} onPickMe={onPickMe} index={i} isPending={pendingTargetIds?.has(player.id)} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
