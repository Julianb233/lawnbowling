-- Add cancelled, abandoned, and disputed status values to match lifecycle
-- Supports tracking interrupted matches (rain, injury, disputes)

-- Drop the existing check constraint and add the expanded one
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE matches ADD CONSTRAINT matches_status_check
  CHECK (status IN ('queued', 'playing', 'completed', 'cancelled', 'abandoned', 'disputed'));

-- Update the partial index to exclude all terminal statuses
DROP INDEX IF EXISTS idx_matches_status;
CREATE INDEX idx_matches_status ON matches(status) WHERE status NOT IN ('completed', 'cancelled', 'abandoned', 'disputed');
