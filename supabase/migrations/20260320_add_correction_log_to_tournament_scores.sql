-- Add correction_log column to tournament_scores table
-- This column tracks score unlock/correction history for audit purposes
-- Referenced by API route /api/bowls/scores (unlock-score action)
ALTER TABLE tournament_scores
  ADD COLUMN IF NOT EXISTS correction_log jsonb DEFAULT NULL;

COMMENT ON COLUMN tournament_scores.correction_log IS 'JSON array of {timestamp, unlocked_by, rink} entries tracking score corrections';
