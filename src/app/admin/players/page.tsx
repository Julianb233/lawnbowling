"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/profile/SkillBadge";
import type { SkillLevel } from "@/lib/db/players";

interface Player {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  skill_level: SkillLevel;
  sports: string[];
  role: string;
  is_available: boolean;
  created_at: string;
}

export default function PlayersAdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  const fetchPlayers = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (skillFilter) params.set("skill", skillFilter);
    const res = await fetch(`/api/admin/players?${params}`);
    const data = await res.json();
    setPlayers(data.players ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, [search, skillFilter]);

  const toggleRole = async (player: Player) => {
    const newRole = player.role === "admin" ? "player" : "admin";
    await fetch("/api/admin/players", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: player.id, role: newRole }),
    });
    fetchPlayers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">
        Players ({total})
      </h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-zinc-800 focus:border-[#1B5E20] focus:outline-none flex-1 max-w-xs"
        />
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-zinc-800"
        >
          <option value="">All Skill Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {loading ? (
        <div className="text-zinc-500 dark:text-zinc-400">Loading players...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:text-zinc-400">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Skill</th>
                <th className="pb-2 font-medium">Sports</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Joined</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {players.map((player) => (
                <tr key={player.id}>
                  <td className="py-3 text-zinc-800">{player.display_name}</td>
                  <td className="py-3">
                    <SkillBadge level={player.skill_level} />
                  </td>
                  <td className="py-3 text-zinc-500 dark:text-zinc-400">
                    {player.sports
                      ?.map((s) => s.replace("_", " "))
                      .join(", ") || "-"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${player.is_available ? "text-[#1B5E20]" : "text-zinc-500 dark:text-zinc-400"}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${player.is_available ? "bg-[#1B5E20]" : "bg-zinc-400"}`}
                      />
                      {player.is_available ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        player.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-zinc-100 text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {player.role}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-500 dark:text-zinc-400">
                    {new Date(player.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <Button
                      size="sm"
                      variant={player.role === "admin" ? "outline" : "secondary"}
                      onClick={() => toggleRole(player)}
                    >
                      {player.role === "admin"
                        ? "Remove Admin"
                        : "Make Admin"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {players.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500 italic">
              No players found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
