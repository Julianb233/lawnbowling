import { createClient } from "@/lib/supabase/server";

export interface PlayerPhoto {
  id: string;
  player_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export async function getPlayerPhotos(playerId: string): Promise<PlayerPhoto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_photos")
    .select("*")
    .eq("player_id", playerId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PlayerPhoto[];
}

export async function addPlayerPhoto(
  playerId: string,
  url: string,
  caption?: string
): Promise<PlayerPhoto> {
  const supabase = await createClient();

  // Get next sort order
  const { count } = await supabase
    .from("player_photos")
    .select("*", { count: "exact", head: true })
    .eq("player_id", playerId);

  const { data, error } = await supabase
    .from("player_photos")
    .insert({
      player_id: playerId,
      url,
      caption: caption || null,
      sort_order: (count ?? 0),
    })
    .select()
    .single();

  if (error) throw error;
  return data as PlayerPhoto;
}

export async function deletePlayerPhoto(photoId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("player_photos")
    .delete()
    .eq("id", photoId);

  if (error) throw error;
}

export async function updatePhotoCaption(
  photoId: string,
  caption: string
): Promise<PlayerPhoto> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_photos")
    .update({ caption })
    .eq("id", photoId)
    .select()
    .single();

  if (error) throw error;
  return data as PlayerPhoto;
}

export async function uploadGalleryPhoto(playerId: string, file: File): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const path = `gallery/${playerId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
