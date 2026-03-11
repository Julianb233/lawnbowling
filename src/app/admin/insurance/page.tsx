"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminVenue } from "@/components/admin/AdminVenueContext";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface PlayerCoverage {
  id: string;
  display_name: string;
  insurance_status: "none" | "active" | "expired";
  updated_at: string;
}

type FilterStatus = "all" | "active" | "none" | "expired";

export default function AdminInsurancePage() {
  const { selectedVenueId, selectedVenue, loading: venueLoading } = useAdminVenue();
  const [players, setPlayers] = useState<PlayerCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");

  const loadPlayers = useCallback(async () => {
    if (!selectedVenueId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("players")
      .select("id, display_name, insurance_status, updated_at")
      .eq("venue_id", selectedVenueId)
      .order("display_name", { ascending: true });

    if (data) {
      setPlayers(data as PlayerCoverage[]);
    }
    setLoading(false);
  }, [selectedVenueId]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const filtered = players.filter((p) => {
    if (filter === "all") return true;
    return p.insurance_status === filter;
  });

  const activeCount = players.filter((p) => p.insurance_status === "active").length;
  const expiredCount = players.filter((p) => p.insurance_status === "expired").length;
  const noneCount = players.filter((p) => p.insurance_status === "none" || !p.insurance_status).length;
  const coverageRate = players.length > 0 ? Math.round((activeCount / players.length) * 100) : 0;

  if (venueLoading || loading) {
    return <div className="text-zinc-500">Loading insurance data...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-1">Insurance Coverage</h1>
      {selectedVenue && (
        <p className="text-sm text-zinc-500 mb-6">{selectedVenue.name}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center">
          <p className="text-3xl font-black text-emerald-600">{activeCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Active Coverage</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center">
          <p className="text-3xl font-black text-amber-500">{expiredCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Expired</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center">
          <p className="text-3xl font-black text-zinc-400">{noneCount}</p>
          <p className="text-xs text-zinc-500 mt-1">No Coverage</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center">
          <p className="text-3xl font-black text-[#1B5E20]">{coverageRate}%</p>
          <p className="text-xs text-zinc-500 mt-1">Coverage Rate</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {(["all", "active", "expired", "none"] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              filter === status
                ? "bg-[#1B5E20] text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            )}
          >
            {status === "all" ? `All (${players.length})` :
             status === "active" ? `Active (${activeCount})` :
             status === "expired" ? `Expired (${expiredCount})` :
             `None (${noneCount})`}
          </button>
        ))}
      </div>

      {/* Player list */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Player</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-400">
                  No players found
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-900">{p.display_name}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold",
                        p.insurance_status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : p.insurance_status === "expired"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-zinc-100 text-zinc-500"
                      )}
                    >
                      {p.insurance_status === "active" ? "Active" :
                       p.insurance_status === "expired" ? "Expired" : "None"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-500">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
