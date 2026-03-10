import { createClient } from "@/lib/supabase/server";
import type { Tournament, TournamentParticipant, TournamentMatch } from "@/lib/types";

export async function listTournaments(venueId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("tournaments")
    .select("*, creator:players!tournaments_created_by_fkey(id, display_name, avatar_url), tournament_participants(count)")
    .order("created_at", { ascending: false });

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createTournament(tournament: {
  name: string;
  sport: string;
  format: string;
  max_players?: number;
  created_by: string;
  venue_id?: string;
  starts_at?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .insert(tournament)
    .select()
    .single();

  if (error) throw error;
  return data as Tournament;
}

export async function getTournament(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*, creator:players!tournaments_created_by_fkey(id, display_name, avatar_url)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function joinTournament(tournamentId: string, playerId: string) {
  const supabase = await createClient();

  // Check if tournament is still in registration and has space
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("status, max_players")
    .eq("id", tournamentId)
    .single();

  if (!tournament || tournament.status !== "registration") {
    throw new Error("Tournament is not accepting registrations");
  }

  const { count } = await supabase
    .from("tournament_participants")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournamentId);

  if (count !== null && count >= tournament.max_players) {
    throw new Error("Tournament is full");
  }

  const { data, error } = await supabase
    .from("tournament_participants")
    .insert({ tournament_id: tournamentId, player_id: playerId })
    .select()
    .single();

  if (error) throw error;
  return data as TournamentParticipant;
}

export async function leaveTournament(tournamentId: string, playerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tournament_participants")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId);

  if (error) throw error;
}

export async function getParticipants(tournamentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournament_participants")
    .select("*, player:players(*)")
    .eq("tournament_id", tournamentId)
    .order("seed", { ascending: true });

  if (error) throw error;
  return data as (TournamentParticipant & { player: NonNullable<TournamentParticipant["player"]> })[];
}

export async function getTournamentMatches(tournamentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournament_matches")
    .select("*, player1:players!tournament_matches_player1_id_fkey(id, display_name, avatar_url), player2:players!tournament_matches_player2_id_fkey(id, display_name, avatar_url), winner:players!tournament_matches_winner_id_fkey(id, display_name, avatar_url)")
    .eq("tournament_id", tournamentId)
    .order("round", { ascending: true })
    .order("match_number", { ascending: true });

  if (error) throw error;
  return data;
}

export async function generateRoundRobinBracket(tournamentId: string) {
  const supabase = await createClient();

  const participants = await getParticipants(tournamentId);
  if (participants.length < 2) throw new Error("Need at least 2 participants");

  const matches: Omit<TournamentMatch, "id" | "completed_at" | "player1" | "player2" | "winner">[] = [];
  let round = 1;
  let matchNumber = 1;

  // Round robin: every player plays every other player
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      matches.push({
        tournament_id: tournamentId,
        round,
        match_number: matchNumber++,
        player1_id: participants[i].player_id,
        player2_id: participants[j].player_id,
        winner_id: null,
        score: null,
        court_id: null,
        status: "pending",
        scheduled_at: null,
      });
    }
    // New round after each set
    if (matchNumber > participants.length / 2) {
      round++;
      matchNumber = 1;
    }
  }

  const { error } = await supabase.from("tournament_matches").insert(matches);
  if (error) throw error;

  // Update tournament status
  await supabase
    .from("tournaments")
    .update({ status: "in_progress" })
    .eq("id", tournamentId);

  return matches;
}

export async function generateSingleEliminationBracket(tournamentId: string) {
  const supabase = await createClient();

  const participants = await getParticipants(tournamentId);
  if (participants.length < 2) throw new Error("Need at least 2 participants");

  // Seed participants
  const seeded = [...participants];
  for (let i = 0; i < seeded.length; i++) {
    await supabase
      .from("tournament_participants")
      .update({ seed: i + 1 })
      .eq("tournament_id", tournamentId)
      .eq("player_id", seeded[i].player_id);
  }

  // Calculate rounds needed
  const totalRounds = Math.ceil(Math.log2(seeded.length));
  const bracketSize = Math.pow(2, totalRounds);
  const byes = bracketSize - seeded.length;

  const matches: Omit<TournamentMatch, "id" | "completed_at" | "player1" | "player2" | "winner">[] = [];

  // First round
  let matchNumber = 1;
  for (let i = 0; i < bracketSize / 2; i++) {
    const p1 = seeded[i] ?? null;
    const p2 = seeded[bracketSize - 1 - i] ?? null;

    matches.push({
      tournament_id: tournamentId,
      round: 1,
      match_number: matchNumber++,
      player1_id: p1?.player_id ?? null,
      player2_id: p2?.player_id ?? null,
      winner_id: null,
      score: null,
      court_id: null,
      status: "pending",
      scheduled_at: null,
    });
  }

  // Subsequent rounds (empty placeholders)
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    for (let m = 0; m < matchesInRound; m++) {
      matches.push({
        tournament_id: tournamentId,
        round,
        match_number: m + 1,
        player1_id: null,
        player2_id: null,
        winner_id: null,
        score: null,
        court_id: null,
        status: "pending",
        scheduled_at: null,
      });
    }
  }

  // Handle byes: auto-advance players with no opponent
  for (const match of matches) {
    if (match.round === 1) {
      if (match.player1_id && !match.player2_id) {
        match.winner_id = match.player1_id;
        match.status = "completed";
      } else if (!match.player1_id && match.player2_id) {
        match.winner_id = match.player2_id;
        match.status = "completed";
      }
    }
  }

  const { error } = await supabase.from("tournament_matches").insert(matches);
  if (error) throw error;

  await supabase
    .from("tournaments")
    .update({ status: "in_progress" })
    .eq("id", tournamentId);

  return matches;
}

export async function recordTournamentResult(matchId: string, winnerId: string, score: string) {
  const supabase = await createClient();

  // Get the match
  const { data: match, error: matchError } = await supabase
    .from("tournament_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError || !match) throw new Error("Match not found");
  if (match.status === "completed") throw new Error("Match already completed");

  const loserId = winnerId === match.player1_id ? match.player2_id : match.player1_id;

  // Update match
  const { error } = await supabase
    .from("tournament_matches")
    .update({
      winner_id: winnerId,
      score,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (error) throw error;

  // Update participant stats
  if (winnerId) {
    const { data: wp } = await supabase
      .from("tournament_participants")
      .select("wins")
      .eq("tournament_id", match.tournament_id)
      .eq("player_id", winnerId)
      .single();
    if (wp) {
      await supabase
        .from("tournament_participants")
        .update({ wins: wp.wins + 1 })
        .eq("tournament_id", match.tournament_id)
        .eq("player_id", winnerId);
    }
  }

  if (loserId) {
    const { data: lp } = await supabase
      .from("tournament_participants")
      .select("losses, eliminated")
      .eq("tournament_id", match.tournament_id)
      .eq("player_id", loserId)
      .single();
    if (lp) {
      await supabase
        .from("tournament_participants")
        .update({ losses: lp.losses + 1 })
        .eq("tournament_id", match.tournament_id)
        .eq("player_id", loserId);
    }
  }

  // For single elimination: advance winner to next round
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("format")
    .eq("id", match.tournament_id)
    .single();

  if (tournament?.format === "single_elimination") {
    // Find next round match and place winner
    const nextRound = match.round + 1;
    const nextMatchNumber = Math.ceil(match.match_number / 2);

    const { data: nextMatch } = await supabase
      .from("tournament_matches")
      .select("*")
      .eq("tournament_id", match.tournament_id)
      .eq("round", nextRound)
      .eq("match_number", nextMatchNumber)
      .single();

    if (nextMatch) {
      const slot = match.match_number % 2 === 1 ? "player1_id" : "player2_id";
      await supabase
        .from("tournament_matches")
        .update({ [slot]: winnerId })
        .eq("id", nextMatch.id);
    }

    // Mark loser as eliminated
    if (loserId) {
      await supabase
        .from("tournament_participants")
        .update({ eliminated: true })
        .eq("tournament_id", match.tournament_id)
        .eq("player_id", loserId);
    }
  }

  // Check if tournament is complete
  const { count: remaining } = await supabase
    .from("tournament_matches")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", match.tournament_id)
    .neq("status", "completed");

  if (remaining === 0) {
    await supabase
      .from("tournaments")
      .update({ status: "completed" })
      .eq("id", match.tournament_id);
  }

  return { winnerId, loserId };
}

export async function getTournamentStandings(tournamentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournament_participants")
    .select("*, player:players(id, display_name, avatar_url, skill_level)")
    .eq("tournament_id", tournamentId)
    .order("wins", { ascending: false })
    .order("losses", { ascending: true });

  if (error) throw error;
  return data;
}
