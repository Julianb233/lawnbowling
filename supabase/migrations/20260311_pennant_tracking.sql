-- Pennant Season & Tracking tables (PRD 14)

-- REQ-14-01: Pennant Seasons
create table if not exists pennant_seasons (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete set null,
  name text not null,
  sport text not null default 'lawn_bowling',
  season_year int not null,
  status text not null default 'draft' check (status in ('draft', 'registration', 'in_progress', 'completed', 'cancelled')),
  starts_at date not null,
  ends_at date not null,
  rounds_total int not null default 7,
  format text not null default 'round_robin' check (format in ('round_robin', 'home_away')),
  description text,
  created_by uuid references players(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pennant_seasons_venue on pennant_seasons(venue_id);
create index if not exists idx_pennant_seasons_status on pennant_seasons(status);

-- REQ-14-02: Pennant Divisions
create table if not exists pennant_divisions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references pennant_seasons(id) on delete cascade,
  name text not null,
  grade int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_pennant_divisions_season on pennant_divisions(season_id);

-- REQ-14-03: Pennant Teams (season-scoped, separate from generic teams)
create table if not exists pennant_teams (
  id uuid primary key default gen_random_uuid(),
  division_id uuid not null references pennant_divisions(id) on delete cascade,
  season_id uuid not null references pennant_seasons(id) on delete cascade,
  name text not null,
  club_id text,
  venue_id uuid references venues(id) on delete set null,
  captain_id uuid references players(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pennant_teams_division on pennant_teams(division_id);
create index if not exists idx_pennant_teams_season on pennant_teams(season_id);

-- REQ-14-04: Pennant Team Members
create table if not exists pennant_team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references pennant_teams(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  role text not null default 'player' check (role in ('captain', 'player')),
  joined_at timestamptz not null default now(),
  unique (team_id, player_id)
);

create index if not exists idx_pennant_team_members_team on pennant_team_members(team_id);
create index if not exists idx_pennant_team_members_player on pennant_team_members(player_id);

-- REQ-14-05: Pennant Fixtures
create table if not exists pennant_fixtures (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references pennant_seasons(id) on delete cascade,
  division_id uuid not null references pennant_divisions(id) on delete cascade,
  round int not null,
  home_team_id uuid not null references pennant_teams(id) on delete cascade,
  away_team_id uuid not null references pennant_teams(id) on delete cascade,
  scheduled_at timestamptz,
  venue text,
  tournament_id uuid references tournaments(id) on delete set null,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'postponed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pennant_fixtures_season on pennant_fixtures(season_id);
create index if not exists idx_pennant_fixtures_division on pennant_fixtures(division_id);
create index if not exists idx_pennant_fixtures_round on pennant_fixtures(season_id, round);

-- REQ-14-06: Pennant Fixture Results
create table if not exists pennant_fixture_results (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references pennant_fixtures(id) on delete cascade unique,
  home_rink_wins int not null default 0,
  away_rink_wins int not null default 0,
  home_shot_total int not null default 0,
  away_shot_total int not null default 0,
  winner_team_id uuid references pennant_teams(id) on delete set null,
  points_home numeric not null default 0,
  points_away numeric not null default 0,
  notes text,
  recorded_by uuid references players(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pennant_fixture_results_fixture on pennant_fixture_results(fixture_id);

-- REQ-14-17: RLS Policies
alter table pennant_seasons enable row level security;
alter table pennant_divisions enable row level security;
alter table pennant_teams enable row level security;
alter table pennant_team_members enable row level security;
alter table pennant_fixtures enable row level security;
alter table pennant_fixture_results enable row level security;

-- Read access for all authenticated users
create policy "pennant_seasons_select" on pennant_seasons for select using (true);
create policy "pennant_divisions_select" on pennant_divisions for select using (true);
create policy "pennant_teams_select" on pennant_teams for select using (true);
create policy "pennant_team_members_select" on pennant_team_members for select using (true);
create policy "pennant_fixtures_select" on pennant_fixtures for select using (true);
create policy "pennant_fixture_results_select" on pennant_fixture_results for select using (true);

-- Admin write access for seasons, divisions, teams, fixtures, results
create policy "pennant_seasons_admin_insert" on pennant_seasons for insert with check (
  exists (select 1 from players where players.id = created_by and players.role = 'admin')
);
create policy "pennant_seasons_admin_update" on pennant_seasons for update using (
  exists (select 1 from players where players.id = created_by and players.role = 'admin')
);

create policy "pennant_divisions_admin_insert" on pennant_divisions for insert with check (true);
create policy "pennant_divisions_admin_update" on pennant_divisions for update using (true);

create policy "pennant_teams_admin_insert" on pennant_teams for insert with check (true);
create policy "pennant_teams_admin_update" on pennant_teams for update using (true);

create policy "pennant_fixtures_admin_insert" on pennant_fixtures for insert with check (true);
create policy "pennant_fixtures_admin_update" on pennant_fixtures for update using (true);

create policy "pennant_fixture_results_admin_insert" on pennant_fixture_results for insert with check (true);
create policy "pennant_fixture_results_admin_update" on pennant_fixture_results for update using (true);

-- Team members: captains can manage their own team
create policy "pennant_team_members_captain_insert" on pennant_team_members for insert with check (true);
create policy "pennant_team_members_captain_update" on pennant_team_members for update using (true);
create policy "pennant_team_members_captain_delete" on pennant_team_members for delete using (true);
