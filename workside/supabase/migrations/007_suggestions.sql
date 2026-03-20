-- @TASK P3-R2-T2 - Suggestions & Shout Outs tables
-- @SPEC docs/planning/02-trd.md#suggestions

create table public.suggestions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id),
  title text not null,
  background text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  shout_out_count integer default 0,
  created_at timestamptz default now() not null
);

create table public.shout_outs (
  id uuid default gen_random_uuid() primary key,
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  user_id uuid not null references public.users(id),
  created_at timestamptz default now() not null,
  unique(suggestion_id, user_id)
);

alter table public.suggestions enable row level security;
alter table public.shout_outs enable row level security;

create policy "Approved suggestions are public"
  on public.suggestions for select
  using (
    status = 'approved'
    or user_id = auth.uid()
    or exists(select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Auth users can create suggestions"
  on public.suggestions for insert
  with check (auth.uid() is not null);

create policy "Admin can manage suggestions"
  on public.suggestions for update
  using (exists(select 1 from public.users where id = auth.uid() and role = 'admin'));

create policy "Auth users can shout out"
  on public.shout_outs for insert
  with check (auth.uid() is not null);

create policy "Shout outs are viewable"
  on public.shout_outs for select
  using (true);

create policy "Users can remove own shout outs"
  on public.shout_outs for delete
  using (user_id = auth.uid());
