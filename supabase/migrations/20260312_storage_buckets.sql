-- Storage buckets for player avatars, game gallery, and club logos
-- AI-2461: Set up Supabase Storage buckets
-- Idempotent: safe to run multiple times

-- ============================================================
-- 1. Create storage buckets (upsert)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'player-avatars',
  'player-avatars',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-gallery',
  'game-gallery',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'club-logos',
  'club-logos',
  true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- 2. RLS policies for player-avatars bucket
-- ============================================================

-- Drop existing policies first to make migration re-runnable
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view club logos" ON storage.objects;
DROP POLICY IF EXISTS "Club admins can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Club admins can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Club admins can delete logos" ON storage.objects;

-- Public read access for all avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'player-avatars');

-- Authenticated users can upload their own avatar (file path must start with their user ID)
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'player-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update (upsert) their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'player-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'player-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 3. RLS policies for game-gallery bucket
-- ============================================================

-- Public read access for all gallery images
CREATE POLICY "Anyone can view gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'game-gallery');

-- Only club admins/managers/owners can upload to gallery
CREATE POLICY "Admins can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'game-gallery'
    AND EXISTS (
      SELECT 1 FROM public.club_memberships cm
      JOIN public.players p ON p.id = cm.player_id
      WHERE p.user_id = auth.uid()
        AND cm.role IN ('admin', 'manager', 'owner')
    )
  );

-- Only club admins can update gallery images
CREATE POLICY "Admins can update gallery images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'game-gallery'
    AND EXISTS (
      SELECT 1 FROM public.club_memberships cm
      JOIN public.players p ON p.id = cm.player_id
      WHERE p.user_id = auth.uid()
        AND cm.role IN ('admin', 'manager', 'owner')
    )
  );

-- Only club admins can delete gallery images
CREATE POLICY "Admins can delete gallery images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'game-gallery'
    AND EXISTS (
      SELECT 1 FROM public.club_memberships cm
      JOIN public.players p ON p.id = cm.player_id
      WHERE p.user_id = auth.uid()
        AND cm.role IN ('admin', 'manager', 'owner')
    )
  );

-- ============================================================
-- 4. RLS policies for club-logos bucket
-- ============================================================

-- Public read access for all club logos
CREATE POLICY "Anyone can view club logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'club-logos');

-- Club admins/owners can upload logos
CREATE POLICY "Club admins can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'club-logos'
    AND EXISTS (
      SELECT 1 FROM public.club_memberships cm
      JOIN public.players p ON p.id = cm.player_id
      WHERE p.user_id = auth.uid()
        AND cm.role IN ('admin', 'owner')
    )
  );

-- Club admins/owners can update logos
CREATE POLICY "Club admins can update logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'club-logos'
    AND EXISTS (
      SELECT 1 FROM public.club_memberships cm
      JOIN public.players p ON p.id = cm.player_id
      WHERE p.user_id = auth.uid()
        AND cm.role IN ('admin', 'owner')
    )
  );

-- Club admins/owners can delete logos
CREATE POLICY "Club admins can delete logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'club-logos'
    AND EXISTS (
      SELECT 1 FROM public.club_memberships cm
      JOIN public.players p ON p.id = cm.player_id
      WHERE p.user_id = auth.uid()
        AND cm.role IN ('admin', 'owner')
    )
  );
