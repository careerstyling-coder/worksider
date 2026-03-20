-- Initial migration template
-- Uncomment and modify as needed

-- Example: profiles table linked to auth.users
-- create table public.profiles (
--   id uuid references auth.users on delete cascade not null primary key,
--   username text unique,
--   full_name text,
--   avatar_url text,
--   created_at timestamptz default now() not null,
--   updated_at timestamptz default now() not null
-- );

-- Enable Row Level Security
-- alter table public.profiles enable row level security;

-- RLS Policies
-- create policy "Public profiles are viewable by everyone."
--   on profiles for select
--   using (true);

-- create policy "Users can insert their own profile."
--   on profiles for insert
--   with check (auth.uid() = id);

-- create policy "Users can update their own profile."
--   on profiles for update
--   using (auth.uid() = id);
