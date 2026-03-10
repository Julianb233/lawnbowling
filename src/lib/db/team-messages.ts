import { createClient } from "@/lib/supabase/server";
import type { TeamMessage } from "@/lib/types";

export async function getTeamMessages(teamId: string, options?: { limit?: number; before?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("team_messages")
    .select("*, sender:players!team_messages_sender_id_fkey(id, name, avatar_url)")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 50);

  if (options?.before) {
    query = query.lt("created_at", options.before);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).reverse() as (TeamMessage & { sender: { id: string; name: string; avatar_url: string | null } })[];
}

export async function sendTeamMessage(teamId: string, senderId: string, content: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_messages")
    .insert({ team_id: teamId, sender_id: senderId, content })
    .select("*, sender:players!team_messages_sender_id_fkey(id, name, avatar_url)")
    .single();

  if (error) throw error;
  return data as TeamMessage & { sender: { id: string; name: string; avatar_url: string | null } };
}
