-- 질문 유형 확대: simple(단순 질문) / formal(정식 설문)
alter table public.questions
  add column if not exists survey_type text not null default 'simple'
  check (survey_type in ('simple', 'formal'));

-- 정식 설문 대상 조건 (산업군, 회사규모, 페르소나 등)
alter table public.questions
  add column if not exists target_filter jsonb default null;

-- 궁금합니다에서 정식 설문 신청 여부
alter table public.suggestions
  add column if not exists formal_request boolean default false;

-- 단순 질문 → 정식 설문 전환 시 원본 질문 ID
alter table public.questions
  add column if not exists parent_question_id uuid references public.questions(id) default null;
