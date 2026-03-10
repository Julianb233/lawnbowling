import { createClient } from "@/lib/supabase/server";

export async function joinWaitlist(venueId: string, sport: string, playerId: string, partnerId?: string) {
  const supabase = await createClient();

  // Get next position
  const { count } = await supabase
    .from("court_waitlist")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId)
    .eq("sport", sport)
    .eq("status", "waiting");

  const position = (count ?? 0) + 1;

  const { data, error } = await supabase
    .from("court_waitlist")
    .insert({
      venue_id: venueId,
      sport,
      player_id: playerId,
      partner_id: partnerId || null,
      position,
      status: "waiting",
    })
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
