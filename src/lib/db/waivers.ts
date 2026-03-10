import { createClient } from "@/lib/supabase/server";

export interface Waiver {
  id: string;
  player_id: string;
  waiver_text: string;
  accepted: boolean;
  ip_address: string;
  user_agent: string;
  accepted_at: string;
  created_at: string;
}

export type WaiverInsert = Omit<Waiver, "id" | "created_at">;

export async function createWaiver(waiver: WaiverInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("waivers")
    .insert(waiver)
    .select()
    .single();

  if (error) throw error;
  return data as Waiver;
}

export async function getWaiverByPlayerId(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("waivers")
    .select("*")
    .eq("player_id", playerId)
    .eq("accepted", true)
    .order("accepted_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as Waiver | null;
}

export async function listWaivers(options?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("waivers")
    .select("*, players(display_name, avatar_url)", { count: "exact" })
    .eq("accepted", true)
    .order("accepted_at", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { waivers: data, total: count ?? 0 };
}
