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
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
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

-- RLS Policies: Players can read all, update own
create policy "Players are viewable by everyone" on players for select using (true);
create policy "Players can update own profile" on players for update using (auth.uid() = id);
create policy "Players can insert own profile" on players for insert with check (auth.uid() = id);

-- RLS Policies: Waivers
create policy "Players can view own waivers" on waivers for select using (auth.uid() = player_id);
create policy "Players can create own waivers" on waivers for insert with check (auth.uid() = player_id);
create policy "Admins can view all waivers" on waivers for select using (
  exists (select 1 from players where id = auth.uid() and role = 'admin')
);

-- RLS Policies: Partner requests
create policy "Players can view own requests" on partner_requests for select using (
  auth.uid() = requester_id or auth.uid() = target_id
);
create policy "Players can create requests" on partner_requests for insert with check (auth.uid() = requester_id);
create policy "Target can update request" on partner_requests for update using (auth.uid() = target_id);

-- RLS Policies: Courts, Venues, Matches - readable by all
create policy "Courts viewable by all" on courts for select using (true);
create policy "Venues viewable by all" on venues for select using (true);
create policy "Matches viewable by all" on matches for select using (true);
create policy "Match players viewable by all" on match_players for select using (true);
create policy "Waiver templates viewable by all" on waiver_templates for select using (true);

-- Admin policies for courts, venues, matches
create policy "Admins can manage courts" on courts for all using (
  exists (select 1 from players where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage venues" on venues for all using (
  exists (select 1 from players where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage matches" on matches for all using (
  exists (select 1 from players where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage match_players" on match_players for all using (
  exists (select 1 from players where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage waiver_templates" on waiver_templates for all using (
  exists (select 1 from players where id = auth.uid() and role = 'admin')
);

-- Enable Realtime for key tables
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table partner_requests;
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table courts;

-- Indexes
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

-- Teams: readable by all, manageable by captain
create policy "Teams viewable by all" on teams for select using (true);
create policy "Captains can update team" on teams for update using (auth.uid() = captain_id);
create policy "Players can create teams" on teams for insert with check (auth.uid() = captain_id);

-- Team members: viewable by all, join/leave own
create policy "Team members viewable by all" on team_members for select using (true);
create policy "Players can join teams" on team_members for insert with check (auth.uid() = player_id);
create policy "Players can leave teams" on team_members for delete using (auth.uid() = player_id);
create policy "Captains can remove members" on team_members for delete using (
  exists (select 1 from teams where id = team_id and captain_id = auth.uid())
);

-- Team messages: viewable by team members
create policy "Team members can view messages" on team_messages for select using (
  exists (select 1 from team_members where team_id = team_messages.team_id and player_id = auth.uid())
);
create policy "Team members can send messages" on team_messages for insert with check (
  exists (select 1 from team_members where team_id = team_messages.team_id and player_id = auth.uid())
);

-- Match results: viewable by all, reportable by match players
create policy "Match results viewable by all" on match_results for select using (true);
create policy "Players can report results" on match_results for insert with check (
  exists (select 1 from match_players where match_id = match_results.match_id and player_id = auth.uid())
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
