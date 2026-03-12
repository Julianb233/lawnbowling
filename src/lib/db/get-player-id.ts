import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Look up the player's internal UUID from their auth UID.
 *
 * The `players` table has its own `id` (player UUID) which is different from
 * the Supabase auth `user.id` (auth UUID stored in `players.user_id`).
 * Many tables reference `players.id` as a foreign key, so we must resolve
 * the auth UID to the player ID before inserting/querying those tables.
 */
export async function getPlayerIdFromAuth(
  supabase: SupabaseClient,
  authUserId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", authUserId)
    .single();

  return data?.id ?? null;
}
