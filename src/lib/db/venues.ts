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

export async function listVenues() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Venue[];
}

export async function createVenue(fields: {
  name: string;
  address?: string;
  timezone?: string;
  sports?: string[];
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .insert(fields)
    .select()
    .single();
  if (error) throw error;
  return data as Venue;
}

type VenueUpdatable = Pick<Venue, "name" | "address" | "timezone" | "sports" | "contact_email" | "contact_phone" | "website_url" | "tagline" | "logo_url" | "primary_color" | "secondary_color">;

export async function updateVenue(
  id: string,
  updates: Partial<VenueUpdatable>
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
