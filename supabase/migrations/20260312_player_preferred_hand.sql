-- H-012: Add preferred_hand column referenced by PlayerProfile TypeScript type
ALTER TABLE players ADD COLUMN IF NOT EXISTS preferred_hand TEXT
  CHECK (preferred_hand IN ('left', 'right', 'ambidextrous'));
