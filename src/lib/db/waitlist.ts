import { createClient } from "@/lib/supabase/server";
import { sendPushToPlayer } from "@/lib/push";

export async function joinWaitlist(venueId: string, sport: string, playerId: string, partnerId?: string) {
  const supabase = await createClient();

  // Check if player already waiting
  const { data: existing } = await supabase
    .from("court_waitlist")
    .select("id")
    .eq("player_id", playerId)
    .eq("status", "waiting")
    .single();

  if (existing) {
    throw new Error("You are already on the wait list");
  }

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

  // Calculate estimated wait time
  const estimate = await estimateWaitTime(venueId, sport, position);

  return { ...data, estimated_minutes: estimate };
}

export async function leaveWaitlist(waitlistId: string) {
  const supabase = await createClient();

  // Get the entry being removed
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

  // Reorder positions after removal
  if (entry) {
    await reorderPositions(entry.venue_id, entry.sport);
  }
}

export async function getWaitlist(venueId: string, sport?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("court_waitlist")
    .select("*, player:players(id, display_name, avatar_url)")
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

/**
 * Get a player's wait status with estimated wait time.
 */
export async function getPlayerWaitStatus(playerId: string) {
  const supabase = await createClient();

  // Find player's active wait entry
  const { data: entry } = await supabase
    .from("court_waitlist")
    .select("*, player:players(id, display_name, avatar_url)")
    .eq("player_id", playerId)
    .eq("status", "waiting")
    .single();

  if (!entry) {
    return { entry: null, position: null, estimatedMinutes: null, totalWaiting: 0 };
  }

  // Count total waiting in same sport/venue
  const { count: totalWaiting } = await supabase
    .from("court_waitlist")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", entry.venue_id)
    .eq("sport", entry.sport)
    .eq("status", "waiting");

  const estimatedMinutes = await estimateWaitTime(entry.venue_id, entry.sport, entry.position);

  return {
    entry,
    position: entry.position,
    estimatedMinutes,
    totalWaiting: totalWaiting ?? 0,
  };
}

/**
 * Estimate wait time based on position, active courts, and average match duration.
 */
async function estimateWaitTime(venueId: string, sport: string, position: number): Promise<number> {
  const supabase = await createClient();

  // Count courts for this sport at this venue
  const { count: courtCount } = await supabase
    .from("courts")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", venueId)
    .eq("sport", sport);

  // Get average match duration from recent completed matches
  const { data: recentMatches } = await supabase
    .from("matches")
    .select("started_at, ended_at")
    .eq("sport", sport)
    .eq("status", "completed")
    .not("started_at", "is", null)
    .not("ended_at", "is", null)
    .order("ended_at", { ascending: false })
    .limit(10);

  let avgMinutes = 20; // default
  if (recentMatches && recentMatches.length > 0) {
    const durations = recentMatches
      .map((m) => {
        const ms = new Date(m.ended_at!).getTime() - new Date(m.started_at!).getTime();
        return ms / 60000;
      })
      .filter((d) => d > 0 && d < 180);

    if (durations.length > 0) {
      avgMinutes = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    }
  }

  // Wait cycles = ceil(position / courts)
  const courts = Math.max(courtCount ?? 1, 1);
  const cycles = Math.ceil(position / courts);
  return Math.round(cycles * avgMinutes);
}

/**
 * Notify and match the next players from the waitlist when a court frees up.
 * Called from completeMatch.
 */
export async function dequeueFromWaitlist(venueId: string, sport: string, courtId: string): Promise<string | null> {
  const supabase = await createClient();

  // Get the next 2 waiting players
  const { data: waiting } = await supabase
    .from("court_waitlist")
    .select("*")
    .eq("venue_id", venueId)
    .eq("sport", sport)
    .eq("status", "waiting")
    .order("position", { ascending: true })
    .limit(2);

  if (!waiting || waiting.length < 2) {
    // Not enough players for a match. If there's 1, notify them they're next.
    if (waiting && waiting.length === 1) {
      sendPushToPlayer(waiting[0].player_id, "waitlist_update", {
        title: "You're Next!",
        body: `A court just opened for ${sport}. Waiting for one more player.`,
        tag: `waitlist-next-${waiting[0].id}`,
        url: "/board",
      }).catch((err: unknown) => console.error("Push failed:", err));
    }
    return null;
  }

  const [player1, player2] = waiting;

  // Check partner preferences
  // If player1 wants a specific partner and they're player2, great
  // If not, still proceed with FIFO order
  let matchPlayer1 = player1;
  let matchPlayer2 = player2;

  if (player1.partner_id) {
    const preferredInQueue = waiting.find((w) => w.player_id === player1.partner_id);
    if (preferredInQueue) {
      matchPlayer2 = preferredInQueue;
    }
  }

  // Create the match
  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .insert({
      sport,
      status: "queued",
      venue_id: venueId,
    })
    .select()
    .single();

  if (matchError) throw matchError;

  // Add match players
  await supabase.from("match_players").insert([
    { match_id: matchData.id, player_id: matchPlayer1.player_id, team: 1 },
    { match_id: matchData.id, player_id: matchPlayer2.player_id, team: 2 },
  ]);

  // Mark both unavailable
  await supabase
    .from("players")
    .update({ is_available: false })
    .in("id", [matchPlayer1.player_id, matchPlayer2.player_id]);

  // Update waitlist entries
  await supabase
    .from("court_waitlist")
    .update({ status: "matched" })
    .in("id", [matchPlayer1.id, matchPlayer2.id]);

  // Assign the court
  const { assignCourtToMatch } = await import("@/lib/db/courts");
  await assignCourtToMatch(matchData.id, courtId);

  // Reorder remaining positions
  await reorderPositions(venueId, sport);

  return matchData.id;
}

/**
 * Reorder positions after someone leaves or gets matched.
 */
async function reorderPositions(venueId: string, sport: string) {
  const supabase = await createClient();

  const { data: remaining } = await supabase
    .from("court_waitlist")
    .select("id")
    .eq("venue_id", venueId)
    .eq("sport", sport)
    .eq("status", "waiting")
    .order("position", { ascending: true });

  if (!remaining) return;

  for (let i = 0; i < remaining.length; i++) {
    await supabase
      .from("court_waitlist")
      .update({ position: i + 1 })
      .eq("id", remaining[i].id);
  }
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

    sendPushToPlayer(data.player_id, "waitlist_update", {
      title: "You're Up Next!",
      body: `A court is about to open for ${sport}. Get ready!`,
      tag: `waitlist-next-${data.id}`,
      url: "/board",
    }).catch((err: unknown) => console.error("Push failed:", err));
  }

  return data;
}
