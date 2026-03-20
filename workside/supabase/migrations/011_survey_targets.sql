-- 정식 설문 대상자 테이블
create table public.survey_targets (
  id uuid default gen_random_uuid() primary key,
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  notified_at timestamptz default now(),
  responded_at timestamptz,
  created_at timestamptz default now() not null,
  unique(question_id, user_id)
);

alter table public.survey_targets enable row level security;

-- 사용자는 자기에게 온 설문만 조회 가능
create policy "Users can view own targets" on public.survey_targets
  for select using (user_id = auth.uid());

-- 관리자만 생성 가능
create policy "Admin can insert targets" on public.survey_targets
  for insert with check (exists(select 1 from public.users where id = auth.uid() and role = 'admin'));

-- 사용자가 응답 시 responded_at 업데이트
create policy "Users can update own targets" on public.survey_targets
  for update using (user_id = auth.uid());
