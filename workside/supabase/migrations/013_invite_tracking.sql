-- @TASK P1-R2-T1 - Invite Tracking Table
-- @SPEC docs/planning/prelaunch/invite-tracking

create table public.invite_tracking (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.reservations(id),
  invitee_id uuid references public.reservations(id),
  invite_code text not null,
  link_clicked boolean default false,
  clicked_at timestamptz,
  converted boolean default false,
  converted_at timestamptz,
  created_at timestamptz default now() not null
);

-- RLS
alter table public.invite_tracking enable row level security;

create policy "Anyone can create tracking"
  on public.invite_tracking for insert
  with check (true);

create policy "Anyone can read tracking"
  on public.invite_tracking for select
  using (true);

create policy "System can update tracking"
  on public.invite_tracking for update
  using (true);
