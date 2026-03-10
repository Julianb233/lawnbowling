import { createClient } from "@/lib/supabase/server";
import type { ActivityItem } from "@/lib/types";

export async function getActivityFeed(venueId?: string, limit = 50) {
  const supabase = await createClient();
  let query = supabase
    .from("activity_feed")
    .select("*, player:players(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ActivityItem[];
}

export async function createActivityItem(item: {
  venue_id?: string;
  player_id?: string;
  type: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("activity_feed").insert(item);
  if (error) throw error;
}
