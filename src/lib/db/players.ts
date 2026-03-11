import { createClient } from "@/lib/supabase/server";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type Sport = "pickleball" | "lawn_bowling" | "tennis" | "badminton" | "table_tennis";

export type BowlingPosition = "lead" | "second" | "third" | "skip";

export type PreferredHand = "left" | "right" | "ambidextrous";

export interface PlayerProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  skill_level: SkillLevel;
  sports: Sport[];
  insurance_status: "none" | "active" | "expired";
  bio: string | null;
  preferred_position: BowlingPosition | null;
  preferred_hand: PreferredHand | null;
  years_experience: number | null;
  created_at: string;
  updated_at: string;
}

export type PlayerInsert = Omit<PlayerProfile, "id" | "created_at" | "updated_at">;
export type PlayerUpdate = Partial<Omit<PlayerProfile, "id" | "user_id" | "created_at" | "updated_at">>;

export async function getPlayerByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as PlayerProfile | null;
}

export async function getPlayerById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as PlayerProfile;
}

export async function createPlayer(player: PlayerInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .insert(player)
    .select()
    .single();

  if (error) throw error;
  return data as PlayerProfile;
}

export async function updatePlayer(userId: string, updates: PlayerUpdate) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as PlayerProfile;
}

export async function uploadAvatar(userId: string, file: File) {
  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const path = `avatars/${userId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
