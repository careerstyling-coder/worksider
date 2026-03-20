-- @TASK P3-R3-T1 - Participation History table
-- @SPEC docs/planning/02-trd.md#participation-history

create table public.participation_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id),
  action_type text not null check (action_type in ('diagnosis', 'question', 'suggestion', 'share', 'shout_out')),
  target_id uuid not null,
  created_at timestamptz default now() not null
);

alter table public.participation_history enable row level security;

create policy "Users can view own history"
  on public.participation_history for select
  using (user_id = auth.uid());

create policy "System can insert history"
  on public.participation_history for insert
  with check (true);
