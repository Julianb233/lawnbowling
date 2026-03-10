"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Player } from "@/lib/types";

interface KioskCheckInProps {
  venueId: string;
  onCheckIn?: (player: Player) => void;
}

export function KioskCheckIn({ venueId, onCheckIn }: KioskCheckInProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [checkedIn, setCheckedIn] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayers() {
      const supabase = createClient();
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("venue_id", venueId)
        .order("display_name");
      setPlayers((data as Player[]) || []);
      setLoading(false);
    }
    loadPlayers();
  }, [venueId]);

  async function handleTapCheckIn(player: Player) {
    setCheckedIn(player.id);

    await fetch("/api/qr/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id: player.id, venue_id: venueId }),
    });

    onCheckIn?.(player);
    setTimeout(() => setCheckedIn(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="mb-6 text-center text-3xl font-black text-zinc-100">Tap to Check In</h2>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {players.map((player) => {
          const isJustCheckedIn = checkedIn === player.id;
          const initials = player.display_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <motion.button
              key={player.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTapCheckIn(player)}
              className="flex flex-col items-center gap-2 rounded-2xl p-4 glass hover:bg-white/5 min-h-[100px] touch-manipulation"
            >
              <AnimatePresence mode="wait">
                {isJustCheckedIn ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500"
                  >
                    <span className="text-2xl text-white">&#10003;</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="avatar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-lg font-bold text-white"
                  >
                    {initials}
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-sm font-medium text-zinc-300 truncate max-w-full">
                {player.display_name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
