import { createClient } from "@/lib/supabase/server";
import { sendPushToPlayer } from "@/lib/push";
import type { Court, Match } from "@/lib/types";

export async function listCourts(venueId?: string) {
  const supabase = await createClient();
  let query = supabase.from("courts").select("*").order("name");
  if (venueId) query = query.eq("venue_id", venueId);
  const { data, error } = await query;
  if (error) throw error;
  return data as Court[];
}

export async function getCourtById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Court;
}

export async function createCourt(court: {
  venue_id: string;
  name: string;
  sport: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courts")
    .insert({ ...court, is_available: true })
    .select()
    .single();
  if (error) throw error;
  return data as Court;
}

export async function updateCourt(
  id: string,
  updates: Partial<Pick<Court, "name" | "sport" | "is_available">>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Court;
}

export async function deleteCourt(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("courts").delete().eq("id", id);
  if (error) throw error;
}

export async function assignCourtToMatch(matchId: string, courtId: string) {
  const supabase = await createClient();

  // Atomically update both match and court inside a single DB transaction
  // via the assign_court_to_match Postgres function (see migration
  // 20260323_assign_court_transaction.sql).  If either UPDATE fails the
  // whole transaction is rolled back, preventing partial state where the
  // court appears occupied but the match is still "queued" (or vice-versa).
  const { data: match, error } = await supabase
    .rpc("assign_court_to_match", {
      p_match_id: matchId,
      p_court_id: courtId,
    })
    .single();

  if (error) throw error;

  // Notify match players that a court has been assigned.
  // Push notifications are fire-and-forget — failures are logged but must
  // not roll back the already-committed court assignment.
  const { data: courtPlayersData } = await supabase
    .from("match_players").select("player_id").eq("match_id", matchId);
  const { data: courtInfoData } = await supabase
    .from("courts").select("name").eq("id", courtId).single();
  if (courtPlayersData) {
    for (const mp of courtPlayersData) {
      sendPushToPlayer(mp.player_id, "court_available", {
        title: "Court Ready!",
        body: `You've been assigned to ${courtInfoData?.name || "a court"}. Head over now!`,
        tag: `court-assigned-${matchId}`,
        url: "/board",
      }).catch((err: unknown) => console.error("Push notification failed:", err));
    }
  }

  return match as Match;
}

export async function autoAssignCourt(matchId: string, sport: string) {
  const supabase = await createClient();

  // Find first available court for this sport
  const { data: court } = await supabase
    .from("courts")
    .select("*")
    .eq("sport", sport)
    .eq("is_available", true)
    .limit(1)
    .single();

  if (!court) return null;

  return assignCourtToMatch(matchId, court.id);
}

export async function completeMatch(matchId: string) {
  const supabase = await createClient();

  // Get match to find the court
  const { data: match, error: fetchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (fetchError) throw fetchError;

  if (match.status === "completed") {
    throw new Error("Match is already completed");
  }

  // Mark match completed
  const { error: matchError } = await supabase
    .from("matches")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (matchError) throw matchError;

  // Auto-increment games_played for all match players
  const { data: matchPlayers } = await supabase
    .from("match_players")
    .select("player_id")
    .eq("match_id", matchId);

  if (matchPlayers) {
    for (const mp of matchPlayers) {
      const { data: existing } = await supabase
        .from("player_stats")
        .select("*")
        .eq("player_id", mp.player_id)
        .single();

      if (existing) {
        await supabase
          .from("player_stats")
          .update({
            games_played: existing.games_played + 1,
            last_played_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("player_id", mp.player_id);
      } else {
        await supabase.from("player_stats").insert({
          player_id: mp.player_id,
          games_played: 1,
          wins: 0,
          losses: 0,
          win_rate: 0,
          favorite_sport: match.sport,
          last_played_at: new Date().toISOString(),
        });
      }
    }
  }

  // Archive match_players: delete records and restore player availability
  if (matchPlayers) {
    const playerIds = matchPlayers.map((mp) => mp.player_id);

    const { error: deleteError } = await supabase
      .from("match_players")
      .delete()
      .eq("match_id", matchId);

    if (deleteError) throw deleteError;

    const { error: availError } = await supabase
      .from("players")
      .update({ is_available: true })
      .in("id", playerIds);

    if (availError) throw availError;
  }

  // Free up the court
  if (match.court_id) {
    const { error: courtError } = await supabase
      .from("courts")
      .update({ is_available: true })
      .eq("id", match.court_id);

    if (courtError) throw courtError;

    // Auto-assign next queued match for this sport to the freed court
    const { data: court } = await supabase
      .from("courts")
      .select("sport")
      .eq("id", match.court_id)
      .single();

    if (court) {
      const { data: nextMatch } = await supabase
        .from("matches")
        .select("id")
        .eq("status", "queued")
        .eq("sport", court.sport)
        .is("court_id", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (nextMatch) {
        await assignCourtToMatch(nextMatch.id, match.court_id);
      }
    }
  }

  return match as Match;
}
