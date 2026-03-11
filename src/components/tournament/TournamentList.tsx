"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Trophy } from "lucide-react";
import { TournamentCard } from "./TournamentCard";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { ANIMATIONS } from "@/lib/design";

export function TournamentList() {
  const [tournaments, setTournaments] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchTournaments = useCallback(async () => {
    try {
      const res = await fetch("/api/tournament");
      if (res.ok) {
        const data = await res.json();
        setTournaments(data.tournaments ?? []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-[#1B5E20] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B5E20]"
        >
          <Plus className="h-4 w-4" />
          Create Tournament
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Trophy className="mb-3 h-12 w-12 text-zinc-700" />
          <h3 className="mb-1 text-lg font-semibold text-zinc-400">No tournaments yet</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Create a tournament to get started</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          {...ANIMATIONS.staggerChildren}
          initial="initial"
          animate="animate"
        >
          {tournaments.map((t) => (
            <motion.div key={t.id as string} {...ANIMATIONS.fadeInUp}>
              <TournamentCard tournament={t as Parameters<typeof TournamentCard>[0]["tournament"]} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <CreateTournamentModal open={showCreate} onOpenChange={setShowCreate} onCreated={fetchTournaments} />
    </>
  );
}
