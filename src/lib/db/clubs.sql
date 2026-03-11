-- Club Directory Table
-- Stores all lawn bowling clubs in the USA (and eventually worldwide)
-- Uses the same Supabase instance as Lawnbowling

create table if not exists clubs (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null, -- URL-friendly identifier e.g. 'san-francisco-lawn-bowling-club'
  name text not null,
  city text not null,
  state text not null,
  state_code text not null, -- 2-letter state code
  region text check (region in ('west', 'east', 'south', 'midwest')) not null,
  address text,
  lat decimal(10, 7),
  lng decimal(10, 7),
  website text,
  phone text,
  email text,
  member_count integer,
  greens integer,
  rinks integer,
  surface_type text check (surface_type in ('natural_grass', 'synthetic', 'hybrid', 'unknown')) default 'unknown',
  division text, -- Bowls USA division
  activities text[] default '{}', -- Array of activity types
  facilities text[] default '{}', -- Array of facility types
  founded integer, -- Year founded
  description text,
  status text check (status in ('active', 'seasonal', 'inactive', 'unverified', 'claimed')) default 'unverified',
  has_online_presence boolean default false,
  facebook_url text,
  instagram_url text,
  youtube_url text,
  logo_url text,
  cover_image_url text,
  tags text[] default '{}',
  -- Claimed club fields
  claimed_by uuid references players(id), -- Player who claimed/manages the club
  claimed_at timestamptz,
  -- Lawn Bowl app integration
  venue_id uuid references venues(id), -- Links to venue if they use the app
  is_featured boolean default false,
  -- SEO
  meta_title text,
  meta_description text,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for search and filtering
create index if not exists idx_clubs_state_code on clubs(state_code);
create index if not exists idx_clubs_region on clubs(region);
create index if not exists idx_clubs_status on clubs(status);
create index if not exists idx_clubs_slug on clubs(slug);
create index if not exists idx_clubs_division on clubs(division);
create index if not exists idx_clubs_surface_type on clubs(surface_type);
create index if not exists idx_clubs_name_search on clubs using gin(to_tsvector('english', name || ' ' || city || ' ' || state));
create index if not exists idx_clubs_tags on clubs using gin(tags);
create index if not exists idx_clubs_activities on clubs using gin(activities);
create index if not exists idx_clubs_region_state on clubs(region, state_code);
create index if not exists idx_clubs_featured on clubs(is_featured) where is_featured = true;

-- RLS
alter table clubs enable row level security;

-- Anyone can read clubs (public directory)
create policy "Clubs are viewable by everyone" on clubs
  for select using (true);

-- Only admins can insert/update/delete
create policy "Admins can manage clubs" on clubs
  for all using (
    exists (select 1 from players where players.user_id = auth.uid() and players.role = 'admin')
  );

-- Club managers can update their claimed club
create policy "Club managers can update their club" on clubs
  for update using (
    claimed_by is not null and
    claimed_by = (select id from players where user_id = auth.uid() limit 1)
  );

-- Updated_at trigger
create or replace function update_clubs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clubs_updated_at
  before update on clubs
  for each row
  execute function update_clubs_updated_at();
