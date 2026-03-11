-- Club members roster (up to 500 per club)
-- This is the venue/tournament-specific roster for game day check-in.
-- Each member has a skill level: novice (default) or expert (after 2+ years).

CREATE TABLE IF NOT EXISTS club_members_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  skill_level TEXT NOT NULL DEFAULT 'novice' CHECK (skill_level IN ('novice', 'expert')),
  member_since DATE,
  is_active BOOLEAN DEFAULT true,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_club_members_roster_tournament ON club_members_roster(tournament_id);
CREATE INDEX IF NOT EXISTS idx_club_members_roster_name ON club_members_roster(display_name);
CREATE INDEX IF NOT EXISTS idx_club_members_roster_skill ON club_members_roster(skill_level);
CREATE INDEX IF NOT EXISTS idx_club_members_roster_active ON club_members_roster(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE club_members_roster ENABLE ROW LEVEL SECURITY;

-- Anyone can view roster members (needed for kiosk check-in)
CREATE POLICY "Roster members viewable by all" ON club_members_roster
  FOR SELECT USING (true);

-- Authenticated users can manage roster members
CREATE POLICY "Authenticated users can insert roster members" ON club_members_roster
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update roster members" ON club_members_roster
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete roster members" ON club_members_roster
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_club_members_roster_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER club_members_roster_updated_at
  BEFORE UPDATE ON club_members_roster
  FOR EACH ROW
  EXECUTE FUNCTION update_club_members_roster_updated_at();

-- Add num_rinks column to tournaments table (default 2, range 2-4)
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS num_rinks INTEGER DEFAULT 2 CHECK (num_rinks >= 1 AND num_rinks <= 8);
