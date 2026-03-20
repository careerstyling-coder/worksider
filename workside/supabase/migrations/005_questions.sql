-- @TASK P3-R1-T1 - Questions table
-- @SPEC docs/planning/02-trd.md#questions

create table public.questions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text not null default 'simple' check (type in ('simple', 'survey')),
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  is_featured boolean default false,
  options jsonb not null default '[]'::jsonb,
  created_by uuid references public.users(id),
  suggestion_id uuid,
  deadline timestamptz,
  participant_count integer default 0,
  created_at timestamptz default now() not null
);

alter table public.questions enable row level security;

create policy "Active questions are public"
  on public.questions for select
  using (
    status = 'active'
    or exists(select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admin can manage questions"
  on public.questions for all
  using (
    exists(select 1 from public.users where id = auth.uid() and role = 'admin')
  );
