-- Club Memberships: multi-tenant role system for clubs
-- Roles: owner > admin > manager > member > visitor
-- A player can belong to multiple clubs with different roles

CREATE TABLE IF NOT EXISTS club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'visitor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
  invited_by UUID REFERENCES players(id),
  invite_code TEXT,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, player_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_club_memberships_club ON club_memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_player ON club_memberships(player_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_role ON club_memberships(role);
CREATE INDEX IF NOT EXISTS idx_club_memberships_status ON club_memberships(status);
CREATE INDEX IF NOT EXISTS idx_club_memberships_invite_code ON club_memberships(invite_code) WHERE invite_code IS NOT NULL;

-- RLS
ALTER TABLE club_memberships ENABLE ROW LEVEL SECURITY;

-- Anyone can view memberships (needed for leaderboard club filtering, etc.)
CREATE POLICY "Memberships viewable by all" ON club_memberships
  FOR SELECT USING (true);

-- Players can insert their own membership (join request)
CREATE POLICY "Players can request to join" ON club_memberships
  FOR INSERT WITH CHECK (
    player_id = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1)
    AND role IN ('member', 'visitor')
    AND status = 'pending'
  );

-- Club owners/admins can insert memberships (invite)
CREATE POLICY "Club admins can invite members" ON club_memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_memberships cm
      WHERE cm.club_id = club_memberships.club_id
        AND cm.player_id = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1)
        AND cm.role IN ('owner', 'admin')
        AND cm.status = 'active'
    )
  );

-- Club owners/admins can update memberships (change role, approve, suspend)
CREATE POLICY "Club admins can manage memberships" ON club_memberships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM club_memberships cm
      WHERE cm.club_id = club_memberships.club_id
        AND cm.player_id = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1)
        AND cm.role IN ('owner', 'admin')
        AND cm.status = 'active'
    )
  );

-- Players can delete their own membership (leave club)
CREATE POLICY "Players can leave clubs" ON club_memberships
  FOR DELETE USING (
    player_id = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1)
    AND role != 'owner'
  );

-- Club owners/admins can remove members
CREATE POLICY "Club admins can remove members" ON club_memberships
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM club_memberships cm
      WHERE cm.club_id = club_memberships.club_id
        AND cm.player_id = (SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1)
        AND cm.role IN ('owner', 'admin')
        AND cm.status = 'active'
    )
  );

-- System admins can manage all
CREATE POLICY "System admins can manage all memberships" ON club_memberships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_club_memberships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER club_memberships_updated_at
  BEFORE UPDATE ON club_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_club_memberships_updated_at();

-- Seed existing club creators as 'owner'
INSERT INTO club_memberships (club_id, player_id, role, status, joined_at)
SELECT id, claimed_by, 'owner', 'active', claimed_at
FROM clubs
WHERE claimed_by IS NOT NULL
ON CONFLICT (club_id, player_id) DO NOTHING;
