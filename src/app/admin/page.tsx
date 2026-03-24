"use client";

import { useEffect, useState } from "react";
import { useAdminVenue } from "@/components/admin/AdminVenueContext";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Trophy,
  TrendingUp,
  Activity,
  Calendar,
  BarChart3,
  Clock,
} from "lucide-react";

interface Stats {
  totalPlayers: number;
  matchesToday: number;
  totalCourts: number;
  courtsInUse: number;
  playersOnline: number;
  matchesThisWeek: number;
  newPlayersThisWeek: number;
  newPlayersLastWeek: number;
  totalMatches: number;
}

interface SignupTrend {
  label: string;
  count: number;
}

function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
}) {
  return (
    <div className="rounded-2xl border border-[#0A2E12]/10 dark:border-white/10 bg-white dark:bg-white/5 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#3D5A3E] dark:text-[#a8c8b4]">{label}</p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B5E20]/10">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-2 text-3xl font-bold text-[#0A2E12] dark:text-[#e8f0eb]">
        {value}
      </p>
      {trend && (
        <p
          className={`mt-1 text-xs font-medium ${
            trend.value >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500"
          }`}
        >
          {trend.value >= 0 ? "+" : ""}
          {trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}

function MiniBarChart({ data }: { data: SignupTrend[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-[#1B5E20]/80 dark:bg-emerald-500/60 transition-all"
            style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }}
          />
          <span className="text-[10px] text-[#3D5A3E] dark:text-[#a8c8b4] whitespace-nowrap">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const {
    selectedVenueId,
    selectedVenue,
    loading: venueLoading,
  } = useAdminVenue();
  const [stats, setStats] = useState<Stats | null>(null);
  const [signupTrends, setSignupTrends] = useState<SignupTrend[]>([]);
  const [recentActivity, setRecentActivity] = useState<
    Array<{ id: string; type: string; description: string; time: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedVenueId) return;

    async function fetchStats() {
      setLoading(true);
      const supabase = createClient();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      twoWeeksAgo.setHours(0, 0, 0, 0);

      const [
        playersRes,
        matchesTodayRes,
        courtsRes,
        activePlayersRes,
        matchesWeekRes,
        newPlayersWeekRes,
        newPlayersLastWeekRes,
        totalMatchesRes,
      ] = await Promise.all([
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
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", selectedVenueId)
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("players")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", selectedVenueId)
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("players")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", selectedVenueId)
          .gte("created_at", twoWeeksAgo.toISOString())
          .lt("created_at", weekAgo.toISOString()),
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", selectedVenueId),
      ]);

      const courtsInUse =
        courtsRes.data?.filter((c) => !c.is_available).length ?? 0;

      setStats({
        totalPlayers: playersRes.count ?? 0,
        matchesToday: matchesTodayRes.count ?? 0,
        totalCourts: courtsRes.count ?? 0,
        courtsInUse,
        playersOnline: activePlayersRes.count ?? 0,
        matchesThisWeek: matchesWeekRes.count ?? 0,
        newPlayersThisWeek: newPlayersWeekRes.count ?? 0,
        newPlayersLastWeek: newPlayersLastWeekRes.count ?? 0,
        totalMatches: totalMatchesRes.count ?? 0,
      });

      // Build signup trends for last 7 days
      const trends: SignupTrend[] = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date();
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const { count } = await supabase
          .from("players")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", selectedVenueId)
          .gte("created_at", dayStart.toISOString())
          .lt("created_at", dayEnd.toISOString());

        trends.push({
          label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
          count: count ?? 0,
        });
      }
      setSignupTrends(trends);

      // Recent matches as activity
      const { data: recentMatches } = await supabase
        .from("matches")
        .select("id, created_at, status")
        .eq("venue_id", selectedVenueId)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentActivity(
        (recentMatches ?? []).map((m) => ({
          id: m.id,
          type: "match",
          description: `Match ${m.status || "created"}`,
          time: new Date(m.created_at).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        }))
      );

      setLoading(false);
    }

    fetchStats();
  }, [selectedVenueId]);

  if (venueLoading || loading || !stats) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#0A2E12]/5" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-[#0A2E12]/5"
            />
          ))}
        </div>
      </div>
    );
  }

  const signupGrowth =
    stats.newPlayersLastWeek > 0
      ? Math.round(
          ((stats.newPlayersThisWeek - stats.newPlayersLastWeek) /
            stats.newPlayersLastWeek) *
            100
        )
      : stats.newPlayersThisWeek > 0
        ? 100
        : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-[#0A2E12] dark:text-[#e8f0eb] mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Club Dashboard
        </h1>
        {selectedVenue && (
          <p className="text-sm text-[#3D5A3E] dark:text-[#a8c8b4]">
            {selectedVenue.name}
          </p>
        )}
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Players Online"
          value={stats.playersOnline}
          icon={<Activity className="h-4 w-4 text-[#1B5E20]" />}
        />
        <StatCard
          label="Matches Today"
          value={stats.matchesToday}
          icon={<Trophy className="h-4 w-4 text-[#1B5E20]" />}
        />
        <StatCard
          label="Rinks In Use"
          value={`${stats.courtsInUse} / ${stats.totalCourts}`}
          icon={<BarChart3 className="h-4 w-4 text-[#1B5E20]" />}
        />
        <StatCard
          label="Total Players"
          value={stats.totalPlayers}
          icon={<Users className="h-4 w-4 text-[#1B5E20]" />}
          trend={{
            value: signupGrowth,
            label: "vs last week",
          }}
        />
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Signup Trends */}
        <div className="rounded-2xl border border-[#0A2E12]/10 dark:border-white/10 bg-white dark:bg-white/5 p-5 sm:p-6 sm:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0A2E12] dark:text-[#e8f0eb]">
                Player Signups
              </h3>
              <p className="text-xs text-[#3D5A3E] dark:text-[#a8c8b4]">
                Last 7 days
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-[#1B5E20]/10 px-2.5 py-1">
              <TrendingUp className="h-3.5 w-3.5 text-[#1B5E20]" />
              <span className="text-xs font-semibold text-[#1B5E20]">
                {stats.newPlayersThisWeek} this week
              </span>
            </div>
          </div>
          <MiniBarChart data={signupTrends} />
        </div>

        {/* Weekly Summary */}
        <div className="rounded-2xl border border-[#0A2E12]/10 dark:border-white/10 bg-white dark:bg-white/5 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-[#0A2E12] dark:text-[#e8f0eb] mb-4">
            This Week
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#3D5A3E] dark:text-[#a8c8b4]" />
                <span className="text-sm text-[#3D5A3E] dark:text-[#a8c8b4]">
                  Matches
                </span>
              </div>
              <span className="text-sm font-semibold text-[#0A2E12] dark:text-[#e8f0eb]">
                {stats.matchesThisWeek}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#3D5A3E] dark:text-[#a8c8b4]" />
                <span className="text-sm text-[#3D5A3E] dark:text-[#a8c8b4]">
                  New Members
                </span>
              </div>
              <span className="text-sm font-semibold text-[#0A2E12] dark:text-[#e8f0eb]">
                {stats.newPlayersThisWeek}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#3D5A3E] dark:text-[#a8c8b4]" />
                <span className="text-sm text-[#3D5A3E] dark:text-[#a8c8b4]">
                  Total Matches
                </span>
              </div>
              <span className="text-sm font-semibold text-[#0A2E12] dark:text-[#e8f0eb]">
                {stats.totalMatches}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-2xl border border-[#0A2E12]/10 dark:border-white/10 bg-white dark:bg-white/5 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-[#0A2E12] dark:text-[#e8f0eb] mb-4">
          Recent Activity
        </h3>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-[#3D5A3E]/60 dark:text-[#a8c8b4]/60">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-[#0A2E12]/5 dark:border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                    <Trophy className="h-4 w-4 text-[#1B5E20]" />
                  </div>
                  <span className="text-sm text-[#0A2E12] dark:text-[#e8f0eb]">
                    {item.description}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#3D5A3E] dark:text-[#a8c8b4]">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
