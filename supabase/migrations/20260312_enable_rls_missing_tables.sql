-- H-003: Enable RLS on tournament_scores, tournament_draws, and tv_announcements
-- These tables had no RLS, meaning the anon key could read/write all rows.

-- ═══════════════════════════════════════════════════════════════
-- tournament_scores
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE tournament_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can read scores (public leaderboard / live scoring)
CREATE POLICY "Anyone can read tournament scores" ON tournament_scores
  FOR SELECT USING (true);

-- Only authenticated users can insert/update scores
CREATE POLICY "Authenticated users can insert scores" ON tournament_scores
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update scores" ON tournament_scores
  FOR UPDATE TO authenticated USING (true);

-- Only admins can delete scores
CREATE POLICY "Admins can delete scores" ON tournament_scores
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════
-- tournament_draws
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE tournament_draws ENABLE ROW LEVEL SECURITY;

-- Anyone can read draws (public tournament brackets)
CREATE POLICY "Anyone can read tournament draws" ON tournament_draws
  FOR SELECT USING (true);

-- Only admins can manage draws
CREATE POLICY "Admins can manage draws" ON tournament_draws
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════
-- tv_announcements
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE tv_announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can read announcements (TV dashboard is public)
CREATE POLICY "Anyone can read tv announcements" ON tv_announcements
  FOR SELECT USING (true);

-- Only admins can manage announcements
CREATE POLICY "Admins can manage tv announcements" ON tv_announcements
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin')
  );
