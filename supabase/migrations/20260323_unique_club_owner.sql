-- AI-4036: Prevent multiple club owners per club
-- A club must have exactly one owner at any time.
-- A partial unique index enforces this at the database level.

CREATE UNIQUE INDEX IF NOT EXISTS idx_club_memberships_one_owner
  ON club_memberships(club_id)
  WHERE role = 'owner';
