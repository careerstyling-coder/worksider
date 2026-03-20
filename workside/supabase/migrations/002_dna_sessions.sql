-- @TASK P2-R1-T1 - DNA Sessions table migration
-- @SPEC docs/planning/02-trd.md#dna-sessions

create table public.dna_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete set null,
  version text not null check (version in ('semi', 'full')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  share_token text unique,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

alter table public.dna_sessions enable row level security;

create policy "Anyone can create sessions" on public.dna_sessions for insert with check (true);
create policy "Users can view own sessions" on public.dna_sessions for select using (user_id = auth.uid() or user_id is null);
create policy "Users can update own sessions" on public.dna_sessions for update using (user_id = auth.uid() or user_id is null);
