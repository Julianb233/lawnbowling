"use client";

import { motion } from "framer-motion";
import { User, Users, Calendar } from "lucide-react";

interface SearchResultsProps {
  players: Array<{ id: string; display_name: string; skill_level: string; sports: string[] }>;
  teams: Array<{ id: string; name: string; sport: string }>;
  games: Array<{ id: string; title: string; sport: string; scheduled_at: string }>;
  onSelect: (type: string, id: string) => void;
}

export function SearchResults({ players, teams, games, onSelect }: SearchResultsProps) {
  const hasResults = players.length > 0 || teams.length > 0 || games.length > 0;

  if (!hasResults) {
    return (
      <div className="px-4 py-8 text-center text-sm text-[#3D5A3E]">
        No results found
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {players.length > 0 && (
        <div>
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">Players</p>
          {players.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect("player", p.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#0A2E12]/[0.03] min-h-[44px]"
            >
              <User className="h-4 w-4 shrink-0 text-green-500" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#2D4A30]">{p.display_name}</p>
                <p className="text-xs text-[#3D5A3E]">{p.skill_level} - {p.sports.join(", ")}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {teams.length > 0 && (
        <div>
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">Teams</p>
          {teams.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect("team", t.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#0A2E12]/[0.03] min-h-[44px]"
            >
              <Users className="h-4 w-4 shrink-0 text-[#1B5E20]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#2D4A30]">{t.name}</p>
                <p className="text-xs text-[#3D5A3E]">{t.sport}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {games.length > 0 && (
        <div>
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">Games</p>
          {games.map((g, i) => (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect("game", g.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#0A2E12]/[0.03] min-h-[44px]"
            >
              <Calendar className="h-4 w-4 shrink-0 text-amber-500" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#2D4A30]">{g.title}</p>
                <p className="text-xs text-[#3D5A3E]">
                  {g.sport} - {new Date(g.scheduled_at).toLocaleDateString()}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
