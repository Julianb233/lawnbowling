-- Club Noticeboard & Social Feed
-- Tables: noticeboard_posts, noticeboard_reactions, noticeboard_comments
-- With RLS policies for venue-scoped access

-- =============================================================================
-- noticeboard_posts
-- =============================================================================
CREATE TABLE IF NOT EXISTS noticeboard_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  club_id text,
  author_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('announcement', 'tournament_result', 'member_post')),
  title text,
  body text NOT NULL,
  tournament_id uuid,
  is_pinned boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_noticeboard_posts_venue ON noticeboard_posts(venue_id, is_deleted, created_at DESC);
CREATE INDEX idx_noticeboard_posts_pinned ON noticeboard_posts(venue_id, is_pinned, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_noticeboard_posts_tournament ON noticeboard_posts(tournament_id) WHERE tournament_id IS NOT NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_noticeboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER noticeboard_posts_updated_at
  BEFORE UPDATE ON noticeboard_posts
  FOR EACH ROW EXECUTE FUNCTION update_noticeboard_updated_at();

-- =============================================================================
-- noticeboard_reactions
-- =============================================================================
CREATE TABLE IF NOT EXISTS noticeboard_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES noticeboard_posts(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  emoji text NOT NULL CHECK (emoji IN ('👍', '👏', '🔥', '🎉', '❤️')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, player_id, emoji)
);

CREATE INDEX idx_noticeboard_reactions_post ON noticeboard_reactions(post_id);

-- =============================================================================
-- noticeboard_comments
-- =============================================================================
CREATE TABLE IF NOT EXISTS noticeboard_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES noticeboard_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) <= 500),
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_noticeboard_comments_post ON noticeboard_comments(post_id, is_deleted, created_at ASC);

-- =============================================================================
-- RLS Policies
-- =============================================================================
ALTER TABLE noticeboard_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticeboard_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticeboard_comments ENABLE ROW LEVEL SECURITY;

-- Helper: get current player's venue_id
CREATE OR REPLACE FUNCTION get_player_venue_id()
RETURNS uuid AS $$
  SELECT venue_id FROM players WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_player_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current player id
CREATE OR REPLACE FUNCTION get_current_player_id()
RETURNS uuid AS $$
  SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Posts: Read non-deleted posts for own venue
CREATE POLICY "Players can read venue posts"
  ON noticeboard_posts FOR SELECT
  TO authenticated
  USING (is_deleted = false AND venue_id = get_player_venue_id());

-- Posts: Players insert member_post type
CREATE POLICY "Players can create member posts"
  ON noticeboard_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = get_current_player_id()
    AND venue_id = get_player_venue_id()
    AND type = 'member_post'
  );

-- Posts: Admins can create any type
CREATE POLICY "Admins can create any post type"
  ON noticeboard_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = get_current_player_id()
    AND venue_id = get_player_venue_id()
    AND is_player_admin()
  );

-- Posts: Admins can update (pin/delete)
CREATE POLICY "Admins can update posts"
  ON noticeboard_posts FOR UPDATE
  TO authenticated
  USING (venue_id = get_player_venue_id() AND is_player_admin())
  WITH CHECK (venue_id = get_player_venue_id() AND is_player_admin());

-- Reactions: Read for own venue posts
CREATE POLICY "Players can read reactions"
  ON noticeboard_reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM noticeboard_posts p
      WHERE p.id = post_id AND p.venue_id = get_player_venue_id() AND p.is_deleted = false
    )
  );

-- Reactions: Insert own
CREATE POLICY "Players can add reactions"
  ON noticeboard_reactions FOR INSERT
  TO authenticated
  WITH CHECK (player_id = get_current_player_id());

-- Reactions: Delete own
CREATE POLICY "Players can remove own reactions"
  ON noticeboard_reactions FOR DELETE
  TO authenticated
  USING (player_id = get_current_player_id());

-- Comments: Read non-deleted for own venue
CREATE POLICY "Players can read comments"
  ON noticeboard_comments FOR SELECT
  TO authenticated
  USING (
    is_deleted = false
    AND EXISTS (
      SELECT 1 FROM noticeboard_posts p
      WHERE p.id = post_id AND p.venue_id = get_player_venue_id() AND p.is_deleted = false
    )
  );

-- Comments: Insert own
CREATE POLICY "Players can add comments"
  ON noticeboard_comments FOR INSERT
  TO authenticated
  WITH CHECK (author_id = get_current_player_id());

-- Comments: Author or admin can soft-delete
CREATE POLICY "Authors and admins can update comments"
  ON noticeboard_comments FOR UPDATE
  TO authenticated
  USING (
    author_id = get_current_player_id() OR is_player_admin()
  )
  WITH CHECK (
    author_id = get_current_player_id() OR is_player_admin()
  );

-- Enable Realtime for noticeboard tables
ALTER PUBLICATION supabase_realtime ADD TABLE noticeboard_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE noticeboard_reactions;
