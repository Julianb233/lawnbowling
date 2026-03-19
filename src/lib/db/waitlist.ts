import { createClient } from "@/lib/supabase/server";

export async function joinWaitlist(venueId: string, sport: string, playerId: string, partnerId?: string) {
  const supabase = await createClient();

  // Check if player already has an active waitlist entry (prevents duplicate from concurrent requests)
  const { data: existing } = await supabase
    .from("court_waitlist")
    .select("id")
    .eq("venue_id", venueId)
    .eq("sport", sport)
    .eq("player_id", playerId)
    .eq("status", "waiting")
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error("You are already on the waitlist");
  }

  // Get next position
  const { count } = await supabase
    .from("court_waitlist")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId)
    .eq("sport", sport)
    .eq("status", "waiting");

  const position = (count ?? 0) + 1;

  // Use upsert to prevent duplicates if two requests pass the check simultaneously.
  // The unique constraint on (player_id, venue_id, sport, status) where status='waiting'
  // ensures only one active entry per player per venue+sport.
  const { data, error } = await supabase
    .from("court_waitlist")
    .upsert(
      {
        venue_id: venueId,
        sport,
        player_id: playerId,
        partner_id: partnerId || null,
        position,
        status: "waiting",
      },
      {
        onConflict: "player_id,venue_id,sport,status",
        ignoreDuplicates: true,
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function leaveWaitlist(waitlistId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("court_waitlist")
    .update({ status: "expired" })
    .eq("id", waitlistId);
  if (error) throw error;
}

export async function getWaitlist(venueId: string, sport?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("court_waitlist")
    .select("*, player:players(*)")
    .eq("venue_id", venueId)
    .eq("status", "waiting")
    .order("position", { ascending: true });

  if (sport) query = query.eq("sport", sport);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPlayerPosition(venueId: string, playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("court_waitlist")
    .select("*")
    .eq("venue_id", venueId)
    .eq("player_id", playerId)
    .eq("status", "waiting")
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function getPlayerWaitStatus(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("court_waitlist")
    .select("*, venue:venues(id, name)")
    .eq("player_id", playerId)
    .eq("status", "waiting")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function promoteNextFromWaitlist(
  venueId: string,
  sport: string,
  courtId: string
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("court_waitlist")
    .select("*")
    .eq("venue_id", venueId)
    .eq("sport", sport)
    .eq("status", "waiting")
    .order("position", { ascending: true })
    .limit(1)
    .single();

  if (data) {
    await supabase
      .from("court_waitlist")
      .update({ status: "promoted" })
      .eq("id", data.id);
  }

  return data;
}

export async function notifyNextInLine(venueId: string, sport: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("court_waitlist")
    .select("*")
    .eq("venue_id", venueId)
    .eq("sport", sport)
    .eq("status", "waiting")
    .order("position", { ascending: true })
    .limit(1)
    .single();

  if (data) {
    await supabase
      .from("court_waitlist")
      .update({ status: "notified" })
      .eq("id", data.id);
  }

  return data;
}
