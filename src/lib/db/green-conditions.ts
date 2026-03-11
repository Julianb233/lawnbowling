import { createClient } from "@/lib/supabase/server";
import type { GreenConditions } from "@/lib/types";

export async function getGreenConditions(tournamentId: string): Promise<GreenConditions | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("green_conditions")
    .select("*, recorder:players!green_conditions_recorded_by_fkey(id, display_name, avatar_url)")
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  return data as GreenConditions | null;
}

export async function getGreenConditionsHistory(venueId: string, limit = 10): Promise<GreenConditions[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("green_conditions")
    .select("*, recorder:players!green_conditions_recorded_by_fkey(id, display_name)")
    .eq("venue_id", venueId)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  return (data as GreenConditions[]) ?? [];
}

export async function getGreenConditionsSummary(
  venueId: string,
  seasonYear: number
): Promise<{
  totalSessions: number;
  speedBreakdown: Record<string, number>;
  surfaceBreakdown: Record<string, number>;
}> {
  const supabase = await createClient();
  const startDate = `${seasonYear}-01-01T00:00:00Z`;
  const endDate = `${seasonYear + 1}-01-01T00:00:00Z`;

  const { data } = await supabase
    .from("green_conditions")
    .select("green_speed, surface_condition")
    .eq("venue_id", venueId)
    .gte("recorded_at", startDate)
    .lt("recorded_at", endDate);

  const records = data ?? [];
  const totalSessions = records.length;

  const speedBreakdown: Record<string, number> = {};
  const surfaceBreakdown: Record<string, number> = {};

  for (const r of records) {
    speedBreakdown[r.green_speed] = (speedBreakdown[r.green_speed] ?? 0) + 1;
    surfaceBreakdown[r.surface_condition] = (surfaceBreakdown[r.surface_condition] ?? 0) + 1;
  }

  return { totalSessions, speedBreakdown, surfaceBreakdown };
}
