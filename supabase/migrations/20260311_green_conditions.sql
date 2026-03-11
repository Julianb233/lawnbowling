-- Green Conditions table (REQ-15-01)
create table if not exists green_conditions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  venue_id uuid references venues(id) on delete set null,
  recorded_by uuid references players(id) on delete set null,
  green_speed text not null check (green_speed in ('fast', 'medium', 'slow')),
  surface_condition text not null check (surface_condition in ('dry', 'damp', 'wet')),
  wind_direction text not null check (wind_direction in ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'calm')),
  wind_strength text not null check (wind_strength in ('calm', 'light', 'moderate', 'strong')),
  notes text check (char_length(notes) <= 280),
  temperature_c numeric,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id)
);

-- Index for club history lookups by venue
create index if not exists idx_green_conditions_venue_id on green_conditions(venue_id);
create index if not exists idx_green_conditions_recorded_at on green_conditions(recorded_at desc);

-- RLS policies (REQ-15-13)
alter table green_conditions enable row level security;

-- Any authenticated user can read
create policy "green_conditions_select" on green_conditions
  for select using (true);

-- Only admins can insert/update
create policy "green_conditions_insert" on green_conditions
  for insert with check (
    exists (
      select 1 from players
      where players.id = recorded_by
        and players.role = 'admin'
    )
  );

create policy "green_conditions_update" on green_conditions
  for update using (
    exists (
      select 1 from players
      where players.id = recorded_by
        and players.role = 'admin'
    )
  );
