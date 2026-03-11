import { createClient } from "@/lib/supabase/server";
import type { PlayerStats, MatchResult, FavoritePartner } from "@/lib/types";
import { calculateElo } from "@/lib/matchmaking";
import { upsertPlayerSkillRating } from "@/lib/db/matchmaking";

export async function getPlayerStats(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_stats")
    .select("*, player:players!player_stats_player_id_fkey(id, display_name, avatar_url, skill_level, sports)")
    .eq("player_id", playerId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as (PlayerStats & { player: { id: string; display_name: string; avatar_url: string | null; skill_level: string; sports: string[] } }) | null;
}

export async function getLeaderboard(options?: { sport?: string; limit?: number; clubId?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("player_stats")
    .select("*, player:players!player_stats_player_id_fkey(id, display_name, avatar_url, skill_level, sports, home_club_id)")
    .gte("games_played", 5)
    .order("win_rate", { ascending: false })
    .order("wins", { ascending: false })
    .limit(options?.limit ?? 20);

  if (options?.sport) {
    query = query.eq("favorite_sport", options.sport);
  }

  if (options?.clubId) {
    query = query.eq("player.home_club_id", options.clubId);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Filter out null players when club filter is applied (Supabase returns nulls for non-matching joins)
  const results = options?.clubId
    ? (data ?? []).filter((entry: Record<string, unknown>) => entry.player != null)
    : (data ?? []);

  return results as (PlayerStats & { player: { id: string; display_name: string; avatar_url: string | null; skill_level: string; sports: string[] } })[];
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

  // Update partner stats for teammates
  if (matchPlayers && matchPlayers.length >= 2) {
    const teams = new Map<number, string[]>();
    for (const mp of matchPlayers) {
      if (mp.team !== null) {
        const teamList = teams.get(mp.team) ?? [];
        teamList.push(mp.player_id);
        teams.set(mp.team, teamList);
      }
    }
    for (const [teamNum, playerIds] of teams) {
      const teamWon = result.winner_team === teamNum;
      await updatePartnerStats(playerIds, teamWon);
    }

    // Update favorite_partner_id on player_stats (most games together)
    for (const mp of matchPlayers) {
      const { data: topPartner } = await supabase
        .from("partner_stats")
        .select("partner_id")
        .eq("player_id", mp.player_id)
        .order("games_together", { ascending: false })
        .limit(1)
        .single();

      if (topPartner) {
        await supabase
          .from("player_stats")
          .update({ favorite_partner_id: topPartner.partner_id })
          .eq("player_id", mp.player_id);
      }
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

export async function getFavoritePartners(
  playerId: string,
  options?: { limit?: number }
): Promise<FavoritePartner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partner_stats")
    .select(
      "partner_id, games_together, wins_together, last_played_at, partner:players!partner_stats_partner_id_fkey(id, display_name, avatar_url, skill_level)"
    )
    .eq("player_id", playerId)
    .gt("games_together", 0)
    .order("games_together", { ascending: false })
    .limit(options?.limit ?? 5);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    partner_id: row.partner_id,
    games_together: row.games_together,
    wins_together: row.wins_together,
    win_rate_together:
      row.games_together > 0
        ? Math.round((row.wins_together / row.games_together) * 10000) / 100
        : 0,
    last_played_at: row.last_played_at,
    partner: row.partner as unknown as FavoritePartner["partner"],
  }));
}

async function updatePartnerStats(
  teamPlayerIds: string[],
  isWin: boolean
) {
  if (teamPlayerIds.length < 2) return;
  const supabase = await createClient();
  const now = new Date().toISOString();

  for (let i = 0; i < teamPlayerIds.length; i++) {
    for (let j = i + 1; j < teamPlayerIds.length; j++) {
      const pairs = [
        { player_id: teamPlayerIds[i], partner_id: teamPlayerIds[j] },
        { player_id: teamPlayerIds[j], partner_id: teamPlayerIds[i] },
      ];

      for (const pair of pairs) {
        const { data: existing } = await supabase
          .from("partner_stats")
          .select("games_together, wins_together")
          .eq("player_id", pair.player_id)
          .eq("partner_id", pair.partner_id)
          .single();

        if (existing) {
          await supabase
            .from("partner_stats")
            .update({
              games_together: existing.games_together + 1,
              wins_together: existing.wins_together + (isWin ? 1 : 0),
              last_played_at: now,
              updated_at: now,
            })
            .eq("player_id", pair.player_id)
            .eq("partner_id", pair.partner_id);
        } else {
          await supabase.from("partner_stats").insert({
            player_id: pair.player_id,
            partner_id: pair.partner_id,
            games_together: 1,
            wins_together: isWin ? 1 : 0,
            last_played_at: now,
          });
        }
      }
    }
  }
}
