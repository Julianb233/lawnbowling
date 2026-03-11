-- Pennant Season & League Tracking
-- 6 tables: pennant_seasons, pennant_divisions, pennant_teams,
--           pennant_team_members, pennant_fixtures, pennant_fixture_results

-- ═══════════════════════════════════════════════════════════════
-- 1. pennant_seasons
-- ═══════════════════════════════════════════════════════════════

create table if not exists pennant_seasons (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null,
  name text not null,
  sport text not null default 'lawn_bowling',
  season_year integer not null,
  status text not null default 'draft'
    check (status in ('draft', 'registration', 'in_progress', 'completed', 'cancelled')),
  starts_at date not null,
  ends_at date not null,
  rounds_total integer not null check (rounds_total > 0),
  format text not null default 'round_robin'
    check (format in ('round_robin', 'home_away')),
  description text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pennant_seasons_venue on pennant_seasons(venue_id);
create index if not exists idx_pennant_seasons_status on pennant_seasons(status);

-- ═══════════════════════════════════════════════════════════════
-- 2. pennant_divisions
-- ═══════════════════════════════════════════════════════════════

create table if not exists pennant_divisions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references pennant_seasons(id) on delete cascade,
  name text not null,
  grade integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_pennant_divisions_season on pennant_divisions(season_id);

-- ═══════════════════════════════════════════════════════════════
-- 3. pennant_teams (season-scoped, NOT reusing generic teams table)
-- ═══════════════════════════════════════════════════════════════

create table if not exists pennant_teams (
  id uuid primary key default gen_random_uuid(),
  division_id uuid not null references pennant_divisions(id) on delete cascade,
  season_id uuid not null references pennant_seasons(id) on delete cascade,
  name text not null,
  club_id text, -- references ClubData.id from clubs-data.ts for inter-club
  venue_id uuid,
  captain_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pennant_teams_division on pennant_teams(division_id);
create index if not exists idx_pennant_teams_season on pennant_teams(season_id);

-- ═══════════════════════════════════════════════════════════════
-- 4. pennant_team_members
-- ═══════════════════════════════════════════════════════════════

create table if not exists pennant_team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references pennant_teams(id) on delete cascade,
  player_id uuid not null,
  role text not null default 'player'
    check (role in ('captain', 'player')),
  joined_at timestamptz not null default now(),
  unique(team_id, player_id)
);

create index if not exists idx_pennant_team_members_team on pennant_team_members(team_id);
create index if not exists idx_pennant_team_members_player on pennant_team_members(player_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. pennant_fixtures
-- ═══════════════════════════════════════════════════════════════

create table if not exists pennant_fixtures (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references pennant_seasons(id) on delete cascade,
  division_id uuid not null references pennant_divisions(id) on delete cascade,
  round integer not null,
  home_team_id uuid not null references pennant_teams(id) on delete cascade,
  away_team_id uuid not null references pennant_teams(id) on delete cascade,
  scheduled_at timestamptz,
  venue text,
  tournament_id uuid, -- links to tournaments table for draw generation
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_progress', 'completed', 'postponed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (home_team_id <> away_team_id)
);

create index if not exists idx_pennant_fixtures_season on pennant_fixtures(season_id);
create index if not exists idx_pennant_fixtures_division on pennant_fixtures(division_id);
create index if not exists idx_pennant_fixtures_round on pennant_fixtures(season_id, division_id, round);
create index if not exists idx_pennant_fixtures_tournament on pennant_fixtures(tournament_id) where tournament_id is not null;

-- ═══════════════════════════════════════════════════════════════
-- 6. pennant_fixture_results
-- ═══════════════════════════════════════════════════════════════

create table if not exists pennant_fixture_results (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null unique references pennant_fixtures(id) on delete cascade,
  home_rink_wins integer not null default 0,
  away_rink_wins integer not null default 0,
  home_shot_total integer not null default 0,
  away_shot_total integer not null default 0,
  winner_team_id uuid, -- null on draw
  points_home numeric not null default 0,
  points_away numeric not null default 0,
  notes text,
  recorded_by uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pennant_fixture_results_fixture on pennant_fixture_results(fixture_id);

-- ═══════════════════════════════════════════════════════════════
-- Updated_at triggers
-- ═══════════════════════════════════════════════════════════════

create or replace function update_pennant_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pennant_seasons_updated_at
  before update on pennant_seasons
  for each row execute function update_pennant_updated_at();

create trigger pennant_fixtures_updated_at
  before update on pennant_fixtures
  for each row execute function update_pennant_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════

alter table pennant_seasons enable row level security;
alter table pennant_divisions enable row level security;
alter table pennant_teams enable row level security;
alter table pennant_team_members enable row level security;
alter table pennant_fixtures enable row level security;
alter table pennant_fixture_results enable row level security;

-- All authenticated users can read all pennant data
create policy "pennant_seasons_select" on pennant_seasons
  for select to authenticated using (true);

create policy "pennant_divisions_select" on pennant_divisions
  for select to authenticated using (true);

create policy "pennant_teams_select" on pennant_teams
  for select to authenticated using (true);

create policy "pennant_team_members_select" on pennant_team_members
  for select to authenticated using (true);

create policy "pennant_fixtures_select" on pennant_fixtures
  for select to authenticated using (true);

create policy "pennant_fixture_results_select" on pennant_fixture_results
  for select to authenticated using (true);

-- Admins (via player role=admin) can insert/update seasons, divisions, teams, fixtures, results
-- Using a helper function to check admin status
create or replace function is_pennant_admin()
returns boolean as $$
begin
  return exists (
    select 1 from players
    where user_id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

create policy "pennant_seasons_admin_insert" on pennant_seasons
  for insert to authenticated with check (is_pennant_admin());

create policy "pennant_seasons_admin_update" on pennant_seasons
  for update to authenticated using (is_pennant_admin());

create policy "pennant_divisions_admin_insert" on pennant_divisions
  for insert to authenticated with check (is_pennant_admin());

create policy "pennant_divisions_admin_update" on pennant_divisions
  for update to authenticated using (is_pennant_admin());

create policy "pennant_teams_admin_insert" on pennant_teams
  for insert to authenticated with check (is_pennant_admin());

create policy "pennant_teams_admin_update" on pennant_teams
  for update to authenticated using (is_pennant_admin());

create policy "pennant_fixtures_admin_insert" on pennant_fixtures
  for insert to authenticated with check (is_pennant_admin());

create policy "pennant_fixtures_admin_update" on pennant_fixtures
  for update to authenticated using (is_pennant_admin());

create policy "pennant_fixture_results_admin_insert" on pennant_fixture_results
  for insert to authenticated with check (is_pennant_admin());

create policy "pennant_fixture_results_admin_update" on pennant_fixture_results
  for update to authenticated using (is_pennant_admin());

-- Team captains can update their own team members
create policy "pennant_team_members_captain_insert" on pennant_team_members
  for insert to authenticated with check (
    is_pennant_admin() or exists (
      select 1 from pennant_teams
      where id = team_id
      and captain_id = auth.uid()
    )
  );

create policy "pennant_team_members_captain_update" on pennant_team_members
  for update to authenticated using (
    is_pennant_admin() or exists (
      select 1 from pennant_teams
      where id = team_id
      and captain_id = auth.uid()
    )
  );

create policy "pennant_team_members_captain_delete" on pennant_team_members
  for delete to authenticated using (
    is_pennant_admin() or exists (
      select 1 from pennant_teams
      where id = team_id
      and captain_id = auth.uid()
    )
  );

-- Enable Realtime for live updates
alter publication supabase_realtime add table pennant_fixture_results;
alter publication supabase_realtime add table pennant_fixtures;
