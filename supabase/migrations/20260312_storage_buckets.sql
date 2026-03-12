-- Storage buckets for player avatars and game gallery images
-- AI-2461: Set up Supabase Storage buckets

-- ============================================================
-- 1. Create storage buckets
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
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- 2. RLS policies for player-avatars bucket
-- ============================================================

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

-- Only admins (players with role 'admin' or 'club_manager') can upload to gallery
-- Uses the club_memberships table to check for admin/manager role
CREATE POLICY "Admins can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'game-gallery'
    AND EXISTS (
      SELECT 1 FROM public.club_memberships
      WHERE club_memberships.user_id = auth.uid()
        AND club_memberships.role IN ('admin', 'club_manager', 'owner')
    )
  );

-- Only admins can update gallery images
CREATE POLICY "Admins can update gallery images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'game-gallery'
    AND EXISTS (
      SELECT 1 FROM public.club_memberships
      WHERE club_memberships.user_id = auth.uid()
        AND club_memberships.role IN ('admin', 'club_manager', 'owner')
    )
  );

-- Only admins can delete gallery images
CREATE POLICY "Admins can delete gallery images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'game-gallery'
    AND EXISTS (
      SELECT 1 FROM public.club_memberships
      WHERE club_memberships.user_id = auth.uid()
        AND club_memberships.role IN ('admin', 'club_manager', 'owner')
    )
  );
