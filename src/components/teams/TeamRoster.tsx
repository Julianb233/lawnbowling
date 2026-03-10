"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Crown, UserMinus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANIMATIONS } from "@/lib/design";

interface RosterMember {
  id: string;
  player_id: string;
  role: string;
  player: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    skill_level: string;
    sports: string[];
  };
}

interface TeamRosterProps {
  teamId: string;
  currentUserId: string | null;
  captainId: string;
}

export function TeamRoster({ teamId, currentUserId, captainId }: TeamRosterProps) {
  const [members, setMembers] = useState<RosterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const isCaptain = currentUserId === captainId;

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members ?? []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleRemove(playerId: string) {
    if (!confirm("Remove this player from the team?")) return;
    await fetch(`/api/teams/${teamId}/members?playerId=${playerId}`, { method: "DELETE" });
    fetchMembers();
  }

  const skillStars = (level: string) => {
    const count = level === "advanced" ? 3 : level === "intermediate" ? 2 : 1;
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-800/50" />
        ))}
      </div>
    );
  }

  return (
    <motion.div className="space-y-2" {...ANIMATIONS.staggerChildren} initial="initial" animate="animate">
      {members.map((m) => (
        <motion.div
          key={m.id}
          {...ANIMATIONS.fadeInUp}
          className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-800">
            {m.player.avatar_url ? (
              <img src={m.player.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500">
                {m.player.display_name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-200 truncate">{m.player.display_name}</span>
              {m.role === "captain" && (
                <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              )}
            </div>
            <div className="flex items-center gap-1">
              {skillStars(m.player.skill_level)}
            </div>
          </div>

          {isCaptain && m.player_id !== captainId && (
            <button
              onClick={() => handleRemove(m.player_id)}
              className={cn(
                "rounded-lg p-2 text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
              )}
            >
              <UserMinus className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
