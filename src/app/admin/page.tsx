"use client";

import { useEffect, useState } from "react";
import { useAdminVenue } from "@/components/admin/AdminVenueContext";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  totalPlayers: number;
  matchesToday: number;
  totalCourts: number;
  courtsInUse: number;
  playersOnline: number;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-6">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-zinc-800">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { selectedVenueId, selectedVenue, loading: venueLoading } = useAdminVenue();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedVenueId) return;

    async function fetchStats() {
      setLoading(true);
      const supabase = createClient();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [playersRes, matchesTodayRes, courtsRes, activePlayersRes] =
        await Promise.all([
          supabase
            .from("players")
            .select("id", { count: "exact", head: true })
            .eq("venue_id", selectedVenueId),
          supabase
            .from("matches")
            .select("id", { count: "exact", head: true })
            .eq("venue_id", selectedVenueId)
            .gte("created_at", today.toISOString()),
          supabase
            .from("courts")
            .select("id, is_available", { count: "exact" })
            .eq("venue_id", selectedVenueId),
          supabase
            .from("players")
            .select("id", { count: "exact", head: true })
            .eq("venue_id", selectedVenueId)
            .eq("is_available", true),
        ]);

      const courtsInUse =
        courtsRes.data?.filter((c) => !c.is_available).length ?? 0;

      setStats({
        totalPlayers: playersRes.count ?? 0,
        matchesToday: matchesTodayRes.count ?? 0,
        totalCourts: courtsRes.count ?? 0,
        courtsInUse,
        playersOnline: activePlayersRes.count ?? 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, [selectedVenueId]);

  if (venueLoading || loading || !stats) {
    return <div className="text-zinc-500 dark:text-zinc-400">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-1">Dashboard</h1>
      {selectedVenue && (
        <p className="text-sm text-zinc-500 mb-6">{selectedVenue.name}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Players Online" value={stats.playersOnline} />
        <StatCard label="Matches Today" value={stats.matchesToday} />
        <StatCard
          label="Courts In Use"
          value={`${stats.courtsInUse} / ${stats.totalCourts}`}
        />
        <StatCard label="Total Players" value={stats.totalPlayers} />
      </div>
    </div>
  );
}
