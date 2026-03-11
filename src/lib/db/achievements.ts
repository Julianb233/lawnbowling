import { createClient } from "@/lib/supabase/server";
import type { PlayerAchievement } from "@/lib/achievements";

export async function getPlayerAchievements(playerId: string): Promise<PlayerAchievement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_achievements")
    .select("*")
    .eq("player_id", playerId)
    .order("unlocked_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PlayerAchievement[];
}

export async function grantAchievement(playerId: string, achievementId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("player_achievements")
    .upsert(
      { player_id: playerId, achievement_id: achievementId },
      { onConflict: "player_id,achievement_id" }
    );

  if (error) throw error;
  return true;
}

export async function checkAndGrantWinAchievements(playerId: string, totalWins: number): Promise<string[]> {
  const granted: string[] = [];
  const thresholds: [number, string][] = [
    [1, "first_win"],
    [10, "10_wins"],
    [50, "50_wins"],
    [100, "100_wins"],
  ];

  for (const [threshold, achievementId] of thresholds) {
    if (totalWins >= threshold) {
      try {
        await grantAchievement(playerId, achievementId);
        granted.push(achievementId);
      } catch {
        // Already granted or error — skip
      }
    }
  }

  return granted;
}
