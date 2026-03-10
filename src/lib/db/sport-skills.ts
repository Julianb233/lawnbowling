import { createClient } from "@/lib/supabase/server";
import { calculateElo, getRatingTier } from "@/lib/elo";

export async function getPlayerSportSkills(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_sport_skills")
    .select("*")
    .eq("player_id", playerId);
  if (error) throw error;
  return data;
}

export async function upsertSportSkill(playerId: string, sport: string, skillLevel: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_sport_skills")
    .upsert(
      { player_id: playerId, sport, skill_level: skillLevel, updated_at: new Date().toISOString() },
      { onConflict: "player_id,sport" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRatingsAfterMatch(
  winnerId: string,
  loserId: string,
  sport: string
) {
  const supabase = await createClient();

  // Get or create skill records
  const [winnerSkill, loserSkill] = await Promise.all([
    getOrCreateSkill(supabase, winnerId, sport),
    getOrCreateSkill(supabase, loserId, sport),
  ]);

  const { newWinnerRating, newLoserRating } = calculateElo(
    winnerSkill.rating,
    loserSkill.rating
  );

  await Promise.all([
    supabase
      .from("player_sport_skills")
      .update({
        rating: newWinnerRating,
        skill_level: getRatingTier(newWinnerRating),
        games_in_sport: winnerSkill.games_in_sport + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", winnerSkill.id),
    supabase
      .from("player_sport_skills")
      .update({
        rating: newLoserRating,
        skill_level: getRatingTier(newLoserRating),
        games_in_sport: loserSkill.games_in_sport + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", loserSkill.id),
  ]);

  return { newWinnerRating, newLoserRating };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrCreateSkill(supabase: any, playerId: string, sport: string) {
  const { data } = await supabase
    .from("player_sport_skills")
    .select("*")
    .eq("player_id", playerId)
    .eq("sport", sport)
    .single();

  if (data) return data;

  const { data: created, error } = await supabase
    .from("player_sport_skills")
    .insert({ player_id: playerId, sport, skill_level: "beginner", rating: 1000, games_in_sport: 0 })
    .select()
    .single();

  if (error) throw error;
  return created;
}
