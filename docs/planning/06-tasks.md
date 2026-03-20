# TASKS.md — Workside

> Generated: 2026-03-16
> Pipeline: /screen-spec -> /tasks-generator -> /auto-orchestrate
> Mode: Domain-Guarded (ICV 100% Pass)
> Tech Stack: Next.js (App Router) + TypeScript + Supabase + Recharts + Tailwind CSS + Vercel

---

## Phase 0: Project Setup

### P0-T0.1: Next.js + TypeScript + Tailwind CSS 초기화
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: []
- **spec**:
  - `npx create-next-app@latest` (App Router, TypeScript, Tailwind CSS, ESLint)
  - tsconfig.json path alias 설정 (`@/`)
  - Tailwind 테마 커스터마이즈 (design-system.md 참조)
- **tests**: `npm run build` 성공
- **status**: pending

### P0-T0.2: Supabase 프로젝트 설정
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P0-T0.1]
- **spec**:
  - `@supabase/supabase-js` 설치
  - `lib/supabase/client.ts` (브라우저용), `lib/supabase/server.ts` (서버용) 생성
  - `.env.local` 환경변수 설정 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- **tests**: Supabase 클라이언트 연결 확인
- **status**: pending

### P0-T0.3: 공통 의존성 설치
- **agent**: backend-specialist
- **priority**: high
- **depends_on**: [P0-T0.1]
- **spec**:
  - `recharts` (차트), `lucide-react` (아이콘), `zod` (검증)
  - `clsx`, `tailwind-merge` (유틸)
- **tests**: import 확인
- **status**: pending

### P0-T0.4: 프로젝트 폴더 구조 설정
- **agent**: backend-specialist
- **priority**: high
- **depends_on**: [P0-T0.1]
- **spec**:
  - ```
    src/
      app/           # App Router pages
      components/    # 공통 UI 컴포넌트
      lib/           # 유틸, Supabase, 타입
      hooks/         # 커스텀 훅
      constants/     # 상수, 진단 문항 데이터
    supabase/
      migrations/    # SQL 마이그레이션
    ```
  - ESLint + Prettier 설정 (coding-convention.md 참조)
- **tests**: 폴더 구조 확인, lint 통과
- **status**: pending

---

## Phase 1: Auth & Common Layout

### P1-R1-T1: users 테이블 마이그레이션 + Supabase Auth
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P0-T0.2]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `supabase/migrations/001_users.sql`
  - users 테이블: id, email, nickname, password_hash, industry, company_size, role, created_at, updated_at
  - Supabase Auth 트리거 (auth.users -> public.users 자동 동기화)
  - RLS 정책: 본인 데이터만 읽기/수정, admin은 전체 읽기
- **resources**: users
- **tests**: 마이그레이션 적용, RLS 정책 검증
- **status**: pending

### P1-R1-T2: Auth API (signUp, signIn, signOut, getSession)
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P1-R1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `lib/supabase/auth.ts`: signUp(email, password, nickname, industry?, companySize?), signIn, signOut, getSession
  - 이메일 중복 확인 API: `app/api/auth/check-email/route.ts`
  - 닉네임 중복 확인 API: `app/api/auth/check-nickname/route.ts`
  - Zod 검증: email format, nickname 2~20자, password 8자+
- **resources**: users
- **tests**: signUp/signIn/signOut 플로우, 중복 체크, 검증 실패 케이스
- **status**: pending

### P1-R1-T3: Auth 보호 라우트 + 역할 기반 접근 제어
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P1-R1-T2]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `middleware.ts`: 보호 라우트 매칭 (/my-dna, /suggest, /admin/*)
  - `lib/auth/requireAuth.ts`: 서버 컴포넌트용 인증 헬퍼
  - `lib/auth/requireAdmin.ts`: admin 역할 검증
  - 미인증 시 /signup 리다이렉트, 권한 없음 시 403
- **resources**: users
- **tests**: 보호 라우트 접근 테스트, 역할별 접근 제어
- **status**: pending

### P1-S0-T1: Header / Footer 공통 컴포넌트
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P1-R1-T2]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `components/Header.tsx`: 로고, 인증 버튼(비로그인) / 사용자 메뉴(로그인), 반응형 버거 메뉴
  - `components/Footer.tsx`: 3-column 링크, 소셜, 저작권
  - Props: showAuthButtons, activeRoute (specs/shared/components.yaml 참조)
- **shared_components**: Header, Footer
- **tests**: 렌더링, 인증 상태별 UI 변경, 반응형
- **status**: pending

### P1-S0-T2: AdminMenu 사이드바 + 레이아웃
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P1-S0-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `components/AdminMenu.tsx`: Dashboard, Questions, Users, Settings 메뉴 항목
  - `components/layouts/SidebarLayout.tsx`: 좌측 사이드바(250px, collapsible) + 메인 콘텐츠
  - `components/layouts/FullWidthLayout.tsx`: 전체 너비 레이아웃
- **shared_components**: AdminMenu, SidebarLayout, FullWidthLayout
- **tests**: 렌더링, 활성 라우트 하이라이트, 반응형 collapse
- **status**: pending

### P1-S0-T3: 공통 UI 컴포넌트 라이브러리
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P0-T0.3]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `components/ui/Button.tsx`: primary, secondary, danger variants
  - `components/ui/InputField.tsx`: text, email, password, search + validation + error
  - `components/ui/Modal.tsx`: title, content, actions
  - `components/ui/Toast.tsx`: success, error, warning, info + auto-dismiss
  - `components/ui/LoadingSpinner.tsx`: small, medium, large
  - `components/ui/SkeletonLoader.tsx`: card, list, grid, chart variants
  - `components/ui/PersonaBadge.tsx`: 페르소나 라벨 배지
  - `components/ui/StatCard.tsx`: title, value, trend 표시
- **shared_components**: InputField, Modal, Toast, LoadingSpinner, SkeletonLoader, PersonaBadge, StatCard
- **tests**: 각 컴포넌트 렌더링 + props 변형 테스트
- **status**: pending

---

## Phase 2: DNA Core

### P2-R1-T1: dna_sessions 테이블 마이그레이션 + CRUD API
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P1-R1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `supabase/migrations/002_dna_sessions.sql`
  - dna_sessions: id, user_id(nullable), version(semi/full), status(in_progress/completed), share_token, created_at, completed_at
  - RLS: 본인 세션만 접근, 비회원은 share_token으로 조회
  - API: `app/api/dna/sessions/route.ts` (POST: 세션 생성, GET: 세션 조회)
- **resources**: dna_sessions
- **tests**: 세션 CRUD, 비회원 세션 생성, RLS 검증
- **status**: pending

### P2-R1-T2: dna_responses 테이블 마이그레이션 + CRUD API
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P2-R1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `supabase/migrations/003_dna_responses.sql`
  - dna_responses: id, session_id(FK), question_id, value(1~7), created_at
  - API: `app/api/dna/responses/route.ts` (POST: 응답 저장, GET: 세션별 응답 조회)
  - 세션당 중복 question_id 방지 (UNIQUE constraint)
- **resources**: dna_responses
- **tests**: 응답 CRUD, 중복 방지, FK 제약
- **status**: pending

### P2-R2-T1: dna_results 테이블 마이그레이션 + CRUD API
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P2-R1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `supabase/migrations/004_dna_results.sql`
  - dna_results: id, session_id(FK), user_id(nullable), p/c/pol/s_score, persona_label, persona_description, version, share_token(unique), created_at
  - RLS: share_token으로 공개 조회, user_id로 본인 이력 조회
  - API: `app/api/dna/results/route.ts` (GET: 결과 조회), `app/api/dna/results/[shareToken]/route.ts` (공유 조회)
- **resources**: dna_results
- **tests**: 결과 CRUD, 공유 토큰 조회, RLS
- **status**: pending

### P2-R2-T2: DNA 점수 계산 엔진
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P2-R1-T2, P2-R2-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `lib/dna/scoring.ts`: calculateDNAScores(responses) -> { p_score, c_score, pol_score, s_score }
  - 세미(12문항) / 풀(40문항) 별 가중치 적용
  - 점수 정규화 (0~100 범위)
  - `constants/dna-questions.ts`: 진단 문항 데이터 (질문, 축 매핑, 가중치)
- **resources**: dna_responses, dna_results
- **tests**: 세미/풀 버전 점수 계산, 경계값, 정규화 검증
- **status**: pending

### P2-R2-T3: 페르소나 판별 로직
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P2-R2-T2]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `lib/dna/persona.ts`: determinePersona(scores) -> { label, description }
  - 6개 페르소나: 전략적 성과자, 실무형 전문가, 협력적 조정자, 자율형 독립가, 조직형 정치인, 중도형 균형가
  - 4축 점수 조합 기반 판별 알고리즘
  - `constants/personas.ts`: 페르소나 정의 데이터 (라벨, 설명, 특성, 유사 유형, 추천)
- **resources**: dna_results
- **tests**: 각 페르소나 판별 케이스, 경계 조건
- **status**: pending

### P2-R2-T4: share_token 생성 + OG 이미지 API
- **agent**: backend-specialist
- **priority**: high
- **depends_on**: [P2-R2-T3]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `lib/dna/share.ts`: generateShareToken() -> UUID 기반 토큰
  - `app/api/og/route.tsx`: OG 이미지 동적 생성 (Next.js ImageResponse)
    - 페르소나 라벨 + 4축 점수 시각화
    - 1200x630px, SNS 공유 최적화
  - 진단 완료 시 자동 share_token 할당
- **resources**: dna_results
- **tests**: 토큰 생성, OG 이미지 렌더링, SNS 메타태그
- **status**: pending

### P2-S1-T1: 랜딩 페이지 UI
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P1-S0-T1, P1-S0-T3]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-1 (landing.yaml)
- **spec**:
  - `app/page.tsx`: 랜딩 페이지
  - HeroSection: 서비스 가치 제안 + "[진단 시작]" CTA -> /diagnosis
  - FeatureCards: 세미 진단, 공유/비교, 정기 질문 참여 소개 (3개)
  - TestimonialCarousel: 사용자 피드백 카드 3~4개
  - CTASection: 최종 CTA 버튼
  - 스크롤 애니메이션 (IntersectionObserver)
- **data_requirements**: 없음 (정적)
- **tests**: 렌더링, CTA 클릭 -> /diagnosis 네비게이션, 반응형
- **status**: pending

### P2-S2-T1: DNA 진단 - 버전 선택 + 문항 UI
- **agent**: frontend-specialist
- **priority**: critical
- **depends_on**: [P2-R1-T1, P2-R1-T2, P1-S0-T3]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-3 (diagnosis.yaml)
- **spec**:
  - `app/diagnosis/page.tsx`
  - VersionSelector: 세미(12문항, 3분) / 풀(40문항, 10분) 카드 선택
  - QuestionCard: 문항 텍스트 렌더링
  - LikertScale: 7점 척도 입력 (모바일: 슬라이더, 데스크톱: 라디오)
  - 선택 시 세션 생성 (POST /api/dna/sessions)
- **data_requirements**: dna_sessions(id, version, status), dna_responses(id, session_id, question_id, value)
- **tests**: 버전 선택, 문항 렌더링, LikertScale 입력
- **status**: pending

### P2-S2-T2: DNA 진단 - 진행률 + 네비게이션 + 완료
- **agent**: frontend-specialist
- **priority**: critical
- **depends_on**: [P2-S2-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-3 (diagnosis.yaml)
- **spec**:
  - ProgressBar: 진행률 표시 (5/12 등)
  - NavigationButtons: [이전] [다음] 버튼
  - 응답 저장 (POST /api/dna/responses) -> 다음 문항
  - 마지막 문항 완료 시: session.status = completed -> /result/:sessionId 리다이렉트
  - LoadingState: "결과 계산 중..." 표시
- **data_requirements**: dna_sessions, dna_responses
- **tests**: 진행률 업데이트, 이전/다음 네비게이션, 완료 리다이렉트
- **status**: pending

### P2-S3-T1: DNA 결과 - RadarChart + 점수 + PersonaBadge
- **agent**: frontend-specialist
- **priority**: critical
- **depends_on**: [P2-R2-T3, P1-S0-T3]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-4 (result.yaml)
- **spec**:
  - `app/result/[sessionId]/page.tsx`
  - RadarChart (Recharts): 4축 시각화 (반응형: mobile 200px, desktop 400px)
  - ScoreDisplay: "P: 72 | C: 45 | Pol: 38 | S: 61" 텍스트
  - PersonaBadge: 페르소나 라벨 배지
  - DescriptionSection: 페르소나 설명 + 축별 해석
  - ReferencePersonas: 비슷한 유형 3~4개 (선택)
  - 데이터 조회: GET /api/dna/results?sessionId=
- **data_requirements**: dna_results(id, session_id, scores, persona_label, persona_description, share_token, version), dna_sessions(id, version, status)
- **tests**: 차트 렌더링, 점수 표시, 페르소나 매칭
- **status**: pending

### P2-S3-T2: DNA 결과 - 공유 + 업그레이드 CTA
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P2-S3-T1, P2-R2-T4]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-4 (result.yaml)
- **spec**:
  - ShareButtons: Twitter, Facebook, Kakao, LinkCopy (share_token 기반 URL)
  - CopyLinkButton: 클립보드 복사 + Toast 알림
  - SaveResultButton: 비회원 -> /signup 유도
  - UpgradeSection: 세미 진단 시 풀 버전 업그레이드 CTA -> /diagnosis
  - OG 메타태그: `/api/og?token=` 동적 이미지
- **data_requirements**: dna_results(share_token)
- **tests**: 공유 링크 생성, 클립보드 복사, 업그레이드 조건부 표시
- **status**: pending

### P2-S4-T1: 공유 수신 페이지 UI
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P2-S3-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-2 (share-receiver.yaml)
- **spec**:
  - `app/share/[shareId]/page.tsx`
  - SharedResultCard: 공유자의 DNA 결과 (RadarChart + 점수 + 페르소나)
  - CTASection: "나는 어떨까?" -> /diagnosis
  - SignupSuggestion: 가입 유도 (선택)
  - 에러 처리: 잘못된 토큰 -> "유효하지 않은 공유 링크" + 랜딩 CTA
  - 데이터 조회: GET /api/dna/results/:shareToken
- **data_requirements**: dna_results(id, p/c/pol/s_score, persona_label, persona_description, share_token)
- **tests**: 유효 토큰 렌더링, 잘못된 토큰 에러, CTA 네비게이션
- **status**: pending

### P2-S5-T1: 가입 플로우 - Step 1/2 폼 UI
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P1-R1-T2, P1-S0-T3]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-5 (signup.yaml)
- **spec**:
  - `app/signup/page.tsx`
  - ProgressIndicator: Step 1/2 표시
  - Step 1: EmailInput(중복 확인 blur), NicknameInput(2~20자), PasswordInput(강도 표시기), PasswordConfirmInput
  - Step 2: IndustrySelector(드롭다운, 선택적), CompanySizeSelector(카드형, 선택적)
  - 실시간 검증: Zod + 비동기 중복 확인
- **data_requirements**: users(id, email, nickname, industry, company_size)
- **tests**: 폼 검증, 이메일 중복 확인, 비밀번호 강도 표시
- **status**: pending

### P2-S5-T2: 가입 플로우 - Supabase Auth 연동 + 리다이렉트
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P2-S5-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-5 (signup.yaml)
- **spec**:
  - SubmitButton: Supabase auth.signUp() 호출
  - 비회원 DNA 결과 연결: 가입 시 pending dna_results.user_id 업데이트
  - CompletionMessage: "가입되었습니다!" 확인
  - NextActionButton: /feed 자동 리다이렉트
  - 에러 처리: 네트워크, 중복 이메일 등
- **data_requirements**: users
- **tests**: 가입 플로우 E2E, 에러 처리, DNA 결과 연결
- **status**: pending

### P2-S2-V: DNA 진단 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P2-S2-T2, P2-R1-T2]
- **spec**:
  - 진단 시작 -> dna_sessions 생성 검증
  - 문항 응답 -> dna_responses 저장 검증
  - 진단 완료 -> session.status 업데이트 + 점수 계산 트리거 검증
  - /result/:sessionId 리다이렉트 검증
- **tests**: 통합 테스트 (프론트 -> API -> DB)
- **status**: pending

### P2-S3-V: DNA 결과 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P2-S3-T2, P2-R2-T4]
- **spec**:
  - 결과 페이지 로드 -> dna_results 조회 검증
  - 공유 링크 생성 -> share_token 기반 URL 검증
  - OG 이미지 메타태그 검증
  - 업그레이드 CTA (세미 -> 풀) 조건 검증
- **tests**: 통합 테스트
- **status**: pending

### P2-S4-V: 공유 수신 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P2-S4-T1]
- **spec**:
  - /share/:shareId -> dna_results 조회 (share_token 매칭)
  - 잘못된 토큰 에러 처리
  - CTA -> /diagnosis 네비게이션
- **tests**: 통합 테스트
- **status**: pending

### P2-S5-V: 가입 플로우 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P2-S5-T2]
- **spec**:
  - 가입 폼 -> Supabase Auth 연동 검증
  - 비회원 DNA 결과 user_id 연결 검증
  - /feed 리다이렉트 검증
- **tests**: 통합 테스트
- **status**: pending

### P2-S1-V: 랜딩 페이지 연결점 검증
- **agent**: test-specialist
- **priority**: medium
- **depends_on**: [P2-S1-T1]
- **spec**:
  - CTA 버튼 -> /diagnosis 네비게이션 검증
  - Header 인증 상태별 UI 검증
  - 반응형 레이아웃 검증
- **tests**: 통합 테스트
- **status**: pending

---

## Phase 3: Question & Feed

### P3-R1-T1: questions 테이블 마이그레이션
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P1-R1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `supabase/migrations/005_questions.sql`
  - questions: id, title, description, type(simple/survey), status(draft/active/closed), is_featured, options(jsonb), created_by(FK users), suggestion_id(FK nullable), deadline, participant_count, created_at
  - RLS: active 질문은 공개, draft/closed는 admin만
- **resources**: questions
- **tests**: 마이그레이션, RLS, FK 제약
- **status**: pending

### P3-R1-T2: Questions CRUD + 응답 집계 API
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P3-R1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `app/api/questions/route.ts`: GET (필터: status, is_featured, 페이지네이션), POST (admin)
  - `app/api/questions/[id]/route.ts`: GET, PATCH (admin), DELETE (admin)
  - `app/api/questions/[id]/aggregate/route.ts`: GET (선택지별 집계, 페르소나별 분포)
  - participant_count 자동 증가 트리거
- **resources**: questions
- **tests**: CRUD, 필터링, 집계, 권한 검증
- **status**: pending

### P3-R2-T1: question_responses 테이블 마이그레이션 + API
- **agent**: backend-specialist
- **priority**: critical
- **depends_on**: [P3-R1-T1, P1-R1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `supabase/migrations/006_question_responses.sql`
  - question_responses: id, question_id(FK), user_id(FK nullable), selected_option, persona_label(nullable), created_at
  - UNIQUE constraint: (question_id, user_id) - 질문당 1회 응답
  - `app/api/questions/[id]/responses/route.ts`: POST (응답 제출), GET (본인 응답 조회)
  - 비회원 응답 허용 (user_id: null)
- **resources**: question_responses
- **tests**: 응답 CRUD, 중복 방지, 비회원 응답
- **status**: pending

### P3-R2-T2: suggestions + shout_outs 테이블 마이그레이션 + API
- **agent**: backend-specialist
- **priority**: high
- **depends_on**: [P1-R1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `supabase/migrations/007_suggestions.sql`
  - suggestions: id, user_id(FK), title, background, status(pending/approved/rejected), shout_out_count, created_at
  - shout_outs: id, suggestion_id(FK), user_id(FK), created_at + UNIQUE(suggestion_id, user_id)
  - `app/api/suggestions/route.ts`: GET (필터: status, 페이지네이션), POST (인증 필수)
  - `app/api/suggestions/[id]/route.ts`: PATCH (admin: 채택/반려)
  - `app/api/suggestions/[id]/shout-out/route.ts`: POST (Shout out 추가), DELETE (취소)
  - shout_out_count 자동 업데이트 트리거
- **resources**: suggestions, shout_outs
- **tests**: CRUD, Shout out 토글, 관리자 채택/반려
- **status**: pending

### P3-R3-T1: participation_history 테이블 마이그레이션 + API
- **agent**: backend-specialist
- **priority**: high
- **depends_on**: [P1-R1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `supabase/migrations/008_participation_history.sql`
  - participation_history: id, user_id(FK), action_type(diagnosis/question/suggestion/share/shout_out), target_id, created_at
  - `app/api/participation/route.ts`: POST (이력 기록), GET (본인 이력 조회)
  - 진단 완료, 질문 응답, 제안 제출, 공유 클릭, Shout out 시 자동 기록
- **resources**: participation_history
- **tests**: 이력 기록, 조회, 통계 집계
- **status**: pending

### P3-S1-T1: 피드 - FilterTabs + QuestionCard 리스트
- **agent**: frontend-specialist
- **priority**: critical
- **depends_on**: [P3-R1-T2, P3-R2-T1, P1-S0-T3]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-7 (feed.yaml)
- **spec**:
  - `app/feed/page.tsx`
  - FilterTabs: [전체] [진행중] [마감] [내 참여]
  - FeaturedQuestionCard: is_featured=true 상단 고정 (배경 강조)
  - QuestionCard 리스트: 제목, 상태 배지, 마감일, 참여도, 참여 상태(완료됨/참여하기)
  - 무한 스크롤 또는 페이지네이션 (limit: 10)
  - 데이터: GET /api/questions + GET /api/questions/[id]/responses (본인 응답 확인)
- **data_requirements**: questions, question_responses
- **tests**: 필터링, 무한 스크롤, 참여 상태 배지
- **status**: pending

### P3-S1-T2: 피드 - SuggestionCard + ShoutOut + FAB
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P3-S1-T1, P3-R2-T2]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-7 (feed.yaml)
- **spec**:
  - SuggestionCard 섹션: 제안 카드 (제목, 제안자, Shout out 수)
  - ShoutOutButton: 하트 아이콘 토글 (POST/DELETE /api/suggestions/[id]/shout-out)
  - FloatingActionButton: "[새로운 질문 제안]" -> /suggest (인증 필요)
  - 데이터: GET /api/suggestions?status=approved
- **data_requirements**: suggestions, shout_outs (via API)
- **tests**: Shout out 토글, FAB 네비게이션, 비인증 시 가입 유도
- **status**: pending

### P3-S2-T1: 질문 참여 - 질문 상세 + 옵션 선택 + 제출
- **agent**: frontend-specialist
- **priority**: critical
- **depends_on**: [P3-R1-T2, P3-R2-T1, P1-S0-T3]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-8 (question.yaml)
- **spec**:
  - `app/question/[questionId]/page.tsx`
  - QuestionHeader: 제목, 설명, 상태 배지, 남은 시간
  - ParticipantCount: "456명 참여" 표시
  - OptionSelector: 라디오/카드 선택형 옵션 (questions.options 기반)
  - GuestWarningBanner: 비회원 -> "결과를 보려면 가입하세요"
  - SubmitButton: POST /api/questions/[id]/responses
  - ConfirmationMessage: "응답이 저장되었습니다" + "[결과 보기]" 링크
  - NavigationButtons: [이전 질문] [다음 질문]
- **data_requirements**: questions(id, title, description, type, status, options, participant_count, deadline), question_responses(본인 응답)
- **tests**: 옵션 선택, 제출, 중복 응답 방지, 비회원 경고
- **status**: pending

### P3-S3-T1: 세부 결과 - 결과 집계 + BarChart
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P3-R1-T2, P1-S0-T3]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-9 (question-result.yaml)
- **spec**:
  - `app/question/[questionId]/result/page.tsx`
  - QuestionSummary: 질문 제목, 마감 상태, 총 참여자 수
  - MyResponseBadge: 현재 사용자의 응답 표시 (회원)
  - ResultsBarChart (Recharts): 선택지별 비율(%), n 표시
  - ResultRow: 개별 선택지 결과 (Option 1: 48%, n=456)
  - 데이터: GET /api/questions/[id]/aggregate
- **data_requirements**: questions, question_responses
- **tests**: 집계 데이터 렌더링, 바 차트, 비회원 제한
- **status**: pending

### P3-S3-T2: 세부 결과 - 페르소나별 분포 + 소수 의견
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P3-S3-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-9 (question-result.yaml)
- **spec**:
  - TypeDistributionChart: 페르소나별 응답 분포 (가로 막대, 회원만)
  - MinorityViewCard: 소수 의견 패턴 3~4개 강조
  - InsightText: "자율형 독립가 중 45%가 Option 3을 선택했어요"
  - ShareSection: [SNS 공유] [링크 복사]
  - NavigationButtons: [이전 질문 결과] [다음 질문 결과] [피드로]
- **data_requirements**: question_responses(persona_label), dna_results(persona_label)
- **tests**: 페르소나 분포 차트, 소수 의견 로직, 공유
- **status**: pending

### P3-S4-T1: 질문 제안 폼 UI
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P3-R2-T2, P1-S0-T3]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-10 (suggest.yaml)
- **spec**:
  - `app/suggest/page.tsx` (인증 필수)
  - InfoSection: "좋은 제안을 환영합니다" 안내
  - TitleInput: 제안 제목 (500자) + CharacterCounter
  - BackgroundTextarea: 배경 설명 (1000자 권장) + CharacterCounter
  - PublicDiscussionCheckbox: "이 주제를 공개 논의해도 됩니다"
  - ResetButton / SubmitButton: POST /api/suggestions (status: pending)
  - SuccessMessage: "제안이 접수되었습니다!" + [피드로 돌아가기] [다른 제안]
  - RecentSuggestions: 최근 승인된 제안 5개 표시
- **data_requirements**: suggestions(id, user_id, title, background, status, shout_out_count, created_at)
- **tests**: 폼 검증, 자수 카운트, 제출, 최근 제안 표시
- **status**: pending

### P3-S1-V: 피드 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P3-S1-T2]
- **spec**:
  - 피드 로드 -> questions(active) + suggestions(approved) 조회 검증
  - 필터 탭 전환 -> API 재호출 검증
  - Shout out -> shout_outs 생성 + suggestion.shout_out_count 증가 검증
  - FAB -> /suggest 네비게이션 (인증 체크)
- **tests**: 통합 테스트
- **status**: pending

### P3-S2-V: 질문 참여 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P3-S2-T1]
- **spec**:
  - 질문 로드 -> questions 조회 검증
  - 응답 제출 -> question_responses 생성 + participant_count 증가 검증
  - 중복 응답 방지 검증
  - 비회원 응답 + 가입 게이트 검증
- **tests**: 통합 테스트
- **status**: pending

### P3-S3-V: 세부 결과 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P3-S3-T2]
- **spec**:
  - 결과 집계 -> question_responses 조인 검증
  - 페르소나별 분포 -> dna_results 조인 검증
  - 소수 의견 패턴 도출 로직 검증
- **tests**: 통합 테스트
- **status**: pending

### P3-S4-V: 질문 제안 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P3-S4-T1]
- **spec**:
  - 제안 제출 -> suggestions 생성 (status: pending) 검증
  - 인증 필수 검증
  - 최근 제안 목록 -> suggestions(approved) 조회 검증
- **tests**: 통합 테스트
- **status**: pending

---

## Phase 4: Profile

### P4-S1-T1: 내 DNA - 프로필 + RadarChart + DNA 이력
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P2-S3-T1, P3-R3-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-6 (my-dna.yaml)
- **spec**:
  - `app/my-dna/page.tsx` (인증 필수)
  - ProfileSection: 닉네임, 이메일, 산업/규모 태그
  - LatestDNACard: 최근 진단 결과 (RadarChart small + 점수 + 날짜) -> /result/:sessionId 클릭
  - DNAHistoryList: 전체 진단 이력 (버전, 날짜, 결과 보기 링크, 페이지네이션 limit:5)
  - ActionButtons: [프로필 수정] [결과 공유] [로그아웃]
  - 데이터: users(current), dna_results(user_id=current, 최신순)
- **data_requirements**: users, dna_results
- **tests**: 프로필 표시, 최근 결과 차트, 이력 페이지네이션
- **status**: pending

### P4-S1-T2: 내 DNA - 참여 통계 + 제안 이력
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P4-S1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: S-6 (my-dna.yaml)
- **spec**:
  - StatsSection: 참여 통계 (질문 X개, 공유 Y회, 가입일)
  - SuggestionsSection: 내 제안 이력 (승인/검토중 카운트) -> /suggest 클릭
  - 데이터: participation_history(user_id=current), suggestions(user_id=current)
- **data_requirements**: participation_history, suggestions
- **tests**: 통계 계산, 제안 이력 표시
- **status**: pending

### P4-S1-V: 내 DNA 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P4-S1-T2]
- **spec**:
  - 프로필 -> users 조회 검증
  - DNA 이력 -> dna_results(user_id) 조회 검증
  - 참여 통계 -> participation_history 집계 검증
  - 제안 이력 -> suggestions(user_id) 조회 검증
  - /result/:sessionId 네비게이션 검증
- **tests**: 통합 테스트
- **status**: pending

---

## Phase 5: Admin

### P5-R1-T1: app_settings 테이블 마이그레이션 + CRUD API
- **agent**: backend-specialist
- **priority**: high
- **depends_on**: [P1-R1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **spec**:
  - `supabase/migrations/009_app_settings.sql`
  - app_settings: id, key(unique), value(jsonb), updated_at
  - 초기 데이터: gate_location, question_distribution 등
  - RLS: admin만 읽기/쓰기
  - `app/api/admin/settings/route.ts`: GET (전체 설정), PATCH (설정 업데이트)
- **resources**: app_settings
- **tests**: CRUD, 권한 검증, 초기 데이터
- **status**: pending

### P5-S1-T1: 관리자 대시보드 - StatCards + 차트
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P5-R1-T1, P3-R3-T1, P1-S0-T2]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: A-1 (admin-dashboard.yaml)
- **spec**:
  - `app/admin/page.tsx` (admin 역할 필수)
  - StatCards (4개): DNA 진단 완료, 질문 참여, 공유 클릭, 활성 사용자(DAU)
  - DNATrendChart (LineChart): 지난 14일 DNA 진단 추세
  - ConversionRateChart: 회원가입 전환율
  - QuestionEngagementChart (BarChart): 질문별 참여도 Top 5
  - 데이터: dna_sessions, question_responses, users, participation_history 집계
- **data_requirements**: dna_sessions, question_responses, users, participation_history
- **tests**: 지표 로드, 차트 렌더링, admin 권한 체크
- **status**: pending

### P5-S1-T2: 관리자 대시보드 - 설정 패널 + 활동 피드
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P5-S1-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: A-1 (admin-dashboard.yaml)
- **spec**:
  - SettingsPanel: 가입 게이트 위치(라디오), 질문 배포 주기(선택)
  - SaveSettingsButton: PATCH /api/admin/settings
  - ActivityFeed: 최근 활동 (새 제안, 대기중 질문, 오류 로그)
  - 데이터: app_settings, 최근 활동 (suggestions, questions 조합)
- **data_requirements**: app_settings
- **tests**: 설정 변경 + 저장, 활동 피드 표시
- **status**: pending

### P5-S2-T1: 질문 관리 - QuestionTable + 필터 + CRUD
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P3-R1-T2, P1-S0-T2]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: A-2 (admin-questions.yaml)
- **spec**:
  - `app/admin/questions/page.tsx` (admin 역할 필수)
  - FilterTabs: [모든 질문] [초안] [배포중] [마감] [제안 검토]
  - QuestionTable: ID, 제목, 상태, 참여도, 배포일 (페이지네이션)
  - QuestionActionButtons: [수정] [배포] [마감] [삭제]
  - HeaderButton: "[새 질문 추가]"
  - 데이터: GET /api/questions (admin 전체)
- **data_requirements**: questions
- **tests**: 필터링, 상태 변경, 삭제
- **status**: pending

### P5-S2-T2: 질문 관리 - 질문 생성 모달 + 제안 검토
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P5-S2-T1, P3-R2-T2]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: A-2 (admin-questions.yaml)
- **spec**:
  - CreateQuestionModal: 제목, 설명, 타입(단순/설문), 옵션 입력, 마감일 선택
  - SuggestionReviewSection: "제안 검토" 탭 - 대기중 제안 목록
  - SuggestionReviewCard: 제목, 제안자(users.nickname 조인), 배경, Shout out 수
  - ApproveButton: suggestions.status='approved' + 질문 생성 모달 자동 열기
  - RejectButton: suggestions.status='rejected'
  - 데이터: POST /api/questions, PATCH /api/suggestions/[id]
- **data_requirements**: questions, suggestions, users(nickname)
- **tests**: 질문 생성, 제안 채택/반려, 채택 -> 질문 변환
- **status**: pending

### P5-S3-T1: 사용자 관리 - 통계 + 인구통계 차트
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P3-R3-T1, P1-S0-T2]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: A-3 (admin-users.yaml)
- **spec**:
  - `app/admin/users/page.tsx` (admin 역할 필수)
  - UserStatCards (4개): 총 가입자, 활성 사용자(30일), 재참여율, 평균 세션
  - DemographicCharts: 산업군별 분포 (PieChart), 회사 규모별 분포 (BarChart horizontal)
  - 데이터: users 집계, participation_history 집계
- **data_requirements**: users, participation_history
- **tests**: 통계 카드, 차트 렌더링
- **status**: pending

### P5-S3-T2: 사용자 관리 - UserTable + 코호트 분석
- **agent**: frontend-specialist
- **priority**: high
- **depends_on**: [P5-S3-T1]
- **tdd**: RED -> GREEN -> REFACTOR
- **screen**: A-3 (admin-users.yaml)
- **spec**:
  - SearchBar: 이메일/닉네임 검색 (실시간)
  - FilterSection: [산업군] [회사규모] [활성상태] 필터
  - UserTable: ID, 닉네임, 이메일, 가입일, 산업, 진단 수, 참여 수 (페이지네이션)
  - UserActionButtons: [상세] [강제 로그아웃]
  - CohortAnalysisChart: 가입 주차별 재참여율 (LineChart)
  - ExportButton: CSV 내보내기 (선택)
  - 데이터: users + dna_sessions + question_responses 조인
- **data_requirements**: users, dna_sessions, question_responses, participation_history
- **tests**: 검색, 필터, 코호트 차트, 페이지네이션
- **status**: pending

### P5-S1-V: 관리자 대시보드 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P5-S1-T2]
- **spec**:
  - 지표 로드 -> 각 리소스 집계 검증
  - 설정 변경 -> app_settings 업데이트 검증
  - admin 권한 체크 -> 비관리자 접근 차단 검증
- **tests**: 통합 테스트
- **status**: pending

### P5-S2-V: 질문 관리 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P5-S2-T2]
- **spec**:
  - 질문 CRUD -> questions 테이블 검증
  - 제안 채택 -> suggestions.status + questions 생성 검증
  - 상태 변경 (draft -> active -> closed) 플로우 검증
- **tests**: 통합 테스트
- **status**: pending

### P5-S3-V: 사용자 관리 연결점 검증
- **agent**: test-specialist
- **priority**: high
- **depends_on**: [P5-S3-T2]
- **spec**:
  - 사용자 통계 -> 집계 쿼리 검증
  - 검색/필터 -> 쿼리 파라미터 검증
  - 코호트 분석 -> 주차별 재참여율 계산 검증
- **tests**: 통합 테스트
- **status**: pending

---

## Dependency Graph (Parallel Execution)

```
P0-T0.1 ─┬─ P0-T0.2 ── P1-R1-T1 ─┬─ P1-R1-T2 ── P1-R1-T3
          ├─ P0-T0.3              │                │
          └─ P0-T0.4              │                ├─ P1-S0-T1 ── P1-S0-T2
                                  │                │
                                  ├─ P2-R1-T1 ─┬─ P2-R1-T2 ──┐
                                  │             └─ P2-R2-T1   │
                                  │                            ├─ P2-R2-T2 ── P2-R2-T3 ── P2-R2-T4
                                  │                            │
                                  ├─ P3-R1-T1 ── P3-R1-T2     │
                                  ├─ P3-R2-T2                  │
                                  ├─ P3-R3-T1                  │
                                  └─ P5-R1-T1                  │
                                                               │
P0-T0.3 ── P1-S0-T3 ─────────────────────────────────────────┘
                                                    │
              ┌────────── Frontend Screens ─────────┤
              │                                     │
              ├─ P2-S1-T1 ── P2-S1-V               │
              ├─ P2-S2-T1 ── P2-S2-T2 ── P2-S2-V   │
              ├─ P2-S3-T1 ── P2-S3-T2 ── P2-S3-V   │
              ├─ P2-S4-T1 ── P2-S4-V               │
              ├─ P2-S5-T1 ── P2-S5-T2 ── P2-S5-V   │
              ├─ P3-S1-T1 ── P3-S1-T2 ── P3-S1-V   │
              ├─ P3-S2-T1 ── P3-S2-V               │
              ├─ P3-S3-T1 ── P3-S3-T2 ── P3-S3-V   │
              ├─ P3-S4-T1 ── P3-S4-V               │
              ├─ P4-S1-T1 ── P4-S1-T2 ── P4-S1-V   │
              ├─ P5-S1-T1 ── P5-S1-T2 ── P5-S1-V   │
              ├─ P5-S2-T1 ── P5-S2-T2 ── P5-S2-V   │
              └─ P5-S3-T1 ── P5-S3-T2 ── P5-S3-V   │
```

### Parallel Groups (같은 Phase 내 병렬 실행 가능)

| Group | Tasks | 조건 |
|-------|-------|------|
| P0-parallel | P0-T0.2, P0-T0.3, P0-T0.4 | P0-T0.1 완료 후 |
| P1-R-parallel | (순차) | Auth는 순차 |
| P1-S-parallel | P1-S0-T1, P1-S0-T3 | P0 완료 후 |
| P2-R-parallel | P2-R1-T1, P2-R2-T1 | P1-R1-T1 완료 후 |
| P3-R-parallel | P3-R1-T1, P3-R2-T2, P3-R3-T1 | P1-R1-T1 완료 후 |
| P2-S-parallel | P2-S1-T1, P2-S4-T1, P2-S5-T1 | 해당 Resource 완료 후 |
| P3-S-parallel | P3-S1-T1, P3-S2-T1, P3-S4-T1 | 해당 Resource 완료 후 |
| P5-S-parallel | P5-S1-T1, P5-S2-T1, P5-S3-T1 | 해당 Resource 완료 후 |

---

## Summary

| Phase | Description | Backend | Frontend | Verification | Total |
|-------|-------------|---------|----------|--------------|-------|
| P0 | Project Setup | 4 | - | - | 4 |
| P1 | Auth & Common | 3 | 3 | - | 6 |
| P2 | DNA Core | 6 | 8 | 5 | 19 |
| P3 | Question & Feed | 5 | 6 | 4 | 15 |
| P4 | Profile | - | 2 | 1 | 3 |
| P5 | Admin | 1 | 6 | 3 | 10 |
| **Total** | | **19** | **25** | **13** | **57** |
