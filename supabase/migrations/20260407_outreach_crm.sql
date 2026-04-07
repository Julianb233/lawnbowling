-- Outreach CRM Migration
-- Tracks club outreach status, email campaigns, and follow-up sequences
-- for global club acquisition (AI-2520)

-- =============================================================================
-- 1. OUTREACH_CAMPAIGNS — email campaign definitions
-- =============================================================================

create table if not exists outreach_campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  country_code text,                -- NULL = all countries
  template_key text not null,       -- matches email template identifier
  subject_line text not null,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'paused', 'completed')),
  sent_count integer not null default 0,
  open_count integer not null default 0,
  click_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================================================
-- 2. OUTREACH_SEQUENCES — follow-up email sequences per campaign
-- =============================================================================

create table if not exists outreach_sequences (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references outreach_campaigns(id) on delete cascade,
  step_number integer not null,
  delay_days integer not null default 3,  -- days after previous step
  template_key text not null,
  subject_line text not null,
  created_at timestamptz default now(),
  unique(campaign_id, step_number)
);

-- =============================================================================
-- 3. CLUB_OUTREACH — per-club outreach status tracking (the CRM core)
-- =============================================================================

create table if not exists club_outreach (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid not null references clubs(id) on delete cascade,
  campaign_id uuid references outreach_campaigns(id) on delete set null,
  status text not null default 'not_contacted'
    check (status in (
      'not_contacted', 'contacted', 'opened', 'replied',
      'demo_scheduled', 'demo_completed', 'onboarded', 'declined', 'bounced'
    )),
  contact_email text,              -- denormalized for quick access
  contact_name text,
  last_contacted_at timestamptz,
  last_opened_at timestamptz,
  last_replied_at timestamptz,
  next_followup_at timestamptz,
  current_sequence_step integer default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(club_id)
);

-- =============================================================================
-- 4. OUTREACH_EMAILS — individual email send log
-- =============================================================================

create table if not exists outreach_emails (
  id uuid primary key default uuid_generate_v4(),
  club_outreach_id uuid not null references club_outreach(id) on delete cascade,
  campaign_id uuid references outreach_campaigns(id) on delete set null,
  sequence_step integer,
  to_email text not null,
  subject text not null,
  resend_message_id text,           -- Resend API message ID for tracking
  status text not null default 'sent'
    check (status in ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')),
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced_at timestamptz,
  sent_at timestamptz default now(),
  created_at timestamptz default now()
);

-- =============================================================================
-- 5. INDEXES
-- =============================================================================

create index if not exists idx_club_outreach_status on club_outreach(status);
create index if not exists idx_club_outreach_campaign on club_outreach(campaign_id);
create index if not exists idx_club_outreach_next_followup on club_outreach(next_followup_at)
  where next_followup_at is not null;
create index if not exists idx_outreach_emails_club on outreach_emails(club_outreach_id);
create index if not exists idx_outreach_emails_campaign on outreach_emails(campaign_id);
create index if not exists idx_outreach_emails_status on outreach_emails(status);
create index if not exists idx_outreach_campaigns_status on outreach_campaigns(status);

-- =============================================================================
-- 6. RLS — admin-only access
-- =============================================================================

alter table outreach_campaigns enable row level security;
alter table outreach_sequences enable row level security;
alter table club_outreach enable row level security;
alter table outreach_emails enable row level security;

create policy "Admins can manage outreach campaigns" on outreach_campaigns
  for all using (
    exists (select 1 from players where user_id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage outreach sequences" on outreach_sequences
  for all using (
    exists (select 1 from players where user_id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage club outreach" on club_outreach
  for all using (
    exists (select 1 from players where user_id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage outreach emails" on outreach_emails
  for all using (
    exists (select 1 from players where user_id = auth.uid() and role = 'admin')
  );

-- =============================================================================
-- 7. UPDATED_AT TRIGGERS
-- =============================================================================

create or replace function update_outreach_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger outreach_campaigns_updated_at
  before update on outreach_campaigns
  for each row execute function update_outreach_updated_at();

create trigger club_outreach_updated_at
  before update on club_outreach
  for each row execute function update_outreach_updated_at();

-- =============================================================================
-- 8. CAMPAIGN STATS AGGREGATE VIEW
-- =============================================================================

create or replace view outreach_campaign_stats as
select
  c.id as campaign_id,
  c.name,
  c.status,
  c.country_code,
  count(distinct co.id) as total_clubs,
  count(distinct co.id) filter (where co.status = 'contacted') as contacted,
  count(distinct co.id) filter (where co.status = 'opened') as opened,
  count(distinct co.id) filter (where co.status = 'replied') as replied,
  count(distinct co.id) filter (where co.status = 'demo_scheduled') as demos_scheduled,
  count(distinct co.id) filter (where co.status = 'demo_completed') as demos_completed,
  count(distinct co.id) filter (where co.status = 'onboarded') as onboarded,
  count(distinct co.id) filter (where co.status = 'declined') as declined,
  count(distinct co.id) filter (where co.status = 'bounced') as bounced
from outreach_campaigns c
left join club_outreach co on co.campaign_id = c.id
group by c.id, c.name, c.status, c.country_code;
