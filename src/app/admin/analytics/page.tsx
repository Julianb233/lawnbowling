export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { getVenueAnalytics } from "@/lib/db/analytics";
import { StatsCard } from "@/components/admin/StatsCard";
import { PeakHoursGrid } from "@/components/admin/PeakHoursGrid";
import { SportBreakdown } from "@/components/admin/SportBreakdown";
import { ExportButton } from "@/components/admin/ExportButton";

export default async function AnalyticsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: venue } = await supabase.from("venues").select("*").limit(1).single();
  if (!venue) return <p className="text-zinc-400">No venue configured</p>;

  const analytics = await getVenueAnalytics(venue.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Analytics</h1>
          <p className="text-sm text-zinc-500">Venue performance overview</p>
        </div>
        <div className="flex gap-2">
          <ExportButton type="players" />
          <ExportButton type="matches" />
          <ExportButton type="waivers" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="Today" value={analytics.playersToday} />
        <StatsCard label="This Week" value={analytics.playersWeek} />
        <StatsCard label="This Month" value={analytics.playersMonth} trend={analytics.monthTrend} />
        <StatsCard label="Matches" value={analytics.totalMatches} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Sport Popularity
          </h3>
          <SportBreakdown breakdown={analytics.sportBreakdown} />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Peak Hours & Days
          </h3>
          <PeakHoursGrid hourCounts={analytics.peakHours} dayCounts={analytics.peakDays} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatsCard label="Avg Match Duration" value={`${analytics.avgMatchDuration} min`} />
        <StatsCard label="Court Utilization" value={`${analytics.courtUtilization}%`} />
      </div>
    </div>
  );
}
