"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { InsuranceStatus } from "@/lib/types";

interface PlayerCoverage {
  id: string;
  display_name: string;
  avatar_url: string | null;
  insurance_status: InsuranceStatus;
  checked_in_at: string | null;
}

const STATUS_CONFIG: Record<InsuranceStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-emerald-700", bg: "bg-emerald-100" },
  expired: { label: "Expired", color: "text-amber-700", bg: "bg-amber-100" },
  none: { label: "None", color: "text-zinc-500", bg: "bg-zinc-100" },
};

export default function AdminInsurancePage() {
  const [players, setPlayers] = useState<PlayerCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | InsuranceStatus>("all");
  const [search, setSearch] = useState("");

  const loadPlayers = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("players")
      .select("id, display_name, avatar_url, insurance_status, checked_in_at")
      .order("display_name");

    if (!error && data) {
      setPlayers(data as PlayerCoverage[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const filtered = players.filter((p) => {
    if (filter !== "all" && p.insurance_status !== filter) return false;
    if (search && !p.display_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: players.length,
    active: players.filter((p) => p.insurance_status === "active").length,
    expired: players.filter((p) => p.insurance_status === "expired").length,
    none: players.filter((p) => p.insurance_status === "none").length,
  };

  const coverageRate = players.length > 0
    ? Math.round((counts.active / players.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-zinc-900">Insurance Coverage</h1>
        <p className="text-sm text-zinc-500 mt-1">
          View and manage member insurance coverage status
        </p>
      </div>

      {/* Stats overview */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-white border border-zinc-200 p-4 text-center">
          <p className="text-3xl font-black text-zinc-900">{counts.all}</p>
          <p className="text-xs text-zinc-500 mt-1">Total Members</p>
        </div>
        <div className="rounded-2xl bg-white border border-zinc-200 p-4 text-center">
          <p className="text-3xl font-black text-emerald-600">{counts.active}</p>
          <p className="text-xs text-zinc-500 mt-1">Active Coverage</p>
        </div>
        <div className="rounded-2xl bg-white border border-zinc-200 p-4 text-center">
          <p className="text-3xl font-black text-amber-600">{counts.expired}</p>
          <p className="text-xs text-zinc-500 mt-1">Expired</p>
        </div>
        <div className="rounded-2xl bg-white border border-zinc-200 p-4 text-center">
          <p className="text-3xl font-black text-blue-600">{coverageRate}%</p>
          <p className="text-xs text-zinc-500 mt-1">Coverage Rate</p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <div className="flex gap-1">
          {(["all", "active", "expired", "none"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              )}
            >
              {f === "all" ? `All (${counts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Player list */}
      <div className="rounded-2xl bg-white border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Member
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Coverage Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Last Check-in
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-zinc-400">
                    No members found
                  </td>
                </tr>
              ) : (
                filtered.map((player) => {
                  const config = STATUS_CONFIG[player.insurance_status];
                  const initials = player.display_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={player.id} className="border-b border-zinc-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-bold text-white">
                            {initials}
                          </div>
                          <span className="font-medium text-zinc-900">{player.display_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", config.bg, config.color)}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-500">
                        {player.checked_in_at
                          ? new Date(player.checked_in_at).toLocaleDateString()
                          : "--"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
