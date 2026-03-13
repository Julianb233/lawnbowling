import { createClient } from "@/lib/supabase/server";

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ConversationSummary {
  friend_id: string;
  friend_display_name: string;
  friend_avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

/** Get messages between two players, ordered oldest-first */
export async function getMessages(
  playerId: string,
  friendId: string,
  limit = 50,
  before?: string
) {
  const supabase = await createClient();
  let query = supabase
    .from("direct_messages")
    .select("*")
    .or(
      `and(sender_id.eq.${playerId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${playerId})`
    )
    .order("created_at", { ascending: true })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DirectMessage[];
}

/** Send a message to a friend */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("direct_messages")
    .insert({ sender_id: senderId, receiver_id: receiverId, content })
    .select()
    .single();

  if (error) throw error;
  return data as DirectMessage;
}

/** Mark all messages from a friend as read */
export async function markMessagesRead(
  playerId: string,
  friendId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("direct_messages")
    .update({ is_read: true })
    .eq("sender_id", friendId)
    .eq("receiver_id", playerId)
    .eq("is_read", false);

  if (error) throw error;
}

/** Get conversation summaries for a player */
export async function getConversations(playerId: string) {
  const supabase = await createClient();

  // Get the latest message for each conversation partner
  const { data: messages, error } = await supabase
    .from("direct_messages")
    .select("*, sender:players!direct_messages_sender_id_fkey(id, display_name, avatar_url), receiver:players!direct_messages_receiver_id_fkey(id, display_name, avatar_url)")
    .or(`sender_id.eq.${playerId},receiver_id.eq.${playerId}`)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;

  // Group by conversation partner and build summaries
  const convMap = new Map<string, ConversationSummary>();
  for (const msg of messages ?? []) {
    const isSender = msg.sender_id === playerId;
    const friendId = isSender ? msg.receiver_id : msg.sender_id;
    const friendData = (isSender ? msg.receiver : msg.sender) as { id: string; display_name: string; avatar_url: string | null } | null;

    if (!convMap.has(friendId)) {
      convMap.set(friendId, {
        friend_id: friendId,
        friend_display_name: friendData?.display_name ?? "Unknown",
        friend_avatar_url: friendData?.avatar_url ?? null,
        last_message: msg.content,
        last_message_at: msg.created_at,
        unread_count: 0,
      });
    }

    // Count unread messages where this player is receiver
    if (!isSender && !msg.is_read) {
      const conv = convMap.get(friendId)!;
      conv.unread_count++;
    }
  }

  return Array.from(convMap.values()).sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );
}
