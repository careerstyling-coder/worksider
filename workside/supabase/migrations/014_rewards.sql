-- @TASK P1-R3-T1 - Rewards table migration
-- @SPEC docs/planning/prelaunch/rewards

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id),
  type text not null check (type in ('early_adopter_badge', 'priority_access')),
  status text not null default 'pending' check (status in ('pending', 'unlocked', 'redeemed')),
  unlocked_at timestamptz,
  created_at timestamptz default now() not null
);

-- RLS
alter table public.rewards enable row level security;

create policy "Anyone can read rewards"
  on public.rewards for select
  using (true);

create policy "System can create rewards"
  on public.rewards for insert
  with check (true);

create policy "System can update rewards"
  on public.rewards for update
  using (true);
