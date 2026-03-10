import { createClient } from "@/lib/supabase/server";
import type { Venue } from "@/lib/types";

export async function getVenue(id?: string) {
  const supabase = await createClient();
  let query = supabase.from("venues").select("*");
  if (id) {
    query = query.eq("id", id);
  }
  const { data, error } = await query.limit(1).single();
  if (error && error.code !== "PGRST116") throw error;
  return data as Venue | null;
}

export async function updateVenue(
  id: string,
  updates: Partial<Pick<Venue, "name" | "address" | "timezone">>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Venue;
}
