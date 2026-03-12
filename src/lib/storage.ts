/**
 * Supabase Storage bucket constants and helpers.
 *
 * Buckets:
 *  - player-avatars  — public bucket for player profile pictures (5 MB limit)
 *  - game-gallery    — public bucket for club/game gallery images (10 MB limit, admin upload only)
 */

export const STORAGE_BUCKETS = {
  PLAYER_AVATARS: "player-avatars",
  GAME_GALLERY: "game-gallery",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/** Build the storage path for a player avatar. */
export function avatarPath(userId: string, ext: string): string {
  return `${userId}/avatar.${ext}`;
}

/** Build the storage path for a gallery image. */
export function galleryPath(playerId: string, ext: string): string {
  return `${playerId}/${Date.now()}.${ext}`;
}
