-- @TASK P1-R1-T1 - Reservations prelaunch table
-- @SPEC docs/planning/prelaunch/reservations

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  industry text not null,
  experience_years text not null,
  queue_position serial,
  invite_code text unique not null,
  invited_by_id uuid references public.reservations(id),
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.reservations enable row level security;

-- Policies
create policy "Anyone can create a reservation"
  on public.reservations for insert
  with check (true);

create policy "Users can read their own reservation"
  on public.reservations for select
  using (true);
