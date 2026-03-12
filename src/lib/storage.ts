/**
 * Supabase Storage bucket constants and helpers.
 *
 * Buckets:
 *  - player-avatars  — public bucket for player profile pictures (5 MB limit)
 *  - game-gallery    — public bucket for club/game gallery images (10 MB limit, admin upload only)
 *  - club-logos      — public bucket for club logo images (2 MB limit, club admin upload only)
 */

import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const STORAGE_BUCKETS = {
  PLAYER_AVATARS: "player-avatars",
  GAME_GALLERY: "game-gallery",
  CLUB_LOGOS: "club-logos",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// ---------------------------------------------------------------------------
// Path builders
// ---------------------------------------------------------------------------

/** Build the storage path for a player avatar. */
export function avatarPath(userId: string, ext: string): string {
  return `${userId}/avatar.${ext}`;
}

/** Build the storage path for a gallery image. */
export function galleryPath(category: string, ext: string): string {
  return `${category}/${Date.now()}.${ext}`;
}

/** Build the storage path for a club logo. */
export function clubLogoPath(clubId: string, ext: string): string {
  return `${clubId}/logo.${ext}`;
}

// ---------------------------------------------------------------------------
// Public URL helpers
// ---------------------------------------------------------------------------

/**
 * Get the public URL for any file in a public storage bucket.
 * Does not require authentication — works for any public bucket.
 */
export function getPublicUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Get the public URL for a player's avatar.
 * Returns the base folder URL — the actual file is `{userId}/avatar.{ext}`.
 * If you don't know the extension, pass it explicitly or use the upload return value.
 */
export function getAvatarUrl(userId: string): string {
  // Convention: avatars are stored at {userId}/avatar.{ext}
  // Since we don't know the extension ahead of time, use the Supabase
  // storage.objects list or just try common formats. For a reliable URL,
  // store the full path in the player profile after upload.
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKETS.PLAYER_AVATARS}/${userId}`;
}

// ---------------------------------------------------------------------------
// Upload helpers (client-side — use createClient from @/lib/supabase/client)
// ---------------------------------------------------------------------------

/** Extract file extension from a File object. */
function fileExt(file: File): string {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
}

/**
 * Upload a player avatar image.
 * Files are stored at `{userId}/avatar.{ext}` in the `player-avatars` bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const supabase = createClient();
  const ext = fileExt(file);
  const path = avatarPath(userId, ext);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.PLAYER_AVATARS)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  return getPublicUrl(STORAGE_BUCKETS.PLAYER_AVATARS, path);
}

/**
 * Upload a gallery image.
 * Files are stored at `{category}/{timestamp}.{ext}` in the `game-gallery` bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadGalleryImage(
  file: File,
  category: string
): Promise<string> {
  const supabase = createClient();
  const ext = fileExt(file);
  const path = galleryPath(category, ext);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.GAME_GALLERY)
    .upload(path, file);

  if (error) throw error;

  return getPublicUrl(STORAGE_BUCKETS.GAME_GALLERY, path);
}

/**
 * Upload a club logo image.
 * Files are stored at `{clubId}/logo.{ext}` in the `club-logos` bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadClubLogo(
  clubId: string,
  file: File
): Promise<string> {
  const supabase = createClient();
  const ext = fileExt(file);
  const path = clubLogoPath(clubId, ext);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.CLUB_LOGOS)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  return getPublicUrl(STORAGE_BUCKETS.CLUB_LOGOS, path);
}
