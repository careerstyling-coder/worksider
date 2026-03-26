# 02-trd.md: 사전 예약 페이지 기술 요구사항 명세

**프로젝트**: Workside 사전 예약 페이지 (프리론칭)
**버전**: 1.0
**작성일**: 2026-03-25
**상태**: 기술 설계 완료

---

## MVP 캡슐 (10줄)

기술 스택은 기존 Workside와 동일 (Next.js+Supabase+Vercel). 새로운 기능: 예약 DB 테이블 3개 추가 (reservations, invite_tracking, rewards). API 엔드포인트 6개 (예약, 초대, 조회, 관리자). 보안: 이메일 중복 검증 + 초대 코드 위변조 방지 + rate limiting. 성능: 예약폼 3초 이내 제출, OG 이미지 캐싱. 기존 프로젝트와 별도 라우트 그룹(`/prelaunch`) 구성. 개발 시간: 2~3주. 배포 방식: 기존 Vercel 자동 배포.

---

## 1. 기술 스택 (기존 유지)

### 1.1 핵심 스택

| 계층 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **Frontend** | Next.js (App Router) | 15+ | SSR + CSR, OG 이미지 동적 생성 |
| **Language** | TypeScript | 5.x | 타입 안정성 |
| **Styling** | Tailwind CSS | 4.x | 반응형 UI |
| **Database** | Supabase (PostgreSQL) | 최신 | 데이터 저장, 인증 |
| **Auth** | Supabase Auth | - | 사용자 로그인 (기존) |
| **OG Image** | @vercel/og | 최신 | 동적 OG 이미지 생성 |
| **Deployment** | Vercel | - | 배포 및 호스팅 |
| **Email** | Resend (Phase 1.5) | 최신 | 예약 확인 이메일 (선택) |

### 1.2 개발 도구 (기존 유지)

| 분류 | 도구 | 목적 |
|------|------|------|
| **Validation** | Zod | 폼 데이터 검증 |
| **Form** | React Hook Form | 예약 폼 관리 |
| **API Client** | TanStack Query | 데이터 페칭, 캐싱 |
| **ID 생성** | nanoid | 초대 코드 생성 |
| **Testing** | Jest + React Testing Library | 단위/통합 테스트 |

---

## 2. 아키텍처

### 2.1 전체 구조도

```
┌─────────────────────────────────────────────┐
│    Next.js App Router (기존 + 신규)        │
├─────────────────────────────────────────────┤
│ app/                                        │
│ ├─ (public)/                               │
│ │  ├─ page.tsx              (기존)         │
│ │  ├─ auth/                 (기존)         │
│ │  └─ ...                                  │
│ │                                         │
│ ├─ (prelaunch)/            [신규]          │
│ │  ├─ page.tsx             (사전예약 홈)   │
│ │  ├─ reserved/page.tsx    (예약완료)      │
│ │  └─ layout.tsx           (커스텀 레이아웃) │
│ │                                         │
│ ├─ api/                                    │
│ │  ├─ prelaunch/           [신규]          │
│ │  │  ├─ reserve/          (예약 등록)     │
│ │  │  ├─ invite/           (초대 조회)     │
│ │  │  └─ dashboard/        (통계)         │
│ │  ├─ diagnosis/           (기존)         │
│ │  ├─ questions/           (기존)         │
│ │  └─ ...                                 │
│ │                                         │
│ ├─ (private)/              (기존)         │
│ │  └─ ...                                 │
│ │                                         │
│ └─ admin/                  (기존, 탭 추가) │
│    └─ api/admin/prelaunch/ [신규]         │
│       └─ dashboard/                       │
│                                           │
└─────────────────────────────────────────────┘
           ↓ (HTTPS)
┌─────────────────────────────────────────────┐
│   Supabase (PostgreSQL + Auth)             │
│  ├─ reservations          [신규]           │
│  ├─ invite_tracking       [신규]           │
│  ├─ rewards               [신규]           │
│  ├─ users                 (기존)           │
│  ├─ dna_sessions          (기존)           │
│  └─ ...                   (기존)           │
│                                           │
│  RLS Policies (신규 테이블)               │
└─────────────────────────────────────────────┘
```

### 2.2 렌더링 전략

| 페이지 | 방식 | 캐시 | 이유 |
|--------|------|------|------|
| `/prelaunch` (홈) | SSG | 3600s | 정적 콘텐츠 |
| `/prelaunch/reserved` | CSR | 없음 | 동적 초대 링크 |
| `/?ref={code}` | SSR | 없음 | OG 이미지 동적 생성 |
| `/admin/prelaunch` | CSR | 300s | 관리자 대시보드 (캐시 짧음) |

---

## 3. 데이터베이스 설계

### 3.1 신규 테이블

#### reservations (예약)
```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 사용자 정보
  email VARCHAR(255) NOT NULL,
  industry VARCHAR(100), -- 직군
  experience_years VARCHAR(50), -- 연차

  -- 순번 (생성 순서)
  queue_position INT GENERATED ALWAYS AS IDENTITY,

  -- 초대 정보
  invite_code VARCHAR(255) UNIQUE NOT NULL, -- nanoid
  invited_by_id UUID REFERENCES reservations(id) ON DELETE SET NULL,

  -- 상태
  status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'confirmed'
    CHECK (status IN ('pending', 'confirmed')),

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ip_address INET -- 중복 예약 방지
);

CREATE UNIQUE INDEX idx_reservations_email ON reservations(email);
CREATE INDEX idx_reservations_invite_code ON reservations(invite_code);
CREATE INDEX idx_reservations_created_at ON reservations(created_at);
CREATE INDEX idx_reservations_invited_by ON reservations(invited_by_id);
```

**설명**:
- `queue_position`: 예약 순번 (자동 증가)
- `invite_code`: nanoid 기반 초대 링크
- `invited_by_id`: 자신을 초대한 사람 (self-reference)
- `status`: 이메일 인증 완료 후 'confirmed'로 변경 (미정)

---

#### invite_tracking (초대 추적)
```sql
CREATE TABLE invite_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 초대자
  inviter_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,

  -- 피초대자
  invitee_id UUID REFERENCES reservations(id) ON DELETE CASCADE,

  -- 초대 링크 정보
  invite_code VARCHAR(255) NOT NULL REFERENCES reservations(invite_code),
  link_clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP,

  -- 결과
  converted BOOLEAN DEFAULT FALSE, -- 실제 예약 여부
  converted_at TIMESTAMP,

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invite_tracking_inviter_id ON invite_tracking(inviter_id);
CREATE INDEX idx_invite_tracking_invitee_id ON invite_tracking(invitee_id);
CREATE INDEX idx_invite_tracking_invite_code ON invite_tracking(invite_code);
CREATE INDEX idx_invite_tracking_converted ON invite_tracking(converted);
```

**설명**:
- `link_clicked`: 초대 링크 클릭 추적
- `converted`: 클릭 후 실제 예약 여부
- 초대 전환율 계산: SUM(converted) / SUM(link_clicked)

---

#### rewards (리워드)
```sql
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 예약자
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,

  -- 리워드 정보
  type VARCHAR(50) NOT NULL -- 'early_adopter_badge', 'priority_access'
    CHECK (type IN ('early_adopter_badge', 'priority_access')),

  -- 상태
  status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'unlocked', 'redeemed'
    CHECK (status IN ('pending', 'unlocked', 'redeemed')),

  -- 조건
  invite_success_count INT DEFAULT 0, -- 현재 초대 성공 수
  required_count INT DEFAULT 5, -- 필요 성공 수 (5명)

  -- 타이밍
  unlocked_at TIMESTAMP, -- 조건 충족 시점
  redeemed_at TIMESTAMP, -- 4주 후 본 서비스 시작 시 자동

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rewards_reservation_id ON rewards(reservation_id);
CREATE INDEX idx_rewards_status ON rewards(status);
CREATE INDEX idx_rewards_unlocked_at ON rewards(unlocked_at);
```

**설명**:
- `type`: 얼리어답터 배지 + 우선 접근 (2가지 리워드)
- `invite_success_count`: 실시간 초대 성공 수 (트리거로 자동 업데이트)
- `required_count`: 5명 (고정)

---

### 3.2 기존 테이블 수정 (선택)

#### users 테이블 (기존)
```sql
-- 사전 예약 연동용 컬럼 추가 (선택)
ALTER TABLE users ADD COLUMN reservation_id UUID REFERENCES reservations(id);
-- 목적: 사전 예약 후 본 가입 시 연결
```

---

### 3.3 인덱스 전략

```sql
-- 조회 성능 (초대 전환율 계산)
CREATE INDEX idx_reservations_status_created
  ON reservations(status, created_at DESC);

-- 초대 성공 수 집계
CREATE INDEX idx_invite_tracking_converted_created
  ON invite_tracking(converted, created_at DESC);

-- 대시보드 지표
CREATE INDEX idx_reservations_industry_experience
  ON reservations(industry, experience_years);
```

---

### 3.4 Row Level Security (RLS) - 신규 테이블

```sql
-- reservations: 자신의 예약만 조회
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservation" ON reservations FOR SELECT
  USING (email = auth.email()); -- 또는 JWT 클레임 기반

-- invite_tracking: 초대자만 자신의 초대 현황 조회
ALTER TABLE invite_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviters can view own tracking" ON invite_tracking FOR SELECT
  USING (inviter_id IN (
    SELECT id FROM reservations WHERE email = auth.email()
  ));

-- rewards: 자신의 리워드만 조회
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards" ON rewards FOR SELECT
  USING (reservation_id IN (
    SELECT id FROM reservations WHERE email = auth.email()
  ));

-- admin_settings: 관리자 대시보드 조회용
-- 기존 정책 활용
```

---

## 4. API 엔드포인트 (신규)

### 4.1 예약 API

| 메서드 | 경로 | 기능 | 인증 |
|--------|------|------|------|
| POST | `/api/prelaunch/reserve` | 예약 등록 (이메일+직군+연차) | 불필요 |
| GET | `/api/prelaunch/reserve/:email` | 예약 확인 (순번, 초대코드) | 불필요 |

**POST /api/prelaunch/reserve**
```json
// Request
{
  "email": "user@example.com",
  "industry": "IT",
  "experience_years": "4~5년차"
}

// Response (성공)
{
  "success": true,
  "data": {
    "id": "uuid",
    "queue_position": 123,
    "invite_code": "V1StGXR_Z5j3eK5t2nK6",
    "created_at": "2026-03-25T..."
  }
}

// Response (이메일 중복)
{
  "success": false,
  "error": "already_registered",
  "message": "이미 예약하신 이메일입니다"
}
```

**Validation**:
- 이메일 형식 (Zod)
- 이메일 중복 검사 (DB 쿼리)
- 직군 옵션 검증
- Rate limiting: IP별 10회/시간

---

### 4.2 초대 API

| 메서드 | 경로 | 기능 | 인증 |
|--------|------|------|------|
| POST | `/api/prelaunch/invite/track` | 초대 링크 클릭 추적 | 불필요 |
| GET | `/api/prelaunch/invite/:invite_code` | 초대 정보 조회 | 불필요 |

**POST /api/prelaunch/invite/track**
```json
// Request
{
  "invite_code": "V1StGXR_Z5j3eK5t2nK6"
}

// Response
{
  "success": true,
  "data": {
    "inviter_email": "friend@example.com",
    "inviter_name": "OO",
    "invite_message": "OO님이 초대했어요"
  }
}
```

**GET /api/prelaunch/invite/{email}**
```json
// Request: 현재 로그인된 사용자의 초대 현황
// Response
{
  "success": true,
  "data": {
    "total_invites": 3,
    "successful_invites": 1,
    "pending_invites": 2,
    "reward_status": "pending" // pending, unlocked, redeemed
  }
}
```

---

### 4.3 관리자 대시보드 API

| 메서드 | 경로 | 기능 | 인증 |
|--------|------|------|------|
| GET | `/api/admin/prelaunch/dashboard` | 통계 조회 | Admin 필요 |
| GET | `/api/admin/prelaunch/reservations` | 예약 목록 (필터) | Admin 필요 |
| GET | `/api/admin/prelaunch/top-inviters` | 상위 초대자 랭킹 | Admin 필요 |

**GET /api/admin/prelaunch/dashboard**
```json
{
  "success": true,
  "data": {
    "total_reservations": 500,
    "invite_conversion_rate": 22.5,
    "top_inviter_count": 45,
    "early_adopter_badge_count": 98,
    "daily_stats": [
      { "date": "2026-03-25", "count": 50 },
      { "date": "2026-03-26", "count": 75 }
    ],
    "industry_distribution": {
      "IT": 180,
      "Finance": 120,
      "Marketing": 100,
      ...
    }
  }
}
```

---

## 5. 보안 & 검증

### 5.1 입력 검증

```typescript
// Zod 스키마
const ReservationSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  industry: z.enum(['IT', '금융', '제조', ...], {
    errorMap: () => ({ message: '유효한 직군을 선택하세요' })
  }),
  experience_years: z.enum(['1년차', '2~3년차', ...])
});
```

### 5.2 이메일 중복 방지

```sql
-- 데이터베이스 레벨 UNIQUE 제약
UNIQUE(email)

-- 애플리케이션 레벨 (API 응답)
if (existing_email) {
  return { success: false, error: 'already_registered' }
}
```

### 5.3 초대 코드 보안

```typescript
// nanoid로 비예측 코드 생성
import { nanoid } from 'nanoid';
const inviteCode = nanoid(21); // 1.5 * 10^31 가지

// Rate limiting
const rateLimiter = new RateLimiter({
  windowMs: 60000, // 1분
  maxRequests: 10, // IP당 10회/분
});
```

### 5.4 CORS & 헤더

```typescript
// Next.js API 라우트에서 CORS 헤더 설정
response.headers.set('Access-Control-Allow-Origin', 'https://workside.day');
response.headers.set('Content-Security-Policy', '...');
response.headers.set('X-Content-Type-Options', 'nosniff');
```

---

## 6. 성능 요구사항

### 6.1 응답 시간

| 엔드포인트 | 목표 |
|-----------|------|
| POST /api/prelaunch/reserve | < 200ms |
| GET /api/prelaunch/invite/:code | < 100ms |
| GET /api/admin/prelaunch/dashboard | < 500ms |
| `/prelaunch` 페이지 로드 | < 2s |
| OG 이미지 생성 | < 1s |

### 6.2 동시성

| 지표 | 목표 |
|-----|------|
| 동시 예약 요청 | 50 이상 |
| 초당 요청 (RPS) | 100+ |
| DB 연결 풀 | 20 (Supabase 기본) |

### 6.3 캐싱 전략

```typescript
// OG 이미지 캐싱
headers.set('Cache-Control', 'public, max-age=86400');

// 대시보드 데이터 캐싱 (5분)
await cache('prelaunch-dashboard', () => fetchDashboard(), {
  revalidate: 300
});
```

---

## 7. OG 이미지 동적 생성

```typescript
// route.ts
import { ImageResponse } from '@vercel/og';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const inviterName = searchParams.get('name') || '친구';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 60,
          backgroundColor: '#f3f4f6',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div>
          {inviterName}님이 초대했어요 📬
          <div style={{ fontSize: 32 }}>
            당신의 업무 스타일을 먼저 확인해보세요
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

---

## 8. 기존 프로젝트와의 통합

### 8.1 라우트 구조

```
app/
├─ (public)/page.tsx        → /          (기존 홈)
├─ (prelaunch)/page.tsx      → /prelaunch (사전예약 홈) [신규]
├─ (prelaunch)/reserved/... → /prelaunch/reserved (예약완료) [신규]
└─ (private)/...            → 기존 경로 (가입 후)
```

### 8.2 공유 컴포넌트

```typescript
// 기존 디자인 시스템 활용
import { Button, Input, Card } from '@/components/ui';

// 신규 컴포넌트만 추가
import { InviteProgressBar } from '@/components/prelaunch';
import { ReservationForm } from '@/components/prelaunch';
```

### 8.3 서비스 로직 공유

```typescript
// 기존 Supabase 클라이언트 재사용
import { supabase } from '@/lib/supabase';

// 신규 로직 추가
export async function reserveEmail(email: string, industry: string) {
  const { data, error } = await supabase
    .from('reservations')
    .insert([{ email, industry, invite_code: nanoid() }]);
  return { data, error };
}
```

---

## 9. 배포 & 환경 설정

### 9.1 환경 변수

```env
# 기존 (변경 없음)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 신규 (선택)
PRELAUNCH_MAX_RESERVATIONS=500
PRELAUNCH_REWARD_THRESHOLD=5
PRELAUNCH_INVITE_CONVERSION_TARGET=0.20
```

### 9.2 Vercel 배포

```bash
# 기존 배포 명령어 그대로
npm run build
npm run start

# 또는 GitHub 푸시로 자동 배포
git push origin main
```

### 9.3 데이터베이스 마이그레이션

```bash
# Supabase 마이그레이션 파일 생성
supabase migration new add_prelaunch_tables

# SQL 파일에 신규 테이블 정의
-- migrations/001_prelaunch_tables.sql
CREATE TABLE reservations (...)
CREATE TABLE invite_tracking (...)
CREATE TABLE rewards (...)

# 마이그레이션 실행
supabase migration up
```

---

## 10. 모니터링 & 로깅

### 10.1 주요 이벤트 로깅

```typescript
// 예약 성공
logEvent('prelaunch_reservation_created', {
  email: user_email,
  industry: industry,
  queue_position: position
});

// 초대 링크 클릭
logEvent('prelaunch_invite_clicked', {
  invite_code: code,
  timestamp: now()
});

// 초대 전환 완료
logEvent('prelaunch_invite_converted', {
  inviter_email: inviter,
  invitee_email: invitee
});
```

### 10.2 대시보드 모니터링

```typescript
// 5분마다 자동 새로고침
useEffect(() => {
  const interval = setInterval(() => fetchDashboard(), 300000);
  return () => clearInterval(interval);
}, []);
```

---

## 11. 테스트 전략

### 11.1 단위 테스트

```typescript
describe('Reserve Email', () => {
  it('should create reservation with valid email', async () => {
    const result = await reserveEmail('test@example.com', 'IT');
    expect(result.success).toBe(true);
    expect(result.data.invite_code).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    await reserveEmail('test@example.com', 'IT');
    const result = await reserveEmail('test@example.com', 'IT');
    expect(result.error.code).toBe('already_registered');
  });
});
```

### 11.2 통합 테스트

```typescript
describe('Invite Flow', () => {
  it('should track invite click and conversion', async () => {
    const inviter = await reserveEmail('inviter@test.com', 'IT');
    const clicked = await trackInviteClick(inviter.data.invite_code);
    expect(clicked.success).toBe(true);

    const invitee = await reserveEmail('invitee@test.com', 'Finance', {
      invited_by: inviter.data.invite_code
    });
    expect(invitee.success).toBe(true);

    const conversion = await getConversionRate(inviter.data.id);
    expect(conversion).toBeGreaterThan(0);
  });
});
```

---

## 12. 기술 부채 & 미정 사항

| 항목 | 현재 상태 | 우선순위 |
|------|---------|---------|
| **이메일 인증** | Phase 1 생략 (rate limiting으로 대체) | LOW (2주 후 추가) |
| **자동 이메일 발송** | Resend 연동 (선택) | MEDIUM (Phase 1.5) |
| **실시간 대시보드** | 폴링 방식 (5분마다) | LOW (Realtime은 Phase 2) |
| **초대자 이름 표시** | 익명 (이메일만) | LOW (개인정보 보호) |

---

## 13. 다음 단계

이 문서 완료 후:
1. **03-user-flow.md**: 상세 사용자 시나리오
2. **04-database-design.md**: 전체 DB 스키마 (기존+신규)
3. **05-design-system.md**: 사전 예약 전용 디자인
4. **06-screens.md**: 화면 와이어프레임 & 상태 관리
5. **07-coding-convention.md**: 신규 코드 작성 규칙

## 다음 단계: /screen-spec
API 스펙 및 클라이언트 상태 관리 구조 정의

---

**문서 상태**: 검토 준비 완료
**작성 일시**: 2026-03-25
