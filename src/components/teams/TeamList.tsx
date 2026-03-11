"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, KeyRound, Users } from "lucide-react";
import { TeamCard } from "./TeamCard";
import { CreateTeamModal } from "./CreateTeamModal";
import { JoinTeamModal } from "./JoinTeamModal";
import { ANIMATIONS } from "@/lib/design";

export function TeamList() {
  const [teams, setTeams] = useState<Array<{
    team_id: string;
    role: string;
    teams: {
      id: string;
      name: string;
      sport: string;
      description: string | null;
      captain: { id: string; name: string; avatar_url: string | null };
    };
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams ?? []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

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
      {/* Action buttons */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-[#1B5E20] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B5E20]"
        >
          <Plus className="h-4 w-4" />
          Create Team
        </button>
        <button
          onClick={() => setShowJoin(true)}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
        >
          <KeyRound className="h-4 w-4" />
          Join Team
        </button>
      </div>

      {/* Team grid */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="mb-3 h-12 w-12 text-zinc-700" />
          <h3 className="mb-1 text-lg font-semibold text-zinc-400">No teams yet</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Create a team or join one with an invite code</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          {...ANIMATIONS.staggerChildren}
          initial="initial"
          animate="animate"
        >
          {teams.map((t) => (
            <motion.div key={t.team_id} {...ANIMATIONS.fadeInUp}>
              <TeamCard
                team={t.teams}
                role={t.role}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <CreateTeamModal open={showCreate} onOpenChange={setShowCreate} onCreated={fetchTeams} />
      <JoinTeamModal open={showJoin} onOpenChange={setShowJoin} onJoined={fetchTeams} />
    </>
  );
}
