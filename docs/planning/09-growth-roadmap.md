# 09-growth-roadmap.md: 서비스 확장 로드맵

**프로젝트**: Workside (워크사이드)
**버전**: 1.0
**작성일**: 2026-03-20
**상태**: 장기 로드맵

---

## 1. 서비스 비전

### 1.1 최종 목표
**커리어 포탈 플랫폼** — 직장인의 성장과 커리어 전환을 데이터 기반으로 지원

### 1.2 핵심 컨셉
- "겉으로는 익명, 속으로는 실명제" 기반 신뢰 시스템
- 사용자 행동 데이터 → 커리어 인사이트 → 유료 가치 창출
- 참여자에게 수익이 공유되는 구조

### 1.3 비전 구조

```
Workside 커리어 포탈
│
├── [1단계] 커뮤니티 (현재 MVP)
│   Workstyle DNA 진단
│   질문/피드 참여
│   제안(궁금합니다) 등록
│
├── [2단계] 프로필 & 포트폴리오
│   실명 인증 (겉 익명 / 속 실명)
│   포트폴리오 작성/열람 (유무료)
│   행동 데이터 기반 프로필 강화
│
├── [3단계] 회사 탐색 & 조직문화
│   현직자 조직문화 리포트
│   회사 탐색 (이직 준비)
│   참여자 수익 공유 모델
│
└── [4단계] 채용 연결
    리크루터/헤드헌터 스카웃 제의
    면접 요청
    매칭 알고리즘
```

---

## 2. 단계별 상세 로드맵

### 2.1 1단계: MVP + 데이터 수집 강화 (현재 ~ 3개월)

**목표**: 초기 사용자 확보 + 행동 데이터 축적 시작

#### 완료된 기능
- [x] Workstyle DNA 진단 (세미 12문항 / 풀 40문항)
- [x] 6가지 페르소나 판정 + 결과 공유
- [x] 질문 피드 (생성/참여/마감)
- [x] 제안(궁금합니다) 등록 + 관리자 승인
- [x] 관리자 대시보드 (실시간 통계)
- [x] 사용자 관리 (산업/규모별 분포)

#### 추가 필요 기능
- [ ] 행동 데이터 수집 테이블 (`user_events`)
  - 페이지 뷰, 체류 시간, 클릭 이벤트
  - DNA 결과 공유 추적
  - 질문 참여 패턴 분석
- [ ] 관리자 대시보드 고도화
  - 코호트 분석 (실제 데이터 기반)
  - 퍼널 분석 (가입→진단→참여→재방문)
- [ ] 이메일 알림 (새 질문 등록 시)

#### 인프라
- Vercel + Supabase Cloud (무료)

#### 핵심 지표
- 가입자 수
- DNA 진단 완료율
- 질문 참여율
- 재방문율 (D7, D30)

---

### 2.2 2단계: 프로필 & 유료화 (3~6개월)

**목표**: 수익 모델 검증 + 실명 기반 신뢰 시스템 구축

#### 필요한 DB 구조

```sql
-- 실명 인증 (겉 익명 / 속 실명)
verified_profiles (
  id, user_id,
  real_name,           -- 실명 (비공개)
  company_verified,    -- 재직 증명 여부
  verification_method, -- phone / email / company_email
  verified_at,
  is_public            -- false: 익명 유지
)

-- 포트폴리오
portfolios (
  id, user_id,
  title, summary,
  visibility,          -- public / premium_only / private
  view_count,
  created_at
)

portfolio_items (
  id, portfolio_id,
  type,                -- project / certification / award
  title, description,
  period_start, period_end
)

-- 열람 기록 (유료 열람 추적)
portfolio_access_logs (
  id, portfolio_id,
  viewer_id,
  access_type,         -- free / premium
  payment_id,
  accessed_at
)
```

#### 유료화 모델

| 기능 | 무료 | 프리미엄 |
|------|------|---------|
| DNA 진단 | 세미(12문항) | 풀(40문항) + 심층 해석 |
| 질문 참여 | 제한 없음 | 제한 없음 |
| 포트폴리오 작성 | 1개 | 무제한 |
| 타인 포트폴리오 열람 | 3건/월 | 무제한 |
| 축 조합 상세 인사이트 | 기본 | 전체 해금 |

#### 결제 시스템
- Stripe 또는 토스페이먼츠 연동
- 사용자 role에 `premium` 추가
- `subscriptions` 테이블로 구독 관리

#### 인프라
- Vercel + Supabase Pro ($45/월)

---

### 2.3 3단계: 회사 탐색 & 조직문화 (6~12개월)

**목표**: B2B 가치 창출 + 참여자 수익 공유 모델

#### 필요한 DB 구조

```sql
-- 회사 정보
companies (
  id,
  name, industry, size,
  logo_url,
  verified,            -- 등록 기업 인증 여부
  created_at
)

-- 조직문화 리포트 (현직자 참여)
culture_reports (
  id, company_id,
  reporter_id,         -- 작성자 (익명 표시)
  dimensions,          -- JSONB: 워라밸, 성장기회, 보상 등
  overall_score,
  is_verified,         -- 재직자 인증된 리포트인지
  created_at
)

-- 수익 공유
earnings (
  id, user_id,
  source_type,         -- culture_report / portfolio_view
  source_id,
  amount,
  status,              -- pending / paid / cancelled
  created_at
)

payouts (
  id, user_id,
  total_amount,
  payment_method,      -- bank_transfer
  status,
  paid_at
)

-- 기여도 점수 (수익 분배 기준)
contribution_scores (
  id, user_id,
  score_type,          -- report_quality / report_freshness / engagement
  score_value,
  calculated_at
)
```

#### 수익 공유 모델

```
조직문화 리포트 유료 열람 수익
    │
    ├── 50% → 리포트 작성자 (기여도 비례 분배)
    ├── 30% → 플랫폼 운영비
    └── 20% → 커뮤니티 기여 보상 풀
```

#### 인프라
- Vercel + Supabase Team
- 분석용 데이터 파이프라인 추가 검토 (BigQuery 등)

---

### 2.4 4단계: 채용 연결 (12개월+)

**목표**: 리크루터/헤드헌터 연결로 B2B 매출 확대

#### 필요한 DB 구조

```sql
-- 리크루터/헤드헌터 프로필
recruiter_profiles (
  id, user_id,
  company_id,
  role,                -- recruiter / headhunter / hr_manager
  specialization,      -- industry / job_function
  verified,
  created_at
)

-- 스카웃 제의
scout_offers (
  id,
  recruiter_id,
  target_user_id,
  position_title,
  company_id,
  message,
  status,              -- sent / viewed / accepted / declined
  created_at
)

-- 면접 요청
interview_requests (
  id, scout_offer_id,
  proposed_dates,      -- JSONB: 제안 날짜/시간 목록
  confirmed_date,
  status,              -- pending / confirmed / completed / cancelled
  created_at
)
```

#### B2B 수익 모델

| 서비스 | 대상 | 과금 모델 |
|--------|------|----------|
| 인재 검색 | 리크루터 | 월 구독 ($99~) |
| 스카웃 메시지 | 리크루터 | 건당 과금 |
| 조직문화 분석 리포트 | 기업 HR | 연간 구독 |
| 채용 브랜딩 | 기업 | 광고/브랜딩 비용 |

---

## 3. 데이터 아키텍처 원칙

전 단계에 걸쳐 지켜야 할 데이터 설계 원칙:

### 3.1 행동 데이터 수집 (1단계부터 적용)

```sql
-- 모든 사용자 행동을 기록하는 범용 이벤트 테이블
user_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_type TEXT,          -- page_view / click / scroll / share / search
  event_target TEXT,        -- 대상 (page_path, button_id, question_id 등)
  event_data JSONB,         -- 부가 데이터 (체류시간, 스크롤깊이 등)
  session_id TEXT,          -- 브라우저 세션 식별
  created_at TIMESTAMPTZ
)
```

수집 대상:
- 페이지 진입/이탈 + 체류 시간
- DNA 진단 중 이탈 지점
- 질문 참여 전환율
- 공유 클릭 → 실제 유입 추적
- 검색 키워드 (회사 탐색 시)

### 3.2 익명-실명 이중 레이어

```
사용자 데이터 구조:
│
├── public_profile (공개)
│   닉네임, DNA 유형, 참여 수
│   → 다른 사용자에게 보이는 정보
│
├── verified_profile (비공개, 관리자만 접근)
│   실명, 회사, 직급
│   → 리크루터 매칭, 수익 정산에 사용
│
└── behavioral_profile (시스템 내부)
│   행동 패턴, 관심사, 활동 점수
│   → 개인화 추천, 매칭 알고리즘에 사용
```

### 3.3 수익 추적 설계

모든 유료 콘텐츠 접근은 로그로 남겨서:
- 누가 열람했는지 (과금 근거)
- 작성자에게 얼마를 정산해야 하는지
- 어떤 콘텐츠가 인기인지 (추천 알고리즘)

---

## 4. 기술 스택 진화 예측

| 시점 | 프론트엔드 | 백엔드 | DB | 분석 |
|------|----------|--------|-----|------|
| 1단계 (현재) | Next.js + Vercel | Next.js API Routes | Supabase | Supabase 내장 |
| 2단계 | 동일 | 동일 | Supabase Pro | Mixpanel 또는 Amplitude |
| 3단계 | 동일 | 동일 + Edge Functions | Supabase Team | BigQuery 또는 Redshift |
| 4단계 | 동일 또는 AWS 전환 | 마이크로서비스 검토 | AWS RDS 또는 자체 운영 | 전용 데이터 파이프라인 |

---

## 5. MVP 배포 후 우선순위

배포 직후 가장 먼저 해야 할 것:

1. **`user_events` 테이블 추가** — 행동 데이터 수집 시작
2. **퍼널 분석 대시보드** — 가입→진단→참여→재방문 전환율 추적
3. **사용자 피드백 채널** — 초기 사용자와 직접 소통
4. **유료화 실험** — DNA 풀 진단을 프리미엄으로 제공하고 반응 확인
