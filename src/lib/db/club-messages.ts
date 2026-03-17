import { createClient } from "@/lib/supabase/server";

export interface ClubMessage {
  id: string;
  club_id: string;
  sender_id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  sender?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

/** Get recent messages for a club */
export async function getClubMessages(
  clubId: string,
  options?: { limit?: number; before?: string }
) {
  const supabase = await createClient();
  let query = supabase
    .from("club_messages")
    .select(
      "*, sender:players!club_messages_sender_id_fkey(id, display_name, avatar_url)"
    )
    .eq("club_id", clubId)
    .order("created_at", { ascending: true })
    .limit(options?.limit ?? 50);

  if (options?.before) {
    query = query.lt("created_at", options.before);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ClubMessage[];
}

/** Send a message to a club group chat */
export async function sendClubMessage(
  clubId: string,
  senderId: string,
  content: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_messages")
    .insert({ club_id: clubId, sender_id: senderId, content })
    .select(
      "*, sender:players!club_messages_sender_id_fkey(id, display_name, avatar_url)"
    )
    .single();

  if (error) throw error;
  return data as ClubMessage;
}

/** Pin/unpin a club message (admin only) */
export async function togglePinMessage(messageId: string, pinned: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("club_messages")
    .update({ is_pinned: pinned })
    .eq("id", messageId);

  if (error) throw error;
}
