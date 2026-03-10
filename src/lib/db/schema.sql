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
