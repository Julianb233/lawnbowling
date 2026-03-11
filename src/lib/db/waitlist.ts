import { createClient } from "@/lib/supabase/server";

/** Default match duration per sport (minutes) for wait-time estimates */
const SPORT_DURATION: Record<string, number> = {
  pickleball: 20,
  tennis: 45,
  badminton: 25,
  lawn_bowling: 30,
  racquetball: 30,
  flag_football: 40,
};

const DEFAULT_DURATION = 25;

export async function joinWaitlist(
  venueId: string,
  sport: string,
  playerId: string,
  partnerId?: string,
) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("court_waitlist")
    .select("id")
    .eq("venue_id", venueId)
    .eq("player_id", playerId)
    .eq("status", "waiting")
    .maybeSingle();

  if (existing) {
    throw new Error("You are already on the waitlist");
  }

  const { count } = await supabase
    .from("court_waitlist")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId)
    .eq("sport", sport)
    .eq("status", "waiting");

  const position = (count ?? 0) + 1;
  const estimatedWait = await estimateWaitMinutes(venueId, sport, position);

  const { data, error } = await supabase
    .from("court_waitlist")
    .insert({
      venue_id: venueId,
      sport,
      player_id: playerId,
      partner_id: partnerId || null,
      position,
      status: "waiting",
      estimated_wait_minutes: estimatedWait,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function leaveWaitlist(waitlistId: string) {
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("court_waitlist")
    .select("venue_id, sport, position")
    .eq("id", waitlistId)
    .single();

  const { error } = await supabase
    .from("court_waitlist")
    .update({ status: "expired" })
    .eq("id", waitlistId);

  if (error) throw error;

  if (entry) {
    await recompactPositions(entry.venue_id, entry.sport);
  }
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

export async function promoteNextFromWaitlist(
  venueId: string,
  sport: string,
  courtId: string,
) {
  const supabase = await createClient();

  const { data: nextEntry } = await supabase
    .from("court_waitlist")
    .select("*")
    .eq("venue_id", venueId)
    .eq("sport", sport)
    .eq("status", "waiting")
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!nextEntry) return null;

  const playerIds = [nextEntry.player_id];
  if (nextEntry.partner_id) playerIds.push(nextEntry.partner_id);

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      sport,
      venue_id: venueId,
      court_id: courtId,
      status: "playing",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (matchError) throw matchError;

  const matchPlayers = playerIds.map((pid, i) => ({
    match_id: match.id,
    player_id: pid,
    team: (i + 1) as 1 | 2,
  }));

  await supabase.from("match_players").insert(matchPlayers);

  await supabase
    .from("courts")
    .update({ is_available: false })
    .eq("id", courtId);

  await supabase
    .from("players")
    .update({ is_available: false })
    .in("id", playerIds);

  await supabase
    .from("court_waitlist")
    .update({
      status: "assigned",
      assigned_match_id: match.id,
    })
    .eq("id", nextEntry.id);

  await recompactPositions(venueId, sport);

  return match;
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
      .update({ status: "notified", notified_at: new Date().toISOString() })
      .eq("id", data.id);
  }

  return data;
}

export async function estimateWaitMinutes(
  venueId: string,
  sport: string,
  position: number,
): Promise<number> {
  const supabase = await createClient();

  const { count: courtCount } = await supabase
    .from("courts")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId)
    .eq("sport", sport);

  const totalCourts = courtCount ?? 1;

  const { data: activeMatches } = await supabase
    .from("matches")
    .select("started_at, sport, court_id")
    .eq("venue_id", venueId)
    .eq("sport", sport)
    .eq("status", "playing")
    .not("started_at", "is", null);

  const avgDuration = SPORT_DURATION[sport] ?? DEFAULT_DURATION;

  if (!activeMatches || activeMatches.length === 0) {
    return 0;
  }

  const now = Date.now();
  const remainingTimes = activeMatches.map((m) => {
    const elapsed = (now - new Date(m.started_at!).getTime()) / 60000;
    const remaining = Math.max(avgDuration - elapsed, 0);
    return remaining;
  });

  remainingTimes.sort((a, b) => a - b);

  const groupsAhead = position - 1;
  const roundsAhead = Math.floor(groupsAhead / totalCourts);
  const courtIndex = groupsAhead % totalCourts;
  const soonestFree = remainingTimes[courtIndex] ?? remainingTimes[0] ?? 0;

  const estimated = Math.ceil(soonestFree + roundsAhead * avgDuration);
  return Math.max(estimated, 0);
}

async function recompactPositions(venueId: string, sport: string) {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("court_waitlist")
    .select("id")
    .eq("venue_id", venueId)
    .eq("sport", sport)
    .eq("status", "waiting")
    .order("position", { ascending: true });

  if (!entries) return;

  for (let i = 0; i < entries.length; i++) {
    const newPosition = i + 1;
    const est = await estimateWaitMinutes(venueId, sport, newPosition);
    await supabase
      .from("court_waitlist")
      .update({ position: newPosition, estimated_wait_minutes: est })
      .eq("id", entries[i].id);
  }
}
