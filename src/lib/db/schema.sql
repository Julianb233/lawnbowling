-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Venues
create table venues (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  timezone text default 'America/Los_Angeles',
  created_at timestamptz default now()
);

-- Players (extends Supabase auth.users)
create table players (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced')) default 'beginner',
  sports text[] default '{}',
  is_available boolean default false,
  checked_in_at timestamptz,
  venue_id uuid references venues(id),
  role text check (role in ('player', 'admin')) default 'player',
  insurance_status text check (insurance_status in ('none', 'active', 'expired')) default 'none',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Waivers
create table waivers (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  venue_id uuid references venues(id),
  waiver_text text not null,
  accepted boolean default false,
  accepted_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- Waiver Templates (per venue)
create table waiver_templates (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references venues(id) on delete cascade,
  title text not null default 'Liability Waiver',
  body text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Partner Requests
create table partner_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references players(id) on delete cascade,
  target_id uuid not null references players(id) on delete cascade,
  sport text not null,
  status text check (status in ('pending', 'accepted', 'declined', 'expired')) default 'pending',
  expires_at timestamptz default (now() + interval '5 minutes'),
  created_at timestamptz default now(),
  responded_at timestamptz
);

-- Courts / Lanes
create table courts (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid not null references venues(id) on delete cascade,
  name text not null,
  sport text not null,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- Matches
create table matches (
  id uuid primary key default uuid_generate_v4(),
  sport text not null,
  court_id uuid references courts(id),
  venue_id uuid references venues(id),
  status text check (status in ('queued', 'playing', 'completed')) default 'queued',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- Match Players (junction)
create table match_players (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  team smallint check (team in (1, 2)),
  unique(match_id, player_id)
);

-- Enable Row Level Security
alter table venues enable row level security;
alter table players enable row level security;
alter table waivers enable row level security;
alter table waiver_templates enable row level security;
alter table partner_requests enable row level security;
alter table courts enable row level security;
alter table matches enable row level security;
alter table match_players enable row level security;

-- Helper function: checks if a given players.id belongs to the current auth user
-- Used by RLS policies where player_id references players.id (not auth.users.id)
create or replace function public.is_own_player(p_player_id uuid) returns boolean as $$
  select exists (select 1 from public.players where id = p_player_id and user_id = auth.uid());
$$ language sql security definer stable;

-- RLS Policies: Players can read all, update own
create policy "Players are viewable by everyone" on players for select using (true);
create policy "Players can update own profile" on players for update using (auth.uid() = user_id);
create policy "Players can insert own profile" on players for insert with check (auth.uid() = user_id);

-- RLS Policies: Waivers (player_id references players.id, not auth.users.id)
create policy "Players can view own waivers" on waivers for select using (public.is_own_player(player_id));
create policy "Players can create own waivers" on waivers for insert with check (public.is_own_player(player_id));
create policy "Admins can view all waivers" on waivers for select using (
  exists (select 1 from players where user_id = auth.uid() and role = 'admin')
);

-- RLS Policies: Partner requests (requester_id/target_id reference players.id)
create policy "Players can view own requests" on partner_requests for select using (
  public.is_own_player(requester_id) or public.is_own_player(target_id)
);
create policy "Players can create requests" on partner_requests for insert with check (public.is_own_player(requester_id));
create policy "Target can update request" on partner_requests for update using (public.is_own_player(target_id));

-- RLS Policies: Courts, Venues, Matches - readable by all
create policy "Courts viewable by all" on courts for select using (true);
create policy "Venues viewable by all" on venues for select using (true);
create policy "Matches viewable by all" on matches for select using (true);
create policy "Match players viewable by all" on match_players for select using (true);
create policy "Waiver templates viewable by all" on waiver_templates for select using (true);

-- Admin policies for courts, venues, matches
create policy "Admins can manage courts" on courts for all using (
  exists (select 1 from players where user_id = auth.uid() and role = 'admin')
);
create policy "Admins can manage venues" on venues for all using (
  exists (select 1 from players where user_id = auth.uid() and role = 'admin')
);
create policy "Admins can manage matches" on matches for all using (
  exists (select 1 from players where user_id = auth.uid() and role = 'admin')
);
create policy "Admins can manage match_players" on match_players for all using (
  exists (select 1 from players where user_id = auth.uid() and role = 'admin')
);
create policy "Admins can manage waiver_templates" on waiver_templates for all using (
  exists (select 1 from players where user_id = auth.uid() and role = 'admin')
);

-- Enable Realtime for key tables
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table partner_requests;
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table courts;

-- Indexes
create index idx_players_user_id on players(user_id);
create index idx_players_venue on players(venue_id);
create index idx_players_available on players(is_available) where is_available = true;
create index idx_partner_requests_status on partner_requests(status) where status = 'pending';
create index idx_matches_status on matches(status) where status != 'completed';
create index idx_courts_venue on courts(venue_id);

-- ===== TEAMS, CHAT, STATS =====

-- Teams
create table teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  sport text not null,
  avatar_url text,
  captain_id uuid not null references players(id),
  venue_id uuid references venues(id),
  invite_code text unique default encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Team Members
create table team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  role text check (role in ('captain', 'member')) default 'member',
  joined_at timestamptz default now(),
  unique(team_id, player_id)
);

-- Team Messages (chat)
create table team_messages (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  sender_id uuid not null references players(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Match Results (extends matches)
create table match_results (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references matches(id) on delete cascade unique,
  winner_team smallint check (winner_team in (1, 2)),
  team1_score integer,
  team2_score integer,
  reported_by uuid references players(id),
  created_at timestamptz default now()
);

-- Player Stats (materialized/cached)
create table player_stats (
  player_id uuid primary key references players(id) on delete cascade,
  games_played integer default 0,
  wins integer default 0,
  losses integer default 0,
  win_rate numeric(5,2) default 0,
  favorite_sport text,
  favorite_partner_id uuid references players(id),
  last_played_at timestamptz,
  updated_at timestamptz default now()
);

-- RLS
alter table teams enable row level security;
alter table team_members enable row level security;
alter table team_messages enable row level security;
alter table match_results enable row level security;
alter table player_stats enable row level security;

-- Teams: readable by all, manageable by captain (captain_id references players.id)
create policy "Teams viewable by all" on teams for select using (true);
create policy "Captains can update team" on teams for update using (public.is_own_player(captain_id));
create policy "Players can create teams" on teams for insert with check (public.is_own_player(captain_id));

-- Team members: viewable by all, join/leave own (player_id references players.id)
create policy "Team members viewable by all" on team_members for select using (true);
create policy "Players can join teams" on team_members for insert with check (public.is_own_player(player_id));
create policy "Players can leave teams" on team_members for delete using (public.is_own_player(player_id));
create policy "Captains can remove members" on team_members for delete using (
  exists (select 1 from teams where id = team_id and public.is_own_player(captain_id))
);

-- Team messages: viewable by team members (player_id references players.id)
create policy "Team members can view messages" on team_messages for select using (
  exists (select 1 from team_members where team_id = team_messages.team_id and public.is_own_player(player_id))
);
create policy "Team members can send messages" on team_messages for insert with check (
  exists (select 1 from team_members where team_id = team_messages.team_id and public.is_own_player(player_id))
);

-- Match results: viewable by all, reportable by match players (player_id references players.id)
create policy "Match results viewable by all" on match_results for select using (true);
create policy "Players can report results" on match_results for insert with check (
  exists (select 1 from match_players where match_id = match_results.match_id and public.is_own_player(player_id))
);

-- Player stats: viewable by all
create policy "Stats viewable by all" on player_stats for select using (true);

-- Realtime for chat and stats
alter publication supabase_realtime add table team_messages;
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table player_stats;

-- Indexes
create index idx_team_members_team on team_members(team_id);
create index idx_team_members_player on team_members(player_id);
create index idx_team_messages_team on team_messages(team_id);
create index idx_team_messages_created on team_messages(created_at);
create index idx_match_results_match on match_results(match_id);
create index idx_player_stats_wins on player_stats(wins desc);
create index idx_teams_invite on teams(invite_code);

-- ===== SOCIAL, SCHEDULING, SETTINGS, ANALYTICS =====

-- Favorites (player bookmarks)
create table favorites (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  favorite_id uuid not null references players(id) on delete cascade,
  created_at timestamptz default now(),
  unique(player_id, favorite_id)
);

-- Player Reviews (post-match ratings)
create table player_reviews (
  id uuid primary key default uuid_generate_v4(),
  reviewer_id uuid not null references players(id) on delete cascade,
  reviewed_id uuid not null references players(id) on delete cascade,
  match_id uuid references matches(id),
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique(reviewer_id, match_id)
);

-- Scheduled Games
create table scheduled_games (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid not null references players(id) on delete cascade,
  venue_id uuid references venues(id),
  sport text not null,
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  duration_minutes integer default 60,
  max_players integer default 4,
  is_recurring boolean default false,
  recurrence_rule text, -- 'weekly:tuesday', 'biweekly:friday'
  status text check (status in ('upcoming', 'in_progress', 'completed', 'cancelled')) default 'upcoming',
  created_at timestamptz default now()
);

-- Game RSVPs
create table game_rsvps (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid not null references scheduled_games(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  status text check (status in ('going', 'maybe', 'not_going')) default 'going',
  created_at timestamptz default now(),
  unique(game_id, player_id)
);

-- Friends
create table friendships (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  friend_id uuid not null references players(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamptz default now(),
  unique(player_id, friend_id)
);

-- Activity Feed
create table activity_feed (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid references venues(id),
  player_id uuid references players(id),
  type text not null, -- 'check_in', 'match_complete', 'new_player', 'scheduled_game'
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Player Reports
create table player_reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references players(id),
  reported_id uuid not null references players(id),
  reason text not null,
  details text,
  status text check (status in ('pending', 'reviewed', 'resolved', 'dismissed')) default 'pending',
  admin_notes text,
  created_at timestamptz default now()
);

-- Notification Preferences
create table notification_preferences (
  player_id uuid primary key references players(id) on delete cascade,
  push_partner_requests boolean default true,
  push_match_ready boolean default true,
  push_friend_checkin boolean default true,
  push_scheduled_reminder boolean default true,
  email_weekly_summary boolean default true,
  email_upcoming_games boolean default true,
  profile_public boolean default true,
  stats_public boolean default true,
  updated_at timestamptz default now()
);

-- Venue Branding
alter table venues add column if not exists logo_url text;
alter table venues add column if not exists primary_color text default '#22c55e';
alter table venues add column if not exists secondary_color text default '#0f172a';
alter table venues add column if not exists tagline text;
alter table venues add column if not exists contact_email text;
alter table venues add column if not exists contact_phone text;
alter table venues add column if not exists website_url text;
alter table venues add column if not exists sports text[] default '{}';
alter table venues add column if not exists operating_hours jsonb default '{}';

-- RLS policies for new tables
alter table favorites enable row level security;
alter table player_reviews enable row level security;
alter table scheduled_games enable row level security;
alter table game_rsvps enable row level security;
alter table friendships enable row level security;
alter table activity_feed enable row level security;
alter table player_reports enable row level security;
alter table notification_preferences enable row level security;

-- All *_id columns below reference players.id, so use is_own_player()
create policy "Favorites: own" on favorites for all using (public.is_own_player(player_id)) with check (public.is_own_player(player_id));
create policy "Reviews: viewable by all" on player_reviews for select using (true);
create policy "Reviews: own" on player_reviews for insert with check (public.is_own_player(reviewer_id));
create policy "Games: viewable by all" on scheduled_games for select using (true);
create policy "Games: own" on scheduled_games for insert with check (public.is_own_player(organizer_id));
create policy "Games: manage own" on scheduled_games for update using (public.is_own_player(organizer_id));
create policy "RSVPs: viewable by all" on game_rsvps for select using (true);
create policy "RSVPs: own" on game_rsvps for all using (public.is_own_player(player_id)) with check (public.is_own_player(player_id));
create policy "Friends: own" on friendships for all using (public.is_own_player(player_id) or public.is_own_player(friend_id));
create policy "Feed: viewable by all" on activity_feed for select using (true);
create policy "Reports: own" on player_reports for insert with check (public.is_own_player(reporter_id));
create policy "Reports: admin view" on player_reports for select using (
  exists (select 1 from players where user_id = auth.uid() and role = 'admin')
);
create policy "Notif prefs: own" on notification_preferences for all using (public.is_own_player(player_id)) with check (public.is_own_player(player_id));

alter publication supabase_realtime add table activity_feed;
alter publication supabase_realtime add table scheduled_games;
alter publication supabase_realtime add table game_rsvps;

-- ===== TOURNAMENTS =====

-- Tournaments
create table tournaments (
  id uuid primary key default uuid_generate_v4(),
  venue_id uuid references venues(id),
  name text not null,
  sport text not null,
  format text not null check (format in ('round_robin', 'single_elimination', 'double_elimination')),
  status text not null check (status in ('registration', 'in_progress', 'completed', 'cancelled')) default 'registration',
  max_players integer default 16,
  created_by uuid not null references players(id),
  starts_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- Tournament Participants
create table tournament_participants (
  tournament_id uuid not null references tournaments(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  seed integer,
  eliminated boolean default false,
  wins integer default 0,
  losses integer default 0,
  primary key (tournament_id, player_id)
);

-- Tournament Matches
create table tournament_matches (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  round integer not null,
  match_number integer not null,
  player1_id uuid references players(id),
  player2_id uuid references players(id),
  winner_id uuid references players(id),
  score text,
  court_id uuid references courts(id),
  status text not null check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  scheduled_at timestamptz,
  completed_at timestamptz
);

-- RLS for tournament tables
alter table tournaments enable row level security;
alter table tournament_participants enable row level security;
alter table tournament_matches enable row level security;

-- Tournaments: viewable by all, creatable by any player, manageable by creator
create policy "Tournaments viewable by all" on tournaments for select using (true);
create policy "Players can create tournaments" on tournaments for insert with check (public.is_own_player(created_by));
create policy "Creator can update tournament" on tournaments for update using (public.is_own_player(created_by));

-- Participants: viewable by all, join/leave own
create policy "Participants viewable by all" on tournament_participants for select using (true);
create policy "Players can join tournaments" on tournament_participants for insert with check (public.is_own_player(player_id));
create policy "Players can leave tournaments" on tournament_participants for delete using (public.is_own_player(player_id));

-- Tournament matches: viewable by all, updatable by participants or creator
create policy "Tournament matches viewable by all" on tournament_matches for select using (true);
create policy "Tournament matches insertable by creator" on tournament_matches for insert with check (
  exists (select 1 from tournaments where id = tournament_id and public.is_own_player(created_by))
);
create policy "Tournament matches updatable by participants" on tournament_matches for update using (
  public.is_own_player(player1_id) or public.is_own_player(player2_id) or
  exists (select 1 from tournaments where id = tournament_id and public.is_own_player(created_by))
);

-- Realtime
alter publication supabase_realtime add table tournaments;
alter publication supabase_realtime add table tournament_participants;
alter publication supabase_realtime add table tournament_matches;

-- Indexes
create index idx_tournaments_venue on tournaments(venue_id);
create index idx_tournaments_status on tournaments(status) where status != 'completed';
create index idx_tournament_participants_tournament on tournament_participants(tournament_id);
create index idx_tournament_matches_tournament on tournament_matches(tournament_id);
create index idx_tournament_matches_round on tournament_matches(tournament_id, round);

-- ===== PROFILE ENHANCEMENTS: BIO & PREFERENCES =====
alter table players add column if not exists bio text;
alter table players add column if not exists preferred_position text check (preferred_position in ('lead', 'second', 'third', 'skip'));
alter table players add column if not exists preferred_hand text check (preferred_hand in ('left', 'right', 'ambidextrous'));
alter table players add column if not exists years_experience integer;

-- ===== PROFILE ENHANCEMENTS: PHOTO GALLERY =====

create table player_photos (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  url text not null,
  caption text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table player_photos enable row level security;

create policy "Photos viewable by all" on player_photos for select using (true);
create policy "Players can manage own photos" on player_photos for all using (public.is_own_player(player_id)) with check (public.is_own_player(player_id));

create index idx_player_photos_player on player_photos(player_id);
create index idx_player_photos_sort on player_photos(player_id, sort_order);

-- ===== PROFILE ENHANCEMENTS: AVAILABILITY SCHEDULE =====

create table player_availability (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(player_id, day_of_week, start_time)
);

alter table player_availability enable row level security;

create policy "Availability viewable by all" on player_availability for select using (true);
create policy "Players can manage own availability" on player_availability for all using (public.is_own_player(player_id)) with check (public.is_own_player(player_id));

create index idx_player_availability_player on player_availability(player_id);
create index idx_player_availability_day on player_availability(player_id, day_of_week);

-- ===== PROFILE ENHANCEMENTS: ACHIEVEMENT BADGES =====

create table player_achievements (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz default now(),
  unique(player_id, achievement_id)
);

alter table player_achievements enable row level security;

create policy "Achievements viewable by all" on player_achievements for select using (true);
create policy "System can grant achievements" on player_achievements for insert with check (public.is_own_player(player_id));

create index idx_player_achievements_player on player_achievements(player_id);
create index idx_player_achievements_achievement on player_achievements(achievement_id);

-- ===== PROFILE ENHANCEMENTS: CONTACT PREFERENCES =====

create table contact_preferences (
  player_id uuid primary key references players(id) on delete cascade,
  show_email boolean default false,
  show_phone boolean default false,
  preferred_contact text check (preferred_contact in ('in_app', 'email', 'phone', 'none')) default 'in_app',
  email text,
  phone text,
  allow_messages_from text check (allow_messages_from in ('everyone', 'friends', 'none')) default 'everyone',
  updated_at timestamptz default now()
);

alter table contact_preferences enable row level security;

create policy "Contact prefs: public fields viewable by all" on contact_preferences for select using (true);
create policy "Contact prefs: own" on contact_preferences for all using (public.is_own_player(player_id)) with check (public.is_own_player(player_id));

-- ===== PROFILE ENHANCEMENTS: ENDORSEMENTS =====

create table player_endorsements (
  id uuid primary key default uuid_generate_v4(),
  endorser_id uuid not null references players(id) on delete cascade,
  endorsed_id uuid not null references players(id) on delete cascade,
  skill text not null check (skill in ('great_skip', 'reliable_lead', 'strong_second', 'accurate_draw', 'powerful_drive', 'good_sportsmanship', 'team_player', 'tactical_mind')),
  created_at timestamptz default now(),
  unique(endorser_id, endorsed_id, skill),
  check (endorser_id != endorsed_id)
);

alter table player_endorsements enable row level security;

create policy "Endorsements viewable by all" on player_endorsements for select using (true);
create policy "Players can endorse others" on player_endorsements for insert with check (public.is_own_player(endorser_id));
create policy "Players can remove own endorsements" on player_endorsements for delete using (public.is_own_player(endorser_id));

create index idx_endorsements_endorsed on player_endorsements(endorsed_id);
create index idx_endorsements_endorser on player_endorsements(endorser_id);
