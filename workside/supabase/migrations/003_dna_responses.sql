-- @TASK P2-R1-T2 - DNA Responses table migration
-- @SPEC docs/planning/02-trd.md#dna-responses

create table public.dna_responses (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null references public.dna_sessions(id) on delete cascade,
  question_id text not null,
  value numeric not null check (value >= 1 and value <= 7),
  created_at timestamptz default now() not null,
  unique(session_id, question_id)
);

alter table public.dna_responses enable row level security;

create policy "Anyone can insert responses" on public.dna_responses for insert with check (true);
create policy "Anyone can view responses by session" on public.dna_responses for select using (true);
