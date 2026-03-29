-- Restrict visitor role access in RLS policies
-- Visitors (club_memberships.role = 'visitor') should see public club info
-- but NOT access member-only features like chat or detailed member lists.

-- ============================================================
-- 1. Club chat: restrict to member+ (exclude visitors)
-- ============================================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Club members can read messages" ON club_messages;
DROP POLICY IF EXISTS "Club members can send messages" ON club_messages;

-- Recreate with visitor exclusion
CREATE POLICY "Club members can read messages"
  ON club_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM club_memberships
      WHERE club_memberships.club_id = club_messages.club_id
        AND club_memberships.player_id = auth.uid()
        AND club_memberships.status = 'active'
        AND club_memberships.role != 'visitor'
    )
    OR
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = club_messages.sender_id
        AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Club members can send messages"
  ON club_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_memberships
      WHERE club_memberships.club_id = club_messages.club_id
        AND club_memberships.player_id = club_messages.sender_id
        AND club_memberships.status = 'active'
        AND club_memberships.role != 'visitor'
    )
    AND
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = club_messages.sender_id
        AND players.user_id = auth.uid()
    )
  );

-- ============================================================
-- 2. Club memberships: restrict full member list to members+
--    Visitors can only see their own membership
-- ============================================================

DROP POLICY IF EXISTS "Memberships viewable by all" ON club_memberships;

-- Members (member+) can see all memberships in their club
CREATE POLICY "Club members can view memberships"
  ON club_memberships FOR SELECT
  USING (
    -- Players can always see their own membership
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = club_memberships.player_id
        AND players.user_id = auth.uid()
    )
    OR
    -- Members+ can see all memberships in their clubs
    EXISTS (
      SELECT 1 FROM club_memberships AS my_membership
      WHERE my_membership.club_id = club_memberships.club_id
        AND my_membership.player_id = auth.uid()
        AND my_membership.status = 'active'
        AND my_membership.role != 'visitor'
    )
    OR
    -- System admins can see everything
    EXISTS (
      SELECT 1 FROM players
      WHERE players.user_id = auth.uid()
        AND players.role = 'admin'
    )
  );

-- ============================================================
-- 3. Noticeboard: add club-scoped visitor restriction
--    Visitors should not post to club noticeboards
--    (reading is venue-scoped and stays public for authenticated users)
-- ============================================================

-- Add a restrictive policy for INSERT on noticeboard_posts
-- that prevents visitors from posting in club-affiliated venues
-- Note: noticeboard is venue-scoped, so we check via club_venues
DROP POLICY IF EXISTS "Visitors cannot create noticeboard posts" ON noticeboard_posts;

CREATE POLICY "Visitors cannot create noticeboard posts"
  ON noticeboard_posts AS RESTRICTIVE FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM club_venues cv
      JOIN club_memberships cm ON cm.club_id = cv.club_id
      WHERE cv.venue_id = noticeboard_posts.venue_id
        AND cm.player_id = auth.uid()
        AND cm.status = 'active'
        AND cm.role = 'visitor'
        -- Only block if they're ONLY a visitor (not also a member of another club at same venue)
        AND NOT EXISTS (
          SELECT 1 FROM club_venues cv2
          JOIN club_memberships cm2 ON cm2.club_id = cv2.club_id
          WHERE cv2.venue_id = noticeboard_posts.venue_id
            AND cm2.player_id = auth.uid()
            AND cm2.status = 'active'
            AND cm2.role != 'visitor'
        )
    )
  );
