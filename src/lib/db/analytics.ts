import { createClient } from "@/lib/supabase/server";

export async function getVenueAnalytics(venueId: string) {
  const supabase = await createClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const prevMonthStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();

  // Players today
  const { count: playersToday } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId)
    .gte("checked_in_at", todayStart);

  // Players this week
  const { count: playersWeek } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId)
    .gte("checked_in_at", weekStart);

  // Players this month
  const { count: playersMonth } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId)
    .gte("checked_in_at", monthStart);

  // Players prev month (for trend)
  const { count: playersPrevMonth } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId)
    .gte("checked_in_at", prevMonthStart)
    .lt("checked_in_at", monthStart);

  // Matches this month
  const { data: recentMatches } = await supabase
    .from("matches")
    .select("sport, started_at, ended_at, status")
    .eq("venue_id", venueId)
    .gte("created_at", monthStart);

  // Sport breakdown
  const sportCounts: Record<string, number> = {};
  let totalDuration = 0;
  let matchCount = 0;

  for (const m of recentMatches || []) {
    sportCounts[m.sport] = (sportCounts[m.sport] || 0) + 1;
    if (m.started_at && m.ended_at) {
      totalDuration +=
        new Date(m.ended_at).getTime() - new Date(m.started_at).getTime();
      matchCount++;
    }
  }

  const avgMatchDuration = matchCount > 0 ? Math.round(totalDuration / matchCount / 60000) : 0;

  // Courts utilization
  const { count: totalCourts } = await supabase
    .from("courts")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId);

  const { count: busyCourts } = await supabase
    .from("courts")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId)
    .eq("is_available", false);

  const courtUtilization =
    totalCourts && totalCourts > 0
      ? Math.round(((busyCourts || 0) / totalCourts) * 100)
      : 0;

  // Peak hours (simplified: return array of hour counts from activity feed)
  const { data: activityData } = await supabase
    .from("activity_feed")
    .select("created_at")
    .eq("venue_id", venueId)
    .eq("type", "check_in")
    .gte("created_at", monthStart);

  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);
  for (const a of activityData || []) {
    const d = new Date(a.created_at);
    hourCounts[d.getHours()]++;
    dayCounts[d.getDay()]++;
  }

  return {
    playersToday: playersToday || 0,
    playersWeek: playersWeek || 0,
    playersMonth: playersMonth || 0,
    monthTrend:
      playersPrevMonth && playersPrevMonth > 0
        ? Math.round(
            (((playersMonth || 0) - playersPrevMonth) / playersPrevMonth) * 100
          )
        : 0,
    sportBreakdown: sportCounts,
    avgMatchDuration,
    courtUtilization,
    totalMatches: recentMatches?.length || 0,
    peakHours: hourCounts,
    peakDays: dayCounts,
  };
}
