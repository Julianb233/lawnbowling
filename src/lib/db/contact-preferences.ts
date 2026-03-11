import { createClient } from "@/lib/supabase/server";

export type PreferredContact = "in_app" | "email" | "phone" | "none";
export type AllowMessagesFrom = "everyone" | "friends" | "none";

export interface ContactPreferences {
  player_id: string;
  show_email: boolean;
  show_phone: boolean;
  preferred_contact: PreferredContact;
  email: string | null;
  phone: string | null;
  allow_messages_from: AllowMessagesFrom;
  updated_at: string;
}

const DEFAULTS: Omit<ContactPreferences, "player_id" | "updated_at"> = {
  show_email: false,
  show_phone: false,
  preferred_contact: "in_app",
  email: null,
  phone: null,
  allow_messages_from: "everyone",
};

export async function getContactPreferences(playerId: string): Promise<ContactPreferences> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_preferences")
    .select("*")
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return {
      player_id: playerId,
      ...DEFAULTS,
      updated_at: new Date().toISOString(),
    };
  }

  return data as ContactPreferences;
}

export async function updateContactPreferences(
  playerId: string,
  prefs: Partial<Omit<ContactPreferences, "player_id" | "updated_at">>
): Promise<ContactPreferences> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_preferences")
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
  return data as ContactPreferences;
}
