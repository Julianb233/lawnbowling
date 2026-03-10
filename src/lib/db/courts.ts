import { createClient } from "@/lib/supabase/server";
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

  // Mark match as playing on this court
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

  // Mark court as unavailable
  const { error: courtError } = await supabase
    .from("courts")
    .update({ is_available: false })
    .eq("id", courtId);

  if (courtError) throw courtError;

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

  // Mark match completed
  const { error: matchError } = await supabase
    .from("matches")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (matchError) throw matchError;

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
