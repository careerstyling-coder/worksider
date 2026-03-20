-- @TASK P1-R1-T1 - users 테이블 마이그레이션
-- @SPEC docs/planning/02-trd.md#users-table

-- users 테이블
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  nickname text unique not null,
  password_hash text,
  industry text,
  company_size text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS 활성화
alter table public.users enable row level security;

-- RLS 정책
-- 모든 인증된 사용자가 users 테이블을 읽을 수 있음 (재귀 방지)
create policy "Authenticated users can view users" on public.users
  for select using (auth.uid() is not null);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

-- 신규 가입 시 자동으로 public.users 레코드 생성하는 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, nickname)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nickname', 'user_' || substr(new.id::text, 1, 8)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at 자동 업데이트 트리거
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_users_updated
  before update on public.users
  for each row execute procedure public.handle_updated_at();
