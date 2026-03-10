-- Push Subscriptions table for Web Push notification delivery
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique (player_id, endpoint)
);

alter table push_subscriptions enable row level security;

create policy "Push subs: own"
  on push_subscriptions for all
  using (public.is_own_player(player_id));
