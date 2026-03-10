import { createClient } from "@/lib/supabase/server";
import type { AppNotification, NotificationType } from "@/lib/types";

export type NotificationInsert = {
  player_id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
};

export async function createNotification(notification: NotificationInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      ...notification,
      metadata: notification.metadata ?? {},
      is_read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AppNotification;
}

export async function getNotifications(
  playerId: string,
  { limit = 50, offset = 0 }: { limit?: number; offset?: number } = {}
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as AppNotification[];
}

export async function getUnreadCount(playerId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("player_id", playerId)
    .eq("is_read", false);

  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw error;
}

export async function markAllRead(playerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("player_id", playerId)
    .eq("is_read", false);

  if (error) throw error;
}
