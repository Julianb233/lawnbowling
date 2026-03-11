import { createClient } from "@/lib/supabase/server";
import type { Court, Match } from "@/lib/types";
import { promoteNextFromWaitlist } from "@/lib/db/waitlist";

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
  updates: Partial<Pick<Court, "name" | "sport" | "is_available">>,
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
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .update({
      court_id: courtId,
      status: "playing",
      started_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .eq("status", "queued")
    .select()
    .single();
  if (matchError) throw matchError;
  const { error: courtError } = await supabase
    .from("courts")
    .update({ is_available: false })
    .eq("id", courtId);
  if (courtError) throw courtError;
  return match as Match;
}

export async function autoAssignCourt(matchId: string, sport: string) {
  const supabase = await createClient();
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

  const { data: match, error: fetchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();
  if (fetchError) throw fetchError;

  const { error: matchError } = await supabase
    .from("matches")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
    })
    .eq("id", matchId);
  if (matchError) throw matchError;

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

  if (match.court_id) {
    const { error: courtError } = await supabase
      .from("courts")
      .update({ is_available: true })
      .eq("id", match.court_id);
    if (courtError) throw courtError;

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
      } else {
        try {
          await promoteNextFromWaitlist(
            match.venue_id ?? "",
            court.sport,
            match.court_id,
          );
        } catch {
          // Waitlist promotion is best-effort
        }
      }
    }
  }

  return match as Match;
}
