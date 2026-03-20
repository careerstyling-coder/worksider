# 02-trd.md: 기술 요구사항 명세 (TRD)

**프로젝트**: Workside (워크사이드)
**버전**: 1.0
**작성일**: 2026-03-16
**상태**: MVP Phase 1 기획

---

## 1. 기술 스택

### 1.1 핵심 스택

| 계층 | 기술 | 버전 | 선택 이유 |
|------|------|------|---------|
| **Frontend Framework** | Next.js (App Router) | 15+ | SSR + CSR 하이브리드, OG 이미지 생성 용이 |
| **Language** | TypeScript | 5.x | 타입 안정성, 개발 신뢰도 |
| **Styling** | Tailwind CSS | 4.x | 빠른 UI 개발, 반응형 대응 |
| **Database** | Supabase (PostgreSQL) | 최신 | Auth, Realtime, 무료 티어 충분 |
| **Auth** | Supabase Auth | 기본 | 이메일+비번, 세션 관리 |
| **Charts** | Recharts | 2.x | 레이더 차트, 바 차트, 꺾은선 차트 |
| **OG Image** | @vercel/og | 최신 | 동적 OG 이미지 생성 (Next.js 통합) |
| **Deployment** | Vercel | 최신 | Next.js 최적화 배포, 글로벌 CDN |
| **Email** | [미정: Resend or SendGrid] | - | 질문 알림, 제안 채택 알림 |

### 1.2 개발 도구

| 분류 | 도구 | 목적 |
|------|------|------|
| **Linting** | ESLint | 코드 스타일 일관성 |
| **Formatting** | Prettier | 코드 자동 포맷팅 |
| **Testing** | Jest + React Testing Library | 컴포넌트, 유틸 테스트 |
| **API Client** | TanStack Query (React Query) | 데이터 페칭, 캐싱 |
| **Form** | React Hook Form | 복잡한 폼 관리 (진단 설문) |
| **Validation** | Zod | 런타임 타입 검증 |
| **UUID** | nanoid | 비예측 ID 생성 (공유 링크) |

---

## 2. 아키텍처

### 2.1 전체 구조도 (텍스트 표현)

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                        │
│  Next.js (App Router) + TypeScript + Tailwind + Recharts   │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                     │
│  ├─ / (Landing)                                             │
│  ├─ /share/:shareId (Share Receiver)                       │
│  ├─ /diagnosis (DNA Quiz)                                  │
│  ├─ /result/:sessionId (DNA Result)                        │
│  ├─ /signup (Registration)                                 │
│  ├─ /login (Auth)                                          │
│  ├─ /my-dna (User Profile)                                 │
│  ├─ /feed (Main Feed)                                      │
│  ├─ /question/:questionId (Question Detail)                │
│  ├─ /question/:questionId/result (Question Result)         │
│  ├─ /suggest (Question Proposal)                           │
│  └─ /admin/* (Admin Dashboard)                             │
├─────────────────────────────────────────────────────────────┤
│              API Layer (Next.js API Routes)                 │
│  /api/diagnosis/*                                           │
│  /api/questions/*                                           │
│  /api/users/*                                               │
│  /api/admin/*                                               │
├─────────────────────────────────────────────────────────────┤
│         Supabase (PostgreSQL + Auth + Realtime)            │
│  ├─ Database (Tables)                                       │
│  ├─ Auth (RLS + Policies)                                  │
│  └─ Storage (OG Images - 미정)                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 배포 구조

```
┌────────────────────────────────────────┐
│        Vercel (배포 & 호스팅)          │
│  ├─ Next.js 서버 (SSR/CSR)             │
│  ├─ Edge Functions (미들웨어)          │
│  └─ 환경 변수 관리                     │
└────────────────────────────────────────┘
           ↓ (HTTPS)
┌────────────────────────────────────────┐
│     Supabase (데이터 & 인증)           │
│  ├─ PostgreSQL Database                │
│  ├─ Auth Service                       │
│  ├─ Realtime (구독형, Phase 2)        │
│  └─ Storage (미정)                    │
└────────────────────────────────────────┘
```

### 2.3 렌더링 전략

| 페이지 | 렌더링 방식 | 캐시 | 이유 |
|--------|----------|------|------|
| `/` (Landing) | SSG | 3600s | 정적 콘텐츠 |
| `/share/:shareId` | SSR | 없음 | 동적 OG 이미지 |
| `/diagnosis` | CSR | 없음 | 상태 기반 양식 |
| `/result/:sessionId` | SSR | 1800s | 진단 결과 초기 로드 최적화 |
| `/feed` | CSR | 300s | 동적 질문 목록 |
| `/admin/*` | CSR | 없음 | 보호된 경로, 실시간 데이터 |

---

## 3. 데이터베이스 설계

### 3.1 핵심 테이블

#### users
진단 및 질문 참여 기록을 위한 사용자 정보 관리

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  industry VARCHAR(100), -- 산업군 (드롭다운)
  company_size VARCHAR(50), -- 회사 규모 (S/M/L/XL)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

#### dna_sessions
진단 세션 (진행 중 또는 완료)

```sql
CREATE TABLE dna_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL CHECK (version IN ('semi', 'full')), -- 세미/풀
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### dna_questions
DNA 진단 질문 (마스터 데이터)

```sql
CREATE TABLE dna_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(20) NOT NULL, -- 'semi' 또는 'full'
  axis VARCHAR(10) NOT NULL CHECK (axis IN ('P', 'C', 'Pol', 'S')),
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('behavioral', 'situational', 'value')),
  question_text TEXT NOT NULL,
  display_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### dna_responses
개별 진단 응답 (특정 세션 내 답변)

```sql
CREATE TABLE dna_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES dna_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES dna_questions(id),
  response_value INT NOT NULL CHECK (response_value BETWEEN 1 AND 7), -- Likert 1~7
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### dna_results
계산된 진단 결과 (정규화된 스코어 + 페르소나)

```sql
CREATE TABLE dna_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES dna_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score_p INT CHECK (score_p BETWEEN 0 AND 100),
  score_c INT CHECK (score_c BETWEEN 0 AND 100),
  score_pol INT CHECK (score_pol BETWEEN 0 AND 100),
  score_s INT CHECK (score_s BETWEEN 0 AND 100),
  persona_label VARCHAR(100), -- "실무형 전문가", "전략적 성과자" 등
  share_token VARCHAR(255) UNIQUE, -- nanoid (공유 링크용)
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### questions
커뮤니티 질문 (관리자가 배포하는 질문)

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('single', 'multiple')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  published_at TIMESTAMP,
  closed_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### question_options
질문의 선택지

```sql
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text VARCHAR(500) NOT NULL,
  display_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### question_responses
사용자가 질문에 제출한 응답 (익명)

```sql
CREATE TABLE question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id), -- NULL이면 비회원, 익명 처리
  option_id UUID NOT NULL REFERENCES question_options(id),
  dna_type VARCHAR(100), -- 사용자의 DNA 페르소나 (익명화)
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### question_suggestions
사용자가 제안한 질문

```sql
CREATE TABLE question_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### shout_outs
제안에 대한 응원 반응

```sql
CREATE TABLE shout_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES question_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id) -- 중복 반응 방지
);
```

#### participation_history
참여 이력 추적 (비노출, 데이터 분석용)

```sql
CREATE TABLE participation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  participated_at TIMESTAMP DEFAULT NOW(),
  response_id UUID REFERENCES question_responses(id)
);
```

#### access_levels
접근 제어 설정 (모듈화)

```sql
CREATE TABLE access_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_name VARCHAR(100) NOT NULL, -- 'basic', 'premium', 'admin'
  features JSONB, -- {can_view_results: true, can_suggest: true, ...}
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### admin_settings
관리자 설정값

```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
-- 예: setting_key = 'signup_gate_position', setting_value = {"gate_after": "diagnosis"}
```

### 3.2 인덱스 전략

```sql
-- 자주 조회되는 열
CREATE INDEX idx_dna_sessions_user_id ON dna_sessions(user_id);
CREATE INDEX idx_question_responses_question_id ON question_responses(question_id);
CREATE INDEX idx_question_responses_user_id ON question_responses(user_id);
CREATE INDEX idx_dna_results_share_token ON dna_results(share_token);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_suggestions_status ON question_suggestions(status);
```

### 3.3 Row Level Security (RLS)

```sql
-- users: 자신의 데이터만 조회/수정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select ON users FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'authenticated'); -- 자신 또는 인증된 사용자
CREATE POLICY users_update ON users FOR UPDATE
  USING (auth.uid() = id); -- 자신만 수정

-- dna_results: 자신의 결과 조회
ALTER TABLE dna_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY dna_results_select ON dna_results FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated'); -- 자신의 결과만

-- question_responses: 익명 응답 불가역적
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY qr_insert ON question_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- admin_settings: 관리자만 접근
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_settings_all ON admin_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND id = '<ADMIN_USER_ID>'
  ));
```

---

## 4. 보안 & 프라이버시

### 4.1 인증 & 인가

| 항목 | 설정 | 상세 |
|------|------|------|
| **인증 방식** | Supabase Auth (이메일 + 비밀번호) | 자체 구현 피함 |
| **비회원 접근** | 전체 공개 | 로그인 없이 진단 가능 |
| **세션 관리** | Supabase JWT (자동) | 쿠키 기반 세션 |
| **비밀번호 정책** | 최소 8자, 특수문자 권장 | Supabase 기본값 |
| **CORS** | Vercel + Supabase CORS 설정 | 같은 도메인 내 통신 |

### 4.2 익명성 보장

| 기능 | 구현 |
|------|------|
| **질문 응답** | user_id NULL 또는 분리된 익명 ID로 저장 |
| **DNA 페르소나 노출** | "P=72, C=45, ..." 숫자만 노출 (이메일 미포함) |
| **IP 로깅** | 진단 응답 중복 방지용만 (재진단 플로우에서) |
| **추적 불가** | 응답과 사용자 프로필의 연결 차단 |

### 4.3 데이터 보호

| 항목 | 정책 |
|------|------|
| **저장소 암호화** | Supabase 기본 암호화 (HTTPS) |
| **전송 암호화** | TLS 1.3 (HTTPS) |
| **백업** | Supabase 자동 백업 (일일) |
| **개인정보** | 진단 후 180일 자동 익명화 (미정) |

### 4.4 공유 링크 보안

```typescript
// nanoid를 사용한 비예측 토큰
import { nanoid } from 'nanoid';

const shareToken = nanoid(21); // 21자 무작위 문자열
// 예: "V1StGXR_Z5j3eK5t2nK6"
// 무차별 공격으로 추측 불가능 (약 1.5 * 10^31가지)
```

---

## 5. API 엔드포인트 (Next.js 라우팅)

### 5.1 진단 API

| 메서드 | 경로 | 기능 | 인증 |
|--------|------|------|------|
| POST | `/api/diagnosis/start` | 진단 세션 생성 | 불필요 |
| POST | `/api/diagnosis/:sessionId/response` | 개별 응답 제출 | 불필요 |
| POST | `/api/diagnosis/:sessionId/complete` | 진단 완료 & 결과 계산 | 불필요 |
| GET | `/api/diagnosis/:sessionId` | 세션 상태 조회 | 불필요 |
| GET | `/api/diagnosis/result/:sessionId` | 결과 조회 | 불필요 |

### 5.2 사용자 API

| 메서드 | 경로 | 기능 | 인증 |
|--------|------|------|------|
| POST | `/api/auth/signup` | 회원가입 | 불필요 |
| POST | `/api/auth/login` | 로그인 | 불필요 |
| POST | `/api/auth/logout` | 로그아웃 | 필요 |
| GET | `/api/users/profile` | 프로필 조회 | 필요 |
| PUT | `/api/users/profile` | 프로필 수정 | 필요 |
| GET | `/api/users/dna-history` | 진단 이력 조회 | 필요 |

### 5.3 질문 API

| 메서드 | 경로 | 기능 | 인증 |
|--------|------|------|------|
| GET | `/api/questions` | 질문 목록 (필터 지원) | 불필요 |
| GET | `/api/questions/:questionId` | 질문 상세 | 불필요 |
| POST | `/api/questions/:questionId/respond` | 응답 제출 | 불필요 |
| GET | `/api/questions/:questionId/result` | 결과 조회 | 불필요 |
| POST | `/api/questions/suggest` | 질문 제안 | 필요 |
| GET | `/api/questions/:questionId/suggestions` | 제안 목록 | 불필요 |
| POST | `/api/suggestions/:suggestionId/shoutout` | Shout out 추가 | 필요 |

### 5.4 관리자 API

| 메서드 | 경로 | 기능 | 인증 |
|--------|------|------|------|
| GET | `/api/admin/dashboard` | 대시보드 지표 | Admin 필요 |
| POST | `/api/admin/questions` | 질문 생성 | Admin 필요 |
| PUT | `/api/admin/questions/:questionId` | 질문 배포/마감 | Admin 필요 |
| GET | `/api/admin/suggestions` | 제안 목록 | Admin 필요 |
| POST | `/api/admin/suggestions/:suggestionId/approve` | 제안 채택 | Admin 필요 |
| GET | `/api/admin/users` | 사용자 분석 | Admin 필요 |
| PUT | `/api/admin/settings` | 설정 변경 | Admin 필수 |

---

## 6. 성능 요구사항

### 6.1 응답시간

| 엔드포인트 | 목표 | 캐시 |
|-----------|------|------|
| `/api/diagnosis/start` | <200ms | 없음 |
| `/api/questions` | <300ms | 300s (CloudFlare) |
| `/api/questions/:questionId/result` | <500ms | 60s |
| `/` | <1s | 3600s (정적) |
| `/result/:sessionId` | <500ms | 1800s |

### 6.2 동시성 (초기)

| 지표 | 목표 |
|-----|------|
| 동시 연결 | 100 (초기) |
| 초당 요청 (RPS) | 50 |
| 데이터베이스 풀 | 20 (Supabase 기본) |

### 6.3 번들 크기

| 항목 | 목표 |
|------|------|
| 메인 번들 | <100KB |
| 차트 라이브러리 (Recharts) | <50KB (gzip) |
| 총 JS | <150KB (gzip) |

---

## 7. 확장성 & 모듈화

### 7.1 Phase 1 → Phase 2 모듈화 포인트

| 모듈 | Phase 1 | Phase 2 | 설명 |
|------|---------|---------|------|
| **Realtime** | 폴링 | Supabase Realtime | 실시간 알림 |
| **비교 기능** | OFF | ON | 공유자 vs 수신자 DNA 비교 |
| **심화 분석** | 기본 집계 | PDF 리포트 | 유료 기능 |
| **팀 분석** | OFF | ON | B2B 기능 (미정) |
| **이메일** | 기본 알림 | 고급 자동화 | Resend or SendGrid 확대 |

### 7.2 가입 게이트 모듈화

```typescript
// admin_settings에서 설정 가능
{
  "setting_key": "signup_gate_position",
  "setting_value": {
    "gate_after": "diagnosis" // 또는 "result", "feedback"
  }
}

// Frontend에서 동적으로 게이트 위치 변경
if (adminSettings.gateAfter === 'diagnosis') {
  // 진단 후 가입 강제
} else if (adminSettings.gateAfter === 'result') {
  // 결과 조회 후 가입 강제
}
```

### 7.3 참여 추적 모듈 (비노출)

```typescript
// participation_history 테이블에서 자동 기록
// Phase 2에서 사용자 분석, 재참여율 계산에 활용
await db.insert(participation_history).values({
  user_id: user?.id,
  question_id,
  participated_at: new Date(),
  response_id
});
```

---

## 8. 개발 환경 설정

### 8.1 로컬 개발

```bash
# 환경 변수 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx

# Node 버전
Node.js 18+ 이상

# 패키지 설치
npm install

# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션
npm run start
```

### 8.2 Supabase 로컬 에뮬레이션 (Optional)

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 Supabase 시작
supabase start

# 마이그레이션 실행
supabase migration up
```

---

## 9. 배포 체크리스트

### 9.1 Vercel 배포

- [ ] GitHub 리포지토리 연결
- [ ] 환경 변수 설정 (NEXT_PUBLIC_SUPABASE_URL 등)
- [ ] 빌드 설정 (기본값 사용 가능)
- [ ] 도메인 연결 (custom domain 또는 vercel.app 사용)
- [ ] 관리자 사용자 생성 (Supabase)

### 9.2 Supabase 본프로덕션 설정

- [ ] HTTPS 적용 (자동)
- [ ] 백업 정책 설정 (일일 자동)
- [ ] RLS 정책 검증
- [ ] 최대 연결 풀 크기 조정 (필요시)

### 9.3 모니터링

- [ ] Vercel Analytics 활성화
- [ ] Supabase 로그 확인
- [ ] 에러 추적 (Sentry 또는 유사)

---

## 10. 기술 부채 & 미정 사항

| 항목 | 현재 상태 | Phase |
|------|---------|-------|
| **이메일 서비스** | 미정 (Resend vs SendGrid) | MVP 구현 전 |
| **OG 이미지 저장소** | 메모리 or Supabase Storage | Phase 1 완료 후 |
| **실시간 알림** | Supabase Realtime (학습곡선) | Phase 2 |
| **A/B 테스팅** | 미정 (LaunchDarkly vs 수동) | Phase 2 |
| **분석** | Google Analytics (기본) | Phase 2 |

---

## 11. 테스트 전략

### 11.1 단위 테스트

```typescript
// 예: 진단 스코어 계산 함수
describe('calculateDNAScore', () => {
  it('should normalize scores to 0-100 range', () => {
    const responses = [5, 6, 4];
    const score = calculateDNAScore(responses);
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
```

### 11.2 통합 테스트

```typescript
// 예: 진단 플로우
describe('DNA Diagnosis Flow', () => {
  it('should create session, save responses, and calculate result', async () => {
    const session = await startDiagnosisSession('semi');
    const response = await submitResponse(session.id, question1.id, 5);
    expect(response.status).toBe('success');
  });
});
```

### 11.3 E2E 테스트 (Optional Phase 2)

```typescript
// Playwright 또는 Cypress
describe('User Journey', () => {
  it('should complete diagnosis and share result', async () => {
    await page.goto('/');
    await page.click('Start Diagnosis');
    // ... 진단 완료
    // ... 공유 버튼 클릭
  });
});
```

---

## 12. 로깅 & 모니터링

### 12.1 로그 레벨

| 레벨 | 사용 사례 |
|------|---------|
| ERROR | 데이터베이스 오류, 인증 실패 |
| WARN | 느린 API 응답, 재시도 |
| INFO | 사용자 행동 (로그인, 진단 완료) |
| DEBUG | API 요청/응답 (개발 중만) |

### 12.2 메트릭

```typescript
// 예: 진단 완료 이벤트
logEvent('dna_diagnosis_completed', {
  version: 'semi',
  duration_seconds: 180,
  user_id: user?.id
});

logMetric('dna_diagnosis_score', {
  value: score_p,
  axis: 'P'
});
```

---

## 13. 용어 정의

| 용어 | 정의 |
|------|------|
| **세션** | 하나의 진단 진행 (완료 또는 미완료) |
| **응답** | 개별 문항에 대한 Likert 값 (1~7) |
| **결과** | 계산된 4축 점수 + 페르소나 |
| **공유 토큰** | 결과를 SNS에 공유하기 위한 무작위 ID |
| **익명 응답** | 사용자 신원 없이 질문에 답변 |
| **RLS** | Row Level Security (행 수준 접근 제어) |
| **OG** | Open Graph (메타 태그로 공유 카드 표시) |

---

**문서 상태**: 검토 준비 완료
**다음 단계**: 03-user-flow.md (사용자 플로우) 작성
