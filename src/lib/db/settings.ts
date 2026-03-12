import { createClient } from "@/lib/supabase/server";
import type { NotificationPreferences } from "@/lib/types";

export async function getNotificationPreferences(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) throw error;

  // Return defaults if no preferences set
  if (!data) {
    return {
      player_id: playerId,
      push_partner_requests: true,
      push_match_ready: true,
      push_friend_checkin: true,
      push_scheduled_reminder: true,
      email_weekly_summary: true,
      email_upcoming_games: true,
      profile_public: true,
      stats_public: true,
      event_reminders: true,
      new_events: true,
      tournament_results: true,
      chat_messages: true,
      club_announcements: true,
      updated_at: new Date().toISOString(),
    } as NotificationPreferences;
  }

  return data as NotificationPreferences;
}

export async function updateNotificationPreferences(
  playerId: string,
  prefs: Partial<Omit<NotificationPreferences, "player_id" | "updated_at">>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        player_id: playerId,
        ...prefs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "player_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as NotificationPreferences;
}

export async function deleteAccount(playerId: string) {
  const supabase = await createClient();

  // Delete player record (cascades to all related tables)
  const { error: deleteError } = await supabase
    .from("players")
    .delete()
    .eq("id", playerId);

  if (deleteError) throw deleteError;

  // Sign out
  await supabase.auth.signOut();
}
