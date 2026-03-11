-- Visit Requests: allows traveling bowlers to request a visiting session at a club
CREATE TABLE IF NOT EXISTS visit_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id text NOT NULL,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  requested_date date NOT NULL,
  skill_level text NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_positions text[] NOT NULL DEFAULT '{}',
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  responded_by uuid REFERENCES players(id),
  responded_at timestamptz,
  visit_token uuid,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_visit_requests_club_id ON visit_requests(club_id);
CREATE INDEX idx_visit_requests_player_id ON visit_requests(player_id);
CREATE INDEX idx_visit_requests_status ON visit_requests(status);
CREATE INDEX idx_visit_requests_visit_token ON visit_requests(visit_token) WHERE visit_token IS NOT NULL;
CREATE INDEX idx_visit_requests_requested_date ON visit_requests(requested_date);

-- RLS policies
ALTER TABLE visit_requests ENABLE ROW LEVEL SECURITY;

-- Players can read their own visit requests
CREATE POLICY visit_requests_select_own ON visit_requests
  FOR SELECT USING (auth.uid() = player_id::text::uuid);

-- Players can insert their own visit requests
CREATE POLICY visit_requests_insert_own ON visit_requests
  FOR INSERT WITH CHECK (auth.uid() = player_id::text::uuid);

-- Club admins can read all requests for their club (via venue membership)
CREATE POLICY visit_requests_select_admin ON visit_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM club_venues cv
      JOIN players p ON p.venue_id = cv.venue_id
      WHERE cv.club_id = visit_requests.club_id
        AND p.id::text::uuid = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Club admins can update status fields
CREATE POLICY visit_requests_update_admin ON visit_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM club_venues cv
      JOIN players p ON p.venue_id = cv.venue_id
      WHERE cv.club_id = visit_requests.club_id
        AND p.id::text::uuid = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Service role can do all (implicit via supabase)

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_visit_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER visit_requests_updated_at
  BEFORE UPDATE ON visit_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_visit_requests_updated_at();

-- REQ-12-07: Add is_guest column to bowls_checkins for marking visiting players
ALTER TABLE bowls_checkins
  ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT false;
