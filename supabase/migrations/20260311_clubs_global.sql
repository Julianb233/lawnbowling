-- Clubs Global Migration
-- Adds international support: country, country_code, province columns
-- Creates club_contacts table for structured contact information

-- =============================================================================
-- 1. Add country and country_code columns with US defaults
-- =============================================================================

alter table clubs
  add column if not exists country text not null default 'United States',
  add column if not exists country_code text not null default 'US';

-- =============================================================================
-- 2. Make region nullable (non-US clubs won't have US regions)
--    Drop the existing CHECK constraint and re-add it allowing NULL
-- =============================================================================

-- Drop the existing NOT NULL constraint on region
alter table clubs alter column region drop not null;

-- Drop the existing check constraint on region and re-create allowing null
alter table clubs drop constraint if exists clubs_region_check;
alter table clubs add constraint clubs_region_check
  check (region is null or region in ('west', 'east', 'south', 'midwest'));

-- =============================================================================
-- 3. Add province column for non-US subdivisions
-- =============================================================================

alter table clubs
  add column if not exists province text;

-- =============================================================================
-- 4. Create club_contacts table
-- =============================================================================

create table if not exists club_contacts (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid not null references clubs(id) on delete cascade,
  name text not null,
  role text not null,
  email text,
  phone text,
  linkedin_url text,
  instagram_url text,
  facebook_url text,
  twitter_url text,
  is_primary boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================================================
-- 5. RLS: club_contacts viewable by everyone, manageable by admin/club managers
-- =============================================================================

alter table club_contacts enable row level security;

create policy "Club contacts are viewable by everyone" on club_contacts
  for select using (true);

create policy "Admins can manage club contacts" on club_contacts
  for all using (
    exists (
      select 1 from players
      where players.user_id = auth.uid()
        and players.role = 'admin'
    )
  );

create policy "Club managers can manage their club contacts" on club_contacts
  for all using (
    exists (
      select 1 from clubs
      where clubs.id = club_contacts.club_id
        and clubs.claimed_by is not null
        and clubs.claimed_by = (
          select id from players where user_id = auth.uid() limit 1
        )
    )
  );

-- =============================================================================
-- 6. Indexes
-- =============================================================================

create index if not exists idx_club_contacts_club_id on club_contacts(club_id);
create index if not exists idx_clubs_country_code on clubs(country_code);

-- =============================================================================
-- 7. Update existing clubs to set country='United States', country_code='US'
-- =============================================================================

update clubs
  set country = 'United States',
      country_code = 'US'
  where country_code is null or country_code = 'US';

-- =============================================================================
-- Updated_at trigger for club_contacts
-- =============================================================================

create or replace function update_club_contacts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger club_contacts_updated_at
  before update on club_contacts
  for each row
  execute function update_club_contacts_updated_at();
