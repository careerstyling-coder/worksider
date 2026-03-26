# TASKS.md — Workside Prelaunch

> Generated: 2026-03-25
> Pipeline: neurion -> cogito -> socrates -> screen-spec -> tasks-generator
> Mode: Domain-Guarded (ICV Passed)
> Tech Stack: Next.js (TypeScript) + Supabase (PostgreSQL) + Vercel + Resend + @vercel/og

## Cogito Statement

> "나는 Workside의 첫 사용자들과 관계를 맺고 그들의 행동(등록, 공유)을 통해 서비스의 가능성을 검증하고 싶다."

## Domain Resources

| Resource | Fields Used | Coverage |
|----------|------------|----------|
| reservations | id, email, industry, experience_years, queue_position, invite_code, created_at | 70% |
| invite_tracking | invite_code, inviter_id, converted, link_clicked | 44% |
| rewards | type, status, unlocked_at | 50% |

## ICV Summary

- Screens: 5 | Resources: 3
- Unmatched fields: 0
- Computed fields: invite_success_count (from invite_tracking aggregate), required_count (constant=5)

---

## P0: Project Setup

### P0-T0.1: Next.js + Supabase + Vercel 프로젝트 초기화
- **type**: setup
- **agent**: backend-specialist
- **status**: pending
- **description**: Next.js 14 App Router 프로젝트 생성, Supabase 클라이언트 설정, Vercel 배포 연동
- **deliverables**:
  - `package.json` with dependencies
  - `supabase/` config directory
  - `.env.example` with required variables
  - Vercel project linked

### P0-T0.2: 개발 환경 및 공통 설정
- **type**: setup
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P0-T0.1]
- **description**: TailwindCSS, ESLint, Prettier 설정. 공통 타입 정의
- **deliverables**:
  - `tailwind.config.ts`
  - `types/` directory with shared types
  - ESLint + Prettier config

---

## P1: Backend Resources

> P1-R1, P1-R2, P1-R3는 서로 독립적이므로 **병렬 실행 가능**

### P1-R1-T1: Reservations 테이블 + CRUD API
- **type**: backend-resource
- **agent**: backend-specialist
- **status**: pending
- **depends_on**: [P0-T0.1]
- **resource**: reservations
- **description**: Supabase migration으로 reservations 테이블 생성. REST API 엔드포인트 구현
- **tdd**:
  - RED: 예약 생성/조회 API 테스트 작성 (실패 확인)
  - GREEN: Supabase migration + API route 구현
  - REFACTOR: 에러 핸들링 정리
- **deliverables**:
  - `supabase/migrations/001_reservations.sql`
  - `app/api/reservations/route.ts` (POST, GET)
  - `__tests__/api/reservations.test.ts`

### P1-R1-T2: Reservations 비즈니스 로직
- **type**: backend-resource
- **agent**: backend-specialist
- **status**: pending
- **depends_on**: [P1-R1-T1]
- **resource**: reservations
- **description**: 이메일 중복 체크, queue_position 자동 부여, invite_code 생성 (nanoid), ref 파라미터로 invited_by_id 연결
- **tdd**:
  - RED: 중복 이메일 거부, 순번 자동 증가, 초대코드 유니크 테스트
  - GREEN: 비즈니스 로직 구현
  - REFACTOR: 유틸리티 분리
- **deliverables**:
  - `lib/reservations.ts`
  - `__tests__/lib/reservations.test.ts`

### P1-R2-T1: Invite Tracking 테이블 + API
- **type**: backend-resource
- **agent**: backend-specialist
- **status**: pending
- **depends_on**: [P0-T0.1]
- **resource**: invite_tracking
- **description**: invite_tracking 테이블 생성. 클릭 추적 및 전환 기록 API
- **tdd**:
  - RED: 클릭 기록, 전환 기록 API 테스트
  - GREEN: Migration + API route 구현
  - REFACTOR: 정리
- **deliverables**:
  - `supabase/migrations/002_invite_tracking.sql`
  - `app/api/invite-tracking/route.ts`
  - `__tests__/api/invite-tracking.test.ts`

### P1-R2-T2: Invite Tracking 비즈니스 로직
- **type**: backend-resource
- **agent**: backend-specialist
- **status**: pending
- **depends_on**: [P1-R2-T1]
- **resource**: invite_tracking
- **description**: 링크 클릭 시 자동 추적, 예약 완료 시 converted 플래그 갱신, inviter별 성공 초대 수 집계
- **tdd**:
  - RED: 클릭 추적, 전환 기록, 집계 쿼리 테스트
  - GREEN: 비즈니스 로직 구현
  - REFACTOR: 쿼리 최적화
- **deliverables**:
  - `lib/invite-tracking.ts`
  - `__tests__/lib/invite-tracking.test.ts`

### P1-R3-T1: Rewards 테이블 + API
- **type**: backend-resource
- **agent**: backend-specialist
- **status**: pending
- **depends_on**: [P0-T0.1]
- **resource**: rewards
- **description**: rewards 테이블 생성. 리워드 조회/상태 변경 API
- **tdd**:
  - RED: 리워드 조회, 상태 변경 API 테스트
  - GREEN: Migration + API route 구현
  - REFACTOR: 정리
- **deliverables**:
  - `supabase/migrations/003_rewards.sql`
  - `app/api/rewards/route.ts`
  - `__tests__/api/rewards.test.ts`

### P1-R3-T2: Rewards 비즈니스 로직
- **type**: backend-resource
- **agent**: backend-specialist
- **status**: pending
- **depends_on**: [P1-R3-T1, P1-R2-T2]
- **resource**: rewards
- **description**: 예약 시 초기 리워드 생성 (pending), 5명 초대 달성 시 자동 unlock (Supabase trigger 또는 서버 로직)
- **tdd**:
  - RED: 예약 시 리워드 자동 생성, 5명 달성 시 unlock 테스트
  - GREEN: 트리거/로직 구현
  - REFACTOR: 엣지 케이스 처리
- **deliverables**:
  - `lib/rewards.ts`
  - `supabase/migrations/004_rewards_trigger.sql` (optional)
  - `__tests__/lib/rewards.test.ts`

---

## P2: Common Layout + Core Screens (SCR-1, SCR-2)

### P2-S0-T1: 공통 레이아웃
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P0-T0.2]
- **description**: Header (로고), Footer, 모바일 반응형 레이아웃 (320px/768px/1280px). single-column 레이아웃 컴포넌트
- **deliverables**:
  - `components/layout/Header.tsx`
  - `components/layout/Footer.tsx`
  - `components/layout/SingleColumnLayout.tsx`
  - `app/prelaunch/layout.tsx`

### P2-S1-T1: 랜딩 페이지 UI (SCR-1)
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P2-S0-T1]
- **screen**: SCR-1
- **route**: /prelaunch
- **description**: HeroSection (공감 메시지 + 그래디언트), DNAIntroSection (4축 2x2 그리드), ReservationForm (이메일+직군+연차)
- **tdd**:
  - RED: 컴포넌트 렌더링 테스트, 폼 유효성 검증 테스트
  - GREEN: UI 컴포넌트 구현
  - REFACTOR: 스타일 정리
- **deliverables**:
  - `components/prelaunch/HeroSection.tsx`
  - `components/prelaunch/DNAIntroSection.tsx`
  - `components/prelaunch/ReservationForm.tsx`
  - `app/prelaunch/page.tsx`
  - `__tests__/components/prelaunch/landing.test.tsx`

### P2-S1-T2: 랜딩 페이지 API 연동 (SCR-1)
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P2-S1-T1, P1-R1-T2]
- **screen**: SCR-1
- **description**: ReservationForm -> POST /api/reservations 연동. 로딩/성공/에러 상태 처리. 성공 시 /prelaunch/reserved로 리다이렉트
- **tdd**:
  - RED: API 호출 성공/실패/중복 이메일 시나리오 테스트
  - GREEN: API 연동 구현
  - REFACTOR: 에러 메시지 UX 개선
- **deliverables**:
  - `hooks/useReservation.ts`
  - `__tests__/hooks/useReservation.test.ts`

### P2-S1-V: 랜딩 페이지 검증
- **type**: verification
- **agent**: test-specialist
- **status**: pending
- **depends_on**: [P2-S1-T2]
- **screen**: SCR-1
- **checks**:
  - 초기 로드: Hero + DNA 카드 + 예약 폼 표시
  - 예약 성공: /prelaunch/reserved 리다이렉트 + queue_position 전달
  - 이메일 중복: "이미 예약하신 이메일입니다" 에러 표시
  - 네트워크 오류: "오류가 발생했습니다" 표시

### P2-S2-T1: 예약 완료 UI (SCR-2)
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P2-S0-T1]
- **screen**: SCR-2
- **route**: /prelaunch/reserved
- **description**: WelcomeMessage (순번 표시), InviteLinkCard (복사 버튼), InviteProgressBar (0/5), SocialShareButtons (카카오/트위터/인스타)
- **tdd**:
  - RED: 순번 렌더링, 복사 버튼, 프로그레스바 테스트
  - GREEN: UI 컴포넌트 구현
  - REFACTOR: 공유 버튼 UX 정리
- **deliverables**:
  - `components/prelaunch/WelcomeMessage.tsx`
  - `components/prelaunch/InviteLinkCard.tsx`
  - `components/prelaunch/InviteProgressBar.tsx`
  - `components/prelaunch/SocialShareButtons.tsx`
  - `app/prelaunch/reserved/page.tsx`
  - `__tests__/components/prelaunch/reserved.test.tsx`

### P2-S2-T2: 예약 완료 API 연동 (SCR-2)
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P2-S2-T1, P1-R3-T1]
- **screen**: SCR-2
- **description**: route-state에서 reservation 데이터 수신. rewards API로 초대 진행률 조회. 클립보드 복사, SNS 공유 API 연동
- **tdd**:
  - RED: route-state 수신, 리워드 조회, 클립보드 복사 테스트
  - GREEN: 연동 구현
  - REFACTOR: 정리
- **deliverables**:
  - `hooks/useInviteProgress.ts`
  - `lib/share.ts` (SNS 공유 유틸)
  - `__tests__/hooks/useInviteProgress.test.ts`

### P2-S2-V: 예약 완료 검증
- **type**: verification
- **agent**: test-specialist
- **status**: pending
- **depends_on**: [P2-S2-T2]
- **screen**: SCR-2
- **checks**:
  - 초기 로드: 순번 + 초대 링크 카드 + 진행바 0/5
  - 링크 복사: 클립보드 복사 + 토스트 메시지
  - SNS 공유: 카카오톡 공유 API 호출

---

## P3: Invite System + Dashboard (SCR-3, SCR-4)

### P3-S3-T1: 초대 랜딩 UI (SCR-3)
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P2-S1-T1]
- **screen**: SCR-3
- **route**: /?ref={code}
- **description**: SCR-1 확장. InviteBanner 추가 (초대자명 표시). 나머지는 SCR-1 컴포넌트 재사용. ref 파라미터 폼에 포함
- **tdd**:
  - RED: 초대 배너 렌더링, ref 파라미터 전달 테스트
  - GREEN: InviteBanner + SCR-1 재사용 구현
  - REFACTOR: 컴포넌트 공유 정리
- **deliverables**:
  - `components/prelaunch/InviteBanner.tsx`
  - `app/prelaunch/invite/page.tsx` (or middleware for /?ref)
  - `__tests__/components/prelaunch/invite-landing.test.tsx`

### P3-S3-T2: 초대 랜딩 API 연동 + 추적 (SCR-3)
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P3-S3-T1, P1-R2-T2]
- **screen**: SCR-3
- **description**: ref 코드로 초대자 조회, invite_tracking 클릭 기록 자동 생성, 예약 시 ref 파라미터 전달
- **tdd**:
  - RED: 초대코드 검증, 클릭 추적, ref 포함 예약 테스트
  - GREEN: API 연동 구현
  - REFACTOR: 에러 핸들링
- **deliverables**:
  - `hooks/useInviteCode.ts`
  - `__tests__/hooks/useInviteCode.test.ts`

### P3-S3-T3: OG 이미지 동적 생성 (SCR-3)
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P3-S3-T1]
- **screen**: SCR-3
- **description**: @vercel/og로 초대자명 + 서비스 소개 포함 OG 이미지 동적 생성. SNS 미리보기용
- **tdd**:
  - RED: OG 이미지 API 응답 테스트
  - GREEN: /api/og route 구현
  - REFACTOR: 디자인 정리
- **deliverables**:
  - `app/api/og/route.tsx`
  - `__tests__/api/og.test.ts`

### P3-S3-V: 초대 랜딩 검증
- **type**: verification
- **agent**: test-specialist
- **status**: pending
- **depends_on**: [P3-S3-T2, P3-S3-T3]
- **screen**: SCR-3
- **checks**:
  - 유효 초대코드: 초대자명 배너 표시
  - 무효 초대코드: 배너 없이 일반 랜딩
  - OG 이미지: 동적 이미지 생성 확인
  - 초대 추적: invite_tracking 클릭 기록

### P3-S4-T1: 예약자 대시보드 UI (SCR-4)
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P2-S0-T1]
- **screen**: SCR-4
- **route**: /prelaunch/my-reservation
- **description**: QueuePosition (큰 숫자), InviteProgressBar (N/5), RewardStatus (배지/우선접근 상태), InviteLinkCard, SocialShareButtons
- **tdd**:
  - RED: 순번/진행바/리워드 렌더링 테스트
  - GREEN: UI 컴포넌트 구현
  - REFACTOR: 반응형 정리
- **deliverables**:
  - `components/prelaunch/QueuePosition.tsx`
  - `components/prelaunch/RewardStatus.tsx`
  - `app/prelaunch/my-reservation/page.tsx`
  - `__tests__/components/prelaunch/my-reservation.test.tsx`

### P3-S4-T2: 예약자 대시보드 API 연동 (SCR-4)
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P3-S4-T1, P1-R1-T2, P1-R2-T2, P1-R3-T2]
- **screen**: SCR-4
- **description**: 이메일 기반 reservation 조회, invite_tracking 집계 (successful_invites), rewards 상태 조회. 인증 미들웨어 (비로그인 시 리다이렉트)
- **tdd**:
  - RED: 인증 체크, 데이터 조회, 집계 테스트
  - GREEN: API 연동 구현
  - REFACTOR: 캐싱/최적화
- **deliverables**:
  - `hooks/useMyReservation.ts`
  - `middleware.ts` (auth guard for /prelaunch/my-reservation)
  - `__tests__/hooks/useMyReservation.test.ts`

### P3-S4-V: 예약자 대시보드 검증
- **type**: verification
- **agent**: test-specialist
- **status**: pending
- **depends_on**: [P3-S4-T2]
- **screen**: SCR-4
- **checks**:
  - 초기 로드: 순번 + 초대 진행바 + 리워드 상태
  - 초대 성공 반영: 진행바 값 증가
  - 배지 달성: 5명 초대 시 unlocked 상태
  - 비로그인 접근: 리다이렉트

---

## P4: Admin Screen (SCR-5)

### P4-S5-T1: 관리자 예약 탭 UI (SCR-5)
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P2-S0-T1]
- **screen**: SCR-5
- **route**: /admin/prelaunch
- **description**: StatCards (4개 지표), DailyChart (꺾은선), IndustryChart (막대), ExperienceChart (원형), TopInvitersTable, FilterButtons (기간 필터), CSVExport
- **tdd**:
  - RED: 차트/테이블 렌더링, 필터 상태 변경 테스트
  - GREEN: UI 컴포넌트 구현
  - REFACTOR: 차트 라이브러리 통합
- **deliverables**:
  - `components/admin/StatCards.tsx`
  - `components/admin/DailyChart.tsx`
  - `components/admin/IndustryChart.tsx`
  - `components/admin/ExperienceChart.tsx`
  - `components/admin/TopInvitersTable.tsx`
  - `app/admin/prelaunch/page.tsx`
  - `__tests__/components/admin/prelaunch.test.tsx`

### P4-S5-T2: 관리자 예약 탭 API 연동 (SCR-5)
- **type**: frontend-screen
- **agent**: frontend-specialist
- **status**: pending
- **depends_on**: [P4-S5-T1, P1-R1-T2, P1-R2-T2, P1-R3-T2]
- **screen**: SCR-5
- **description**: 집계 API (총 예약, 전환율, 배지 수, 평균 초대). 기간 필터링. CSV 내보내기. admin role 인증 체크
- **tdd**:
  - RED: 집계 API 호출, 필터 적용, CSV 생성 테스트
  - GREEN: API 연동 구현
  - REFACTOR: 쿼리 최적화
- **deliverables**:
  - `app/api/admin/prelaunch/stats/route.ts`
  - `app/api/admin/prelaunch/export/route.ts`
  - `hooks/usePrelaunchStats.ts`
  - `__tests__/api/admin/prelaunch.test.ts`

### P4-S5-V: 관리자 예약 탭 검증
- **type**: verification
- **agent**: test-specialist
- **status**: pending
- **depends_on**: [P4-S5-T2]
- **screen**: SCR-5
- **checks**:
  - 초기 로드: 4개 지표 카드 + 3개 차트 + 상위 초대자 테이블
  - 기간 필터: 선택 시 전체 데이터 갱신
  - CSV 내보내기: 파일 다운로드
  - 비관리자 접근: 접근 거부 리다이렉트

---

## P5: Integration + Deploy

### P5-T1: E2E 통합 테스트
- **type**: integration
- **agent**: test-specialist
- **status**: pending
- **depends_on**: [P2-S1-V, P2-S2-V, P3-S3-V, P3-S4-V, P4-S5-V]
- **description**: 전체 예약 플로우 E2E 테스트 (Playwright). 랜딩 -> 예약 -> 초대링크 복사 -> 초대자 예약 -> 대시보드 확인
- **deliverables**:
  - `e2e/prelaunch-flow.spec.ts`
  - `e2e/invite-flow.spec.ts`
  - `e2e/admin-prelaunch.spec.ts`

### P5-T2: Vercel 배포 + 도메인 설정
- **type**: deploy
- **agent**: backend-specialist
- **status**: pending
- **depends_on**: [P5-T1]
- **description**: Vercel 프로덕션 배포. 환경 변수 설정 (Supabase URL/Key, Resend API Key). 도메인 연결. OG 이미지 동작 확인
- **deliverables**:
  - Vercel production deployment
  - Environment variables configured
  - Domain DNS configured

---

## Dependency Graph

```
P0-T0.1 ──┬── P0-T0.2 ── P2-S0-T1 ──┬── P2-S1-T1 ── P2-S1-T2 ── P2-S1-V ──┐
           │                           ├── P2-S2-T1 ── P2-S2-T2 ── P2-S2-V ──┤
           │                           ├── P3-S4-T1 ── P3-S4-T2 ── P3-S4-V ──┤
           │                           └── P4-S5-T1 ── P4-S5-T2 ── P4-S5-V ──┤
           │                                                                   │
           ├── P1-R1-T1 ── P1-R1-T2 ──────────────────────────────────────────┤
           ├── P1-R2-T1 ── P1-R2-T2 ──────────────────────────────────────────┤
           └── P1-R3-T1 ── P1-R3-T2 ──────────────────────────────────────────┤
                                                                               │
           P2-S1-T1 ── P3-S3-T1 ──┬── P3-S3-T2 ── P3-S3-V ──────────────────┤
                                   └── P3-S3-T3 ──────────────────────────────┤
                                                                               │
                                                                    P5-T1 ── P5-T2
```

## Parallel Execution Groups

| Group | Tasks | Condition |
|-------|-------|-----------|
| G1 | P1-R1-T1, P1-R2-T1, P1-R3-T1 | P0-T0.1 완료 후 병렬 |
| G2 | P2-S1-T1, P2-S2-T1, P3-S4-T1, P4-S5-T1 | P2-S0-T1 완료 후 병렬 |
| G3 | P1-R1-T2, P1-R2-T2 | 각 T1 완료 후 병렬 |

## Stats

| Metric | Value |
|--------|-------|
| Total Phases | 6 (P0-P5) |
| Backend Resource Tasks | 6 |
| Frontend Screen Tasks | 13 (includes S0 layout) |
| Verification Tasks | 5 |
| Integration/Deploy Tasks | 2 |
| **Total Tasks** | **27** |
| Estimated Parallel Depth | ~8 levels |
