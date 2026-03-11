import { createClient } from "@/lib/supabase/server";
import type { PlayerStats, MatchResult } from "@/lib/types";
import { calculateElo } from "@/lib/matchmaking";
import { upsertPlayerSkillRating } from "@/lib/db/matchmaking";

export async function getPlayerStats(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_stats")
    .select("*, player:players(id, display_name, avatar_url, skill_level, sports)")
    .eq("player_id", playerId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as (PlayerStats & { player: { id: string; display_name: string; avatar_url: string | null; skill_level: string; sports: string[] } }) | null;
}

export type LeaderboardSortBy = "win_rate" | "games_played" | "wins" | "elo_rating";

export interface LeaderboardOptions {
  sport?: string;
  skillLevel?: string;
  sortBy?: LeaderboardSortBy;
  limit?: number;
}

export interface LeaderboardEntry {
  player_id: string;
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  elo_rating: number | null;
  favorite_sport: string | null;
  last_played_at: string | null;
  player: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    skill_level: string;
    sports: string[];
  };
}

export async function getLeaderboard(
  options?: LeaderboardOptions
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const sortBy = options?.sortBy ?? "win_rate";
  const limit = options?.limit ?? 50;

  // When filtering by sport, use player_sport_skills for sport-specific stats
  if (options?.sport) {
    let query = supabase
      .from("player_sport_skills")
      .select(
        "player_id, games_in_sport, wins, losses, elo_rating, skill_level, player:players(id, display_name, avatar_url, skill_level, sports)"
      )
      .eq("sport", options.sport)
      .gte("games_in_sport", 3);

    if (options?.skillLevel) {
      query = query.eq("skill_level", options.skillLevel);
    }

    if (sortBy === "elo_rating") {
      query = query.order("elo_rating", { ascending: false });
    } else if (sortBy === "games_played") {
      query = query.order("games_in_sport", { ascending: false });
    } else if (sortBy === "wins") {
      query = query.order("wins", { ascending: false });
    } else {
      query = query.order("wins", { ascending: false });
    }

    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: LeaderboardEntry[] = (data ?? []).map((row: any) => {
      const gamesPlayed = row.games_in_sport || 0;
      const wins = row.wins || 0;
      const losses = row.losses || 0;
      const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;
      return {
        player_id: row.player_id,
        games_played: gamesPlayed,
        wins,
        losses,
        win_rate: Math.round(winRate * 100) / 100,
        elo_rating: row.elo_rating ?? null,
        favorite_sport: options.sport ?? null,
        last_played_at: null,
        player: row.player,
      };
    });

    if (sortBy === "win_rate") {
      entries.sort((a, b) => b.win_rate - a.win_rate || b.wins - a.wins);
    }

    return entries;
  }

  // No sport filter: use player_stats (aggregate)
  let query = supabase
    .from("player_stats")
    .select(
      "*, player:players(id, display_name, avatar_url, skill_level, sports)"
    )
    .gte("games_played", 5);

  if (sortBy === "games_played") {
    query = query.order("games_played", { ascending: false });
  } else if (sortBy === "wins") {
    query = query.order("wins", { ascending: false });
  } else {
    query = query
      .order("win_rate", { ascending: false })
      .order("wins", { ascending: false });
  }

  query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  // Filter by skill level client-side (joined field)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filtered = (data ?? []).filter((row: any) => row.player !== null);
  if (options?.skillLevel) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filtered = filtered.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (row: any) => row.player?.skill_level === options.skillLevel
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return filtered.map((row: any) => ({
    player_id: row.player_id,
    games_played: row.games_played || 0,
    wins: row.wins || 0,
    losses: row.losses || 0,
    win_rate: row.win_rate || 0,
    elo_rating: null,
    favorite_sport: row.favorite_sport ?? null,
    last_played_at: row.last_played_at ?? null,
    player: row.player,
  })) as LeaderboardEntry[];
}

export async function getFavoritePartners(playerId: string, options?: { limit?: number }) {
  const supabase = await createClient();
  const limit = options?.limit ?? 5;

  // Get all matches this player was in
  const { data: playerMatches } = await supabase
    .from("match_players")
    .select("match_id, team")
    .eq("player_id", playerId);

  if (!playerMatches?.length) return [];

  const matchIds = playerMatches.map((pm) => pm.match_id);
  const teamByMatch = new Map(playerMatches.map((pm) => [pm.match_id, pm.team]));

  // Get all players in those matches on the same team
  const { data: allMatchPlayers } = await supabase
    .from("match_players")
    .select("match_id, player_id, team, players:players(id, display_name, avatar_url, skill_level)")
    .in("match_id", matchIds)
    .neq("player_id", playerId);

  if (!allMatchPlayers?.length) return [];

  // Count games with each partner (same team)
  const partnerMap = new Map<string, { games: number; wins: number; player: unknown }>();
  for (const mp of allMatchPlayers) {
    if (mp.team === teamByMatch.get(mp.match_id)) {
      const existing = partnerMap.get(mp.player_id) || { games: 0, wins: 0, player: mp.players };
      existing.games++;
      partnerMap.set(mp.player_id, existing);
    }
  }

  // Sort by games together, take top N
  const sorted = [...partnerMap.entries()]
    .sort((a, b) => b[1].games - a[1].games)
    .slice(0, limit);

  return sorted.map(([partnerId, data]) => ({
    partner_id: partnerId,
    games_together: data.games,
    wins_together: data.wins,
    win_rate_together: data.games > 0 ? Math.round((data.wins / data.games) * 100) : 0,
    last_played_at: null,
    partner: data.player,
  }));
}

export async function reportMatchResult(result: {
  match_id: string;
  winner_team: 1 | 2 | null;
  team1_score?: number;
  team2_score?: number;
  reported_by: string;
}) {
  const supabase = await createClient();

  // Insert match result
  const { data, error } = await supabase
    .from("match_results")
    .insert(result)
    .select()
    .single();

  if (error) throw error;
  const matchResult = data as MatchResult;

  // Get match players to update stats
  const { data: matchPlayers, error: mpError } = await supabase
    .from("match_players")
    .select("player_id, team")
    .eq("match_id", result.match_id);

  if (mpError) throw mpError;

  // Get the match sport
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("sport")
    .eq("id", result.match_id)
    .single();

  if (matchError) throw matchError;

  // Update each player's stats
  for (const mp of matchPlayers ?? []) {
    const isWinner = result.winner_team !== null && mp.team === result.winner_team;
    const isLoser = result.winner_team !== null && mp.team !== null && mp.team !== result.winner_team;

    // Upsert player stats
    const { data: existing } = await supabase
      .from("player_stats")
      .select("*")
      .eq("player_id", mp.player_id)
      .single();

    if (existing) {
      const gamesPlayed = existing.games_played + 1;
      const wins = existing.wins + (isWinner ? 1 : 0);
      const losses = existing.losses + (isLoser ? 1 : 0);
      const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

      await supabase
        .from("player_stats")
        .update({
          games_played: gamesPlayed,
          wins,
          losses,
          win_rate: Math.round(winRate * 100) / 100,
          favorite_sport: match.sport,
          last_played_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("player_id", mp.player_id);
    } else {
      await supabase.from("player_stats").insert({
        player_id: mp.player_id,
        games_played: 1,
        wins: isWinner ? 1 : 0,
        losses: isLoser ? 1 : 0,
        win_rate: isWinner ? 100 : 0,
        favorite_sport: match.sport,
        last_played_at: new Date().toISOString(),
      });
    }
  }

  // Update per-sport ELO ratings
  if (result.winner_team !== null && matchPlayers && matchPlayers.length >= 2) {
    const winners = matchPlayers.filter((mp) => mp.team === result.winner_team);
    const losers = matchPlayers.filter(
      (mp) => mp.team !== null && mp.team !== result.winner_team
    );

    const allPlayerIds = matchPlayers.map((mp) => mp.player_id);
    const { data: skillRows } = await supabase
      .from("player_sport_skills")
      .select("player_id, elo_rating")
      .eq("sport", match.sport)
      .in("player_id", allPlayerIds);

    const eloMap = new Map<string, number>();
    for (const row of skillRows ?? []) {
      eloMap.set(row.player_id, row.elo_rating);
    }

    const defaultElo = 1200;

    for (const winner of winners) {
      const winnerElo = eloMap.get(winner.player_id) ?? defaultElo;
      const avgLoserElo =
        losers.reduce((sum, l) => sum + (eloMap.get(l.player_id) ?? defaultElo), 0) /
        (losers.length || 1);
      const [newWinnerElo] = calculateElo(winnerElo, avgLoserElo);
      await upsertPlayerSkillRating(winner.player_id, match.sport, newWinnerElo, true);
    }

    for (const loser of losers) {
      const loserElo = eloMap.get(loser.player_id) ?? defaultElo;
      const avgWinnerElo =
        winners.reduce((sum, w) => sum + (eloMap.get(w.player_id) ?? defaultElo), 0) /
        (winners.length || 1);
      const [, newLoserElo] = calculateElo(avgWinnerElo, loserElo);
      await upsertPlayerSkillRating(loser.player_id, match.sport, newLoserElo, false);
    }
  }

  return matchResult;
}

export async function getMatchHistory(playerId: string, options?: { sport?: string; limit?: number; offset?: number }) {
  const supabase = await createClient();

  // Get match IDs for this player
  const { data: playerMatches, error: pmError } = await supabase
    .from("match_players")
    .select("match_id, team")
    .eq("player_id", playerId);

  if (pmError) throw pmError;
  if (!playerMatches?.length) return [];

  const matchIds = playerMatches.map((pm) => pm.match_id);

  let query = supabase
    .from("matches")
    .select("*, courts(name), match_players(player_id, team, players:players(id, display_name, avatar_url)), match_results(*)")
    .in("id", matchIds)
    .eq("status", "completed")
    .order("ended_at", { ascending: false })
    .limit(options?.limit ?? 20);

  if (options?.sport) {
    query = query.eq("sport", options.sport);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
