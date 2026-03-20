-- @TASK P5-R1-T1 - app_settings table
-- @SPEC docs/planning/02-trd.md#app-settings

create table public.app_settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now() not null
);

alter table public.app_settings enable row level security;

create policy "Admin can read settings"
  on public.app_settings for select
  using (exists(select 1 from public.users where id = auth.uid() and role = 'admin'));

create policy "Admin can update settings"
  on public.app_settings for update
  using (exists(select 1 from public.users where id = auth.uid() and role = 'admin'));

create policy "Admin can insert settings"
  on public.app_settings for insert
  with check (exists(select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Initial settings data
insert into public.app_settings (key, value) values
  ('gate_location', '"result"'::jsonb),
  ('question_distribution', '"weekly"'::jsonb);
