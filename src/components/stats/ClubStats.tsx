"use client";

import { useState, useEffect } from "react";
import { Building2, Users, Trophy, TrendingUp } from "lucide-react";

interface ClubStatsData {
  club_name: string;
  total_members: number;
  total_games: number;
  club_win_rate: number;
  most_active: { display_name: string; games_played: number }[];
}

export function ClubStats({ clubId }: { clubId: string }) {
  const [stats, setStats] = useState<ClubStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stats/club?club_id=${clubId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clubId]);

  if (loading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-[#0A2E12]/5" />;
  }

  if (!stats) return null;

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#3D5A3E]">
        <Building2 className="mr-1 inline h-4 w-4" />
        {stats.club_name} Stats
      </h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-3 text-center">
          <Users className="mx-auto mb-1 h-4 w-4 text-[#1B5E20]" />
          <p className="text-lg font-bold text-[#0A2E12]">{stats.total_members}</p>
          <p className="text-xs text-[#3D5A3E]">Members</p>
        </div>
        <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-3 text-center">
          <Trophy className="mx-auto mb-1 h-4 w-4 text-[#1B5E20]" />
          <p className="text-lg font-bold text-[#0A2E12]">{stats.total_games}</p>
          <p className="text-xs text-[#3D5A3E]">Games</p>
        </div>
        <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-3 text-center">
          <TrendingUp className="mx-auto mb-1 h-4 w-4 text-[#1B5E20]" />
          <p className="text-lg font-bold text-[#0A2E12]">{Math.round(stats.club_win_rate)}%</p>
          <p className="text-xs text-[#3D5A3E]">Win Rate</p>
        </div>
      </div>

      {stats.most_active.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-[#3D5A3E]">Most Active This Month</p>
          <div className="space-y-1">
            {stats.most_active.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-[#0A2E12]/[0.03] px-3 py-1.5 text-sm"
              >
                <span className="text-[#2D4A30]">{p.display_name}</span>
                <span className="text-xs text-[#3D5A3E]">{p.games_played} games</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
