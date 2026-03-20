-- @TASK P2-R2-T1 - dna_results 테이블 마이그레이션
-- @SPEC docs/planning/02-trd.md#dna-results

create table public.dna_results (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null references public.dna_sessions(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  p_score numeric not null,
  c_score numeric not null,
  pol_score numeric not null,
  s_score numeric not null,
  persona_label text not null,
  persona_description text not null,
  version text not null check (version in ('semi', 'full')),
  share_token text unique not null default gen_random_uuid()::text,
  created_at timestamptz default now() not null
);

alter table public.dna_results enable row level security;

create policy "Results viewable by share_token" on public.dna_results for select using (true);
create policy "Users can view own results" on public.dna_results for select using (user_id = auth.uid());
create policy "System can insert results" on public.dna_results for insert with check (true);
create policy "Users can update own results" on public.dna_results for update using (user_id = auth.uid() or user_id is null);
