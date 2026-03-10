"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Trophy, Calendar } from "lucide-react";
import { SPORT_LABELS, TOURNAMENT_FORMAT_LABELS } from "@/lib/types";
import type { TournamentFormat, TournamentStatus } from "@/lib/types";
import { getSportColor } from "@/lib/design";
import { cn } from "@/lib/utils";

interface TournamentCardProps {
  tournament: {
    id: string;
    name: string;
    sport: string;
    format: TournamentFormat;
    status: TournamentStatus;
    max_players: number;
    starts_at: string | null;
    created_at: string;
    creator?: { id: string; display_name: string; avatar_url: string | null };
    tournament_participants?: { count: number }[];
  };
}

const STATUS_COLORS: Record<TournamentStatus, { bg: string; text: string; label: string }> = {
  registration: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Open" },
  in_progress: { bg: "bg-amber-500/10", text: "text-amber-400", label: "In Progress" },
  completed: { bg: "bg-green-500/10", text: "text-green-400", label: "Completed" },
  cancelled: { bg: "bg-zinc-500/10", text: "text-zinc-400", label: "Cancelled" },
};

export function TournamentCard({ tournament }: TournamentCardProps) {
  const sportColor = getSportColor(tournament.sport);
  const sportLabel = SPORT_LABELS[tournament.sport as keyof typeof SPORT_LABELS];
  const statusStyle = STATUS_COLORS[tournament.status];
  const participantCount = tournament.tournament_participants?.[0]?.count ?? 0;

  return (
    <Link href={`/tournament/${tournament.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "rounded-2xl border border-zinc-200 bg-white/80 p-4 transition-colors hover:border-zinc-200",
          "cursor-pointer"
        )}
      >
        <div className="mb-3 flex items-start justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${sportColor.primary}15` }}
          >
            <Trophy className="h-5 w-5" style={{ color: sportColor.primary }} />
          </div>
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusStyle.bg, statusStyle.text)}>
            {statusStyle.label}
          </span>
        </div>

        <h3 className="mb-1 font-bold text-zinc-900">{tournament.name}</h3>
        <p className="mb-3 text-sm text-zinc-500">
          {TOURNAMENT_FORMAT_LABELS[tournament.format]}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${sportColor.primary}15`,
              color: sportColor.primary,
            }}
          >
            {sportLabel?.label ?? tournament.sport}
          </span>
          <div className="flex items-center gap-3 text-zinc-500">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {participantCount}/{tournament.max_players}
            </span>
            {tournament.starts_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(tournament.starts_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
