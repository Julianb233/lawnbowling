-- C-008: Create baseline migration for tables referenced in codebase but missing from migrations.
-- These tables likely exist in production from manual setup, but are needed for fresh deployments.
-- All use CREATE TABLE IF NOT EXISTS to be idempotent.

-- ═══════════════════════════════════════════════════════════════
-- Core tables (no FK dependencies on other missing tables)
-- ═══════════════════════════════════════════════════════════════

-- 1. venues
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  timezone TEXT DEFAULT 'Australia/Sydney',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0A2E12',
  secondary_color TEXT DEFAULT '#3D5A3E',
  tagline TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  sports TEXT[] DEFAULT '{"lawn_bowls"}',
  operating_hours JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. players (core user table)
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  skill_level TEXT,
  sports TEXT[] DEFAULT '{}',
  insurance_status TEXT,
  bio TEXT,
  preferred_position TEXT,
  preferred_hand TEXT CHECK (preferred_hand IN ('left', 'right', 'ambidextrous')),
  years_experience INTEGER,
  experience_level TEXT,
  bowling_formats TEXT[],
  home_club_id UUID,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'player',
  is_available BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. clubs
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  state_code TEXT,
  country_code TEXT DEFAULT 'US',
  province TEXT,
  region TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  website TEXT,
  phone TEXT,
  email TEXT,
  member_count INTEGER,
  greens INTEGER,
  rinks INTEGER,
  surface_type TEXT DEFAULT 'unknown',
  division TEXT,
  activities TEXT[] DEFAULT '{}',
  facilities TEXT[] DEFAULT '{}',
  founded TEXT,
  description TEXT,
  status TEXT DEFAULT 'unverified',
  has_online_presence BOOLEAN DEFAULT false,
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  twitter_url TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  claimed_by UUID REFERENCES players(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK for players.home_club_id after clubs exists
DO $$ BEGIN
  ALTER TABLE players ADD CONSTRAINT fk_players_home_club
    FOREIGN KEY (home_club_id) REFERENCES clubs(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- Venue-dependent tables
-- ═══════════════════════════════════════════════════════════════

-- 4. courts
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sport TEXT DEFAULT 'lawn_bowls',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport TEXT DEFAULT 'lawn_bowls',
  court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'playing', 'completed')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. match_players
CREATE TABLE IF NOT EXISTS match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team INTEGER CHECK (team IN (1, 2))
);

-- 7. match_results
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  winner_team INTEGER,
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  reported_by UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sport TEXT DEFAULT 'lawn_bowls',
  format TEXT DEFAULT 'round_robin' CHECK (format IN ('round_robin', 'single_elimination', 'double_elimination')),
  status TEXT DEFAULT 'registration' CHECK (status IN ('registration', 'in_progress', 'completed', 'cancelled')),
  max_players INTEGER,
  bracket_type TEXT,
  created_by UUID REFERENCES players(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. tournament_participants
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  seed INTEGER,
  eliminated BOOLEAN DEFAULT false,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  UNIQUE (tournament_id, player_id)
);

-- 10. tournament_matches
CREATE TABLE IF NOT EXISTS tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  match_number INTEGER,
  player1_id UUID REFERENCES players(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES players(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES players(id) ON DELETE SET NULL,
  score TEXT,
  court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════════
-- Player-related tables
-- ═══════════════════════════════════════════════════════════════

-- 11. player_stats
CREATE TABLE IF NOT EXISTS player_stats (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate DOUBLE PRECISION DEFAULT 0,
  favorite_sport TEXT,
  favorite_partner_id UUID REFERENCES players(id) ON DELETE SET NULL,
  last_played_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. player_sport_skills
CREATE TABLE IF NOT EXISTS player_sport_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  skill_level TEXT,
  rating DOUBLE PRECISION,
  elo_rating DOUBLE PRECISION DEFAULT 1200,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, sport)
);

-- 13. player_availability
CREATE TABLE IF NOT EXISTS player_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. player_photos
CREATE TABLE IF NOT EXISTS player_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  is_profile BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. player_achievements
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, achievement_key)
);

-- 16. player_clubs
CREATE TABLE IF NOT EXISTS player_clubs (
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  PRIMARY KEY (player_id, club_id)
);

-- 17. player_endorsements
CREATE TABLE IF NOT EXISTS player_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endorser_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  endorsed_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (endorser_id, endorsed_id, skill)
);

-- 18. player_reviews
CREATE TABLE IF NOT EXISTS player_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. player_reports
CREATE TABLE IF NOT EXISTS player_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- Social / relationship tables
-- ═══════════════════════════════════════════════════════════════

-- 20. friendships
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, friend_id)
);

-- 21. favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  favorite_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, favorite_id)
);

-- 22. partner_requests
CREATE TABLE IF NOT EXISTS partner_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  sport TEXT DEFAULT 'lawn_bowls',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- 23. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 24. push_subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, endpoint)
);

-- 25. contact_preferences
CREATE TABLE IF NOT EXISTS contact_preferences (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  preferred_contact TEXT DEFAULT 'in_app' CHECK (preferred_contact IN ('in_app', 'email', 'phone', 'none')),
  email TEXT,
  phone TEXT,
  allow_messages_from TEXT DEFAULT 'everyone' CHECK (allow_messages_from IN ('everyone', 'friends', 'none')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- Team tables
-- ═══════════════════════════════════════════════════════════════

-- 26. teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT DEFAULT 'lawn_bowls',
  avatar_url TEXT,
  captain_id UUID REFERENCES players(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 27. team_members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('captain', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, player_id)
);

-- 28. team_messages
CREATE TABLE IF NOT EXISTS team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- Scheduling / booking tables
-- ═══════════════════════════════════════════════════════════════

-- 29. scheduled_games
CREATE TABLE IF NOT EXISTS scheduled_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  sport TEXT DEFAULT 'lawn_bowls',
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  max_players INTEGER,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 30. game_rsvps
CREATE TABLE IF NOT EXISTS game_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES scheduled_games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (game_id, player_id)
);

-- 31. court_bookings
CREATE TABLE IF NOT EXISTS court_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 32. court_waitlist
CREATE TABLE IF NOT EXISTS court_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  sport TEXT DEFAULT 'lawn_bowls',
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES players(id) ON DELETE SET NULL,
  position INTEGER,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'promoted', 'notified', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- Club-related tables
-- ═══════════════════════════════════════════════════════════════

-- 33. club_members
CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'officer', 'captain', 'coach', 'social_coordinator')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  is_primary_club BOOLEAN DEFAULT false,
  notes TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, player_id)
);

-- 34. club_venues
CREATE TABLE IF NOT EXISTS club_venues (
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (club_id, venue_id)
);

-- 35. club_contacts
CREATE TABLE IF NOT EXISTS club_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  UNIQUE (club_id, name, role)
);

-- 36. club_claim_requests
CREATE TABLE IF NOT EXISTS club_claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- Waiver tables
-- ═══════════════════════════════════════════════════════════════

-- 37. waiver_templates
CREATE TABLE IF NOT EXISTS waiver_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 38. waivers
CREATE TABLE IF NOT EXISTS waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  waiver_text TEXT,
  accepted BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- Activity / checkin tables
-- ═══════════════════════════════════════════════════════════════

-- 39. activity_feed
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 40. bowls_checkins
CREATE TABLE IF NOT EXISTS bowls_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  preferred_position TEXT CHECK (preferred_position IN ('skip', 'vice', 'second', 'lead')),
  checkin_source TEXT DEFAULT 'app' CHECK (checkin_source IN ('kiosk', 'manual', 'app')),
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_guest BOOLEAN DEFAULT false
);

-- 41. green_conditions
CREATE TABLE IF NOT EXISTS green_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  green_speed DOUBLE PRECISION,
  surface_condition TEXT,
  recorded_by UUID REFERENCES players(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- Other tables
-- ═══════════════════════════════════════════════════════════════

-- 42. newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 43. monitoring tables (system health views)
CREATE TABLE IF NOT EXISTS monitor_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_type TEXT,
  status TEXT,
  last_checked TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS monitor_index_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_name TEXT,
  table_name TEXT,
  scan_count BIGINT DEFAULT 0,
  usage_ratio DOUBLE PRECISION DEFAULT 0,
  last_checked TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  message TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS monitor_rls_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  rls_enabled BOOLEAN DEFAULT false,
  last_checked TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS monitor_slow_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT,
  execution_time DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS monitor_table_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  row_count BIGINT DEFAULT 0,
  size_mb DOUBLE PRECISION DEFAULT 0,
  last_checked TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- Indexes for performance
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_venue_id ON players(venue_id);
CREATE INDEX IF NOT EXISTS idx_players_role ON players(role);
CREATE INDEX IF NOT EXISTS idx_courts_venue_id ON courts(venue_id);
CREATE INDEX IF NOT EXISTS idx_matches_venue_id ON matches(venue_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_players_match ON match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_player ON match_players(player_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_venue ON tournaments(venue_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_friendships_player ON friendships(player_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_favorites_player ON favorites(player_id);
CREATE INDEX IF NOT EXISTS idx_notifications_player ON notifications(player_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(player_id, is_read);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_player ON push_subscriptions(player_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_player ON team_members(player_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_team ON team_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_games_venue ON scheduled_games(venue_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_games_organizer ON scheduled_games(organizer_id);
CREATE INDEX IF NOT EXISTS idx_game_rsvps_game ON game_rsvps(game_id);
CREATE INDEX IF NOT EXISTS idx_court_bookings_court ON court_bookings(court_id);
CREATE INDEX IF NOT EXISTS idx_court_bookings_player ON court_bookings(player_id);
CREATE INDEX IF NOT EXISTS idx_court_waitlist_venue ON court_waitlist(venue_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_player ON club_members(player_id);
CREATE INDEX IF NOT EXISTS idx_club_venues_venue ON club_venues(venue_id);
CREATE INDEX IF NOT EXISTS idx_club_claim_requests_club ON club_claim_requests(club_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_venue ON activity_feed(venue_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bowls_checkins_player ON bowls_checkins(player_id);
CREATE INDEX IF NOT EXISTS idx_bowls_checkins_tournament ON bowls_checkins(tournament_id);
CREATE INDEX IF NOT EXISTS idx_partner_requests_target ON partner_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_partner_requests_status ON partner_requests(status);
CREATE INDEX IF NOT EXISTS idx_player_reports_status ON player_reports(status);
CREATE INDEX IF NOT EXISTS idx_match_results_match ON match_results(match_id);
CREATE INDEX IF NOT EXISTS idx_clubs_slug ON clubs(slug);
CREATE INDEX IF NOT EXISTS idx_clubs_state ON clubs(state_code);

-- ═══════════════════════════════════════════════════════════════
-- RLS policies for new tables
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_sport_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiver_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE bowls_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read policies (these tables have public data)
CREATE POLICY "Anyone can read venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Anyone can read clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Anyone can read courts" ON courts FOR SELECT USING (true);
CREATE POLICY "Anyone can read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Anyone can read tournament_participants" ON tournament_participants FOR SELECT USING (true);
CREATE POLICY "Anyone can read tournament_matches" ON tournament_matches FOR SELECT USING (true);
CREATE POLICY "Anyone can read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Anyone can read match_players" ON match_players FOR SELECT USING (true);
CREATE POLICY "Anyone can read match_results" ON match_results FOR SELECT USING (true);
CREATE POLICY "Anyone can read players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can read player_stats" ON player_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can read player_sport_skills" ON player_sport_skills FOR SELECT USING (true);
CREATE POLICY "Anyone can read player_achievements" ON player_achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can read player_endorsements" ON player_endorsements FOR SELECT USING (true);
CREATE POLICY "Anyone can read scheduled_games" ON scheduled_games FOR SELECT USING (true);
CREATE POLICY "Anyone can read game_rsvps" ON game_rsvps FOR SELECT USING (true);
CREATE POLICY "Anyone can read activity_feed" ON activity_feed FOR SELECT USING (true);
CREATE POLICY "Anyone can read club_members" ON club_members FOR SELECT USING (true);
CREATE POLICY "Anyone can read club_venues" ON club_venues FOR SELECT USING (true);
CREATE POLICY "Anyone can read club_contacts" ON club_contacts FOR SELECT USING (true);
CREATE POLICY "Anyone can read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Anyone can read team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Anyone can read green_conditions" ON green_conditions FOR SELECT USING (true);
CREATE POLICY "Anyone can read waiver_templates" ON waiver_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can read bowls_checkins" ON bowls_checkins FOR SELECT USING (true);

-- Authenticated user policies (own data)
CREATE POLICY "Users can manage own player" ON players FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own stats" ON player_stats FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own sport_skills" ON player_sport_skills FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own availability" ON player_availability FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can read availability" ON player_availability FOR SELECT USING (true);

CREATE POLICY "Users can manage own photos" ON player_photos FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can read photos" ON player_photos FOR SELECT USING (true);

CREATE POLICY "Users can manage own achievements" ON player_achievements FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own club memberships" ON player_clubs FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can read player_clubs" ON player_clubs FOR SELECT USING (true);

CREATE POLICY "Users can create endorsements" ON player_endorsements FOR INSERT TO authenticated
  WITH CHECK (endorser_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own endorsements" ON player_endorsements FOR DELETE TO authenticated
  USING (endorser_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can create reviews" ON player_reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can read reviews" ON player_reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reports" ON player_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage reports" ON player_reports FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can manage own friendships" ON friendships FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can see friendships involving them" ON friendships FOR SELECT TO authenticated
  USING (
    player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
    OR friend_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own partner_requests" ON partner_requests FOR ALL TO authenticated
  USING (
    requester_id IN (SELECT id FROM players WHERE user_id = auth.uid())
    OR target_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage notifications" ON notifications FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own push_subscriptions" ON push_subscriptions FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own contact_preferences" ON contact_preferences FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Team policies
CREATE POLICY "Team members can read messages" ON team_messages FOR SELECT TO authenticated
  USING (team_id IN (SELECT team_id FROM team_members WHERE player_id IN (SELECT id FROM players WHERE user_id = auth.uid())));

CREATE POLICY "Team members can send messages" ON team_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create teams" ON teams FOR INSERT TO authenticated
  WITH CHECK (captain_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Captains can manage teams" ON teams FOR UPDATE TO authenticated
  USING (captain_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Team members can manage their membership" ON team_members FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Scheduling policies
CREATE POLICY "Authenticated users can create games" ON scheduled_games FOR INSERT TO authenticated
  WITH CHECK (organizer_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Organizers can manage own games" ON scheduled_games FOR UPDATE TO authenticated
  USING (organizer_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own RSVPs" ON game_rsvps FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Court booking policies
CREATE POLICY "Users can manage own bookings" ON court_bookings FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can read court_bookings" ON court_bookings FOR SELECT USING (true);

CREATE POLICY "Users can manage own waitlist" ON court_waitlist FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can read court_waitlist" ON court_waitlist FOR SELECT USING (true);

-- Club management policies
CREATE POLICY "Authenticated users can join clubs" ON club_members FOR INSERT TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own club membership" ON club_members FOR UPDATE TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can leave clubs" ON club_members FOR DELETE TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create claim requests" ON club_claim_requests FOR INSERT TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own claims" ON club_claim_requests FOR SELECT TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Waiver policies
CREATE POLICY "Users can sign waivers" ON waivers FOR INSERT TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own waivers" ON waivers FOR SELECT TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Checkin policies
CREATE POLICY "Authenticated users can check in" ON bowls_checkins FOR INSERT TO authenticated
  WITH CHECK (true);

-- Green conditions
CREATE POLICY "Authenticated users can report conditions" ON green_conditions FOR INSERT TO authenticated
  WITH CHECK (true);

-- Newsletter (anyone can subscribe)
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Admin policies (for tables that need admin management)
CREATE POLICY "Admins can manage venues" ON venues FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage courts" ON courts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage matches" ON matches FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage match_players" ON match_players FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage match_results" ON match_results FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage tournaments" ON tournaments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage tournament_participants" ON tournament_participants FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage tournament_matches" ON tournament_matches FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage waiver_templates" ON waiver_templates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage club_contacts" ON club_contacts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage activity_feed" ON activity_feed FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin'));

-- Service role has full access for backend operations
CREATE POLICY "Service role full access on matches" ON matches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on match_players" ON match_players FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on match_results" ON match_results FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on players" ON players FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on tournaments" ON tournaments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on bowls_checkins" ON bowls_checkins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on court_waitlist" ON court_waitlist FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on court_bookings" ON court_bookings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on scheduled_games" ON scheduled_games FOR ALL USING (auth.role() = 'service_role');
