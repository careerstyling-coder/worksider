-- @TASK P3-R2-T1 - Question Responses table
-- @SPEC docs/planning/02-trd.md#question-responses

create table public.question_responses (
  id uuid default gen_random_uuid() primary key,
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid references public.users(id),
  selected_option text not null,
  persona_label text,
  created_at timestamptz default now() not null,
  unique(question_id, user_id)
);

alter table public.question_responses enable row level security;

create policy "Anyone can submit responses"
  on public.question_responses for insert
  with check (true);

create policy "Responses are viewable"
  on public.question_responses for select
  using (true);
