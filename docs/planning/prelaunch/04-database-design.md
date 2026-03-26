# 04-database-design.md: 사전 예약 페이지 데이터베이스 설계

**프로젝트**: Workside 사전 예약 페이지 (프리론칭)
**버전**: 1.0
**작성일**: 2026-03-25
**상태**: DB 설계 완료

---

## MVP 캡슐 (10줄)

신규 테이블 3개: reservations (예약자), invite_tracking (초대 추적), rewards (리워드). 기존 users 테이블과는 별도로 운영 (본 가입 이전). 관계도: reservations 1:N invite_tracking, reservations 1:N rewards. 핵심 쿼리: 초대 전환율 계산, 초대자 순번 조회, 직군 분포. 인덱스 전략: 이메일 UNIQUE, invite_code UNIQUE, status/created_at 복합. RLS 정책: 자신의 예약만 조회. 마이그레이션: 3개 SQL 파일. 데이터 보존: 무제한 (분석용). 성능 목표: 조회 < 100ms, 삽입 < 50ms.

---

## 1. 데이터베이스 개요

### 1.1 설계 원칙

- **정규화**: 3NF 준수 (중복 최소화)
- **사용성**: 간단한 쿼리 구조 (조인 최소화)
- **확장성**: 본 서비스(users)와 독립적
- **감사**: created_at, updated_at 자동 기록
- **성능**: 초대 전환율 계산 < 100ms

### 1.2 기존 vs 신규

| 범주 | 기존 | 신규 |
|------|------|------|
| **users** | Supabase Auth 테이블 (4주 후 가입용) | - |
| **reservations** | - | 사전 예약자 (이메일 기반) |
| **invite_tracking** | - | 초대 링크 클릭 & 전환 추적 |
| **rewards** | - | 초대 리워드 상태 |

---

## 2. 신규 테이블 상세 설계

### 2.1 reservations (예약자)

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 기본 정보
  email VARCHAR(255) NOT NULL,
  industry VARCHAR(100), -- 직군 (IT, Finance, ...)
  experience_years VARCHAR(50), -- 연차 (1년차, 2~3년차, ...)

  -- 예약 정보
  queue_position INT GENERATED ALWAYS AS IDENTITY,
  -- 예약된 순서대로 1, 2, 3, ... 자동 증가

  -- 초대 관련
  invite_code VARCHAR(255) NOT NULL UNIQUE,
  -- nanoid(21) 형식
  invited_by_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  -- 자신을 초대한 사람의 예약 ID

  -- 상태
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed')),
  -- pending: 예약됨, confirmed: 이메일 인증 완료 (선택, Phase 2)

  -- 메타데이터
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ip_address INET -- 중복 예약 방지용 (선택)
);

-- 인덱스
CREATE UNIQUE INDEX idx_reservations_email ON reservations(email);
CREATE UNIQUE INDEX idx_reservations_invite_code ON reservations(invite_code);
CREATE INDEX idx_reservations_created_at ON reservations(created_at DESC);
CREATE INDEX idx_reservations_invited_by_id ON reservations(invited_by_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_industry ON reservations(industry);
```

**설명**:
- `id`: UUID (자동 생성)
- `email`: 예약자 이메일 (유일한 식별자)
- `industry`: 직군 선택지 (8가지)
- `experience_years`: 연차 선택지 (5가지)
- `queue_position`: 예약 순번 (자동 증가)
- `invite_code`: 공유용 코드 (nanoid)
- `invited_by_id`: 초대 관계 (self-reference)
- `status`: 예약 상태 (basic, 향후 이메일 인증)
- `ip_address`: 중복 방지 (선택)

---

### 2.2 invite_tracking (초대 추적)

```sql
CREATE TABLE invite_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 초대자
  inviter_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,

  -- 피초대자
  invitee_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  -- NULL이면 아직 예약하지 않은 상태

  -- 초대 링크 정보
  invite_code VARCHAR(255) NOT NULL,
  -- reservations.invite_code와 같은 값 (조인 최적화)

  -- 추적 정보
  link_clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP,

  -- 전환 결과
  converted BOOLEAN DEFAULT FALSE,
  -- 클릭 후 실제 예약 여부
  converted_at TIMESTAMP,

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_invite_tracking_inviter_id ON invite_tracking(inviter_id);
CREATE INDEX idx_invite_tracking_invitee_id ON invite_tracking(invitee_id);
CREATE INDEX idx_invite_tracking_invite_code ON invite_tracking(invite_code);
CREATE INDEX idx_invite_tracking_converted ON invite_tracking(converted);
CREATE INDEX idx_invite_tracking_created_at ON invite_tracking(created_at DESC);
```

**설명**:
- `inviter_id`: 초대를 보낸 사람 (reservations.id)
- `invitee_id`: 초대를 받은 사람 (처음엔 NULL, 예약 후 업데이트)
- `link_clicked`: 초대 링크 클릭 여부 추적
- `converted`: 최종 예약 여부 (초대 전환율 계산)
- 초대 전환율 = SUM(converted) / SUM(link_clicked)

---

### 2.3 rewards (리워드)

```sql
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 예약자
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,

  -- 리워드 종류
  type VARCHAR(50) NOT NULL
    CHECK (type IN ('early_adopter_badge', 'priority_access')),
  -- early_adopter_badge: 얼리어답터 배지
  -- priority_access: 풀 진단 우선 접근

  -- 리워드 상태
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'unlocked', 'redeemed')),
  -- pending: 조건 미달성
  -- unlocked: 조건 달성 (5명 초대)
  -- redeemed: 본 서비스에서 적용됨 (4주 후)

  -- 조건 (초대)
  invite_success_count INT DEFAULT 0, -- 현재 성공 초대 수
  required_count INT DEFAULT 5, -- 필요 성공 수 (5명)

  -- 타이밍
  unlocked_at TIMESTAMP, -- 조건 달성 시점
  redeemed_at TIMESTAMP, -- 본 서비스 적용 시점

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_rewards_reservation_id ON rewards(reservation_id);
CREATE INDEX idx_rewards_status ON rewards(status);
CREATE INDEX idx_rewards_type ON rewards(type);
CREATE INDEX idx_rewards_unlocked_at ON rewards(unlocked_at);
```

**설명**:
- `reservation_id`: 리워드 소유자
- `type`: 2가지 리워드 (배지 + 우선접근)
- `status`: 3가지 상태 (pending → unlocked → redeemed)
- `invite_success_count`: 초대로 인한 신규 예약 수 (실시간 업데이트)
- `required_count`: 리워드 조건 (5명, 고정)
- `unlocked_at`: 5명 도달 시간 기록 (심리학: "이것도 빠르게 달성했어!")

---

## 3. 관계도 (ERD)

```
reservations (예약자)
├─ 1:N → invite_tracking (초대 관계 기록)
├─ 1:N → rewards (리워드)
└─ 1:N → reservations.invited_by_id (자신을 초대한 사람)

invite_tracking (초대 추적)
├─ FK inviter_id → reservations (누가 초대했는가)
└─ FK invitee_id → reservations (누가 초대받았는가)
```

**텍스트 표현**:
```
┌─────────────┐
│reservations │
├─────────────┤
│ id (PK)     │
│ email       │
│ invite_code │
│ invited_by_id (FK self) ← 초대 관계
└─────────────┘
     ↑    ↑
     │    │
     │    └─→ [1:N] ┌──────────────────┐
     │              │ invite_tracking  │
     │              ├──────────────────┤
     │              │ inviter_id (FK)  │
     │              │ invitee_id (FK)  │
     │              │ converted        │
     │              └──────────────────┘
     │
     └─→ [1:N] ┌──────────────┐
              │ rewards      │
              ├──────────────┤
              │ type         │
              │ status       │
              │ unlocked_at  │
              └──────────────┘
```

---

## 4. 핵심 쿼리 패턴

### 4.1 예약 등록

```sql
-- 1. 이메일 중복 확인
SELECT COUNT(*) FROM reservations WHERE email = $1;

-- 2. 예약 삽입
INSERT INTO reservations (email, industry, experience_years, invite_code, status)
VALUES ($1, $2, $3, $4, 'pending')
RETURNING id, queue_position, invite_code;

-- 3. 리워드 초기화
INSERT INTO rewards (reservation_id, type, status, required_count)
VALUES ($5, 'early_adopter_badge', 'pending', 5),
       ($5, 'priority_access', 'pending', 5);

-- 4. 초대 추적 레코드 생성 (초대받은 경우)
INSERT INTO invite_tracking (inviter_id, invitee_id, invite_code, converted, converted_at)
VALUES ($inviter_id, $5, $4, true, NOW());
```

---

### 4.2 초대 전환율 계산

```sql
-- 특정 사용자의 초대 전환율
SELECT
  COUNT(CASE WHEN converted = true THEN 1 END) as successful_invites,
  COUNT(*) as total_invites,
  ROUND(100.0 * COUNT(CASE WHEN converted = true THEN 1 END) / COUNT(*), 1) as conversion_rate
FROM invite_tracking
WHERE inviter_id = $1;

-- 전체 초대 전환율
SELECT
  COUNT(CASE WHEN converted = true THEN 1 END) as successful_invites,
  COUNT(CASE WHEN link_clicked = true THEN 1 END) as total_clicks,
  ROUND(100.0 * COUNT(CASE WHEN converted = true THEN 1 END) /
        NULLIF(COUNT(CASE WHEN link_clicked = true THEN 1 END), 0), 1) as conversion_rate
FROM invite_tracking;
```

---

### 4.3 대시보드 지표

```sql
-- 대시보드 주요 지표
SELECT
  (SELECT COUNT(*) FROM reservations WHERE status = 'confirmed') as total_reservations,
  (SELECT COUNT(*) FROM rewards WHERE status = 'unlocked') as early_adopter_count,
  (SELECT AVG(invite_count) FROM (
    SELECT COUNT(*) as invite_count
    FROM invite_tracking
    WHERE converted = true
    GROUP BY inviter_id
  ) t) as avg_invites_per_user
;

-- 직군별 분포
SELECT
  industry,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM reservations), 1) as percentage
FROM reservations
WHERE status = 'confirmed'
GROUP BY industry
ORDER BY count DESC;

-- 일별 예약 추이
SELECT
  DATE(created_at) as date,
  COUNT(*) as count
FROM reservations
WHERE status = 'confirmed'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

### 4.4 초대 현황 조회 (사용자)

```sql
-- 사용자의 초대 현황
SELECT
  (SELECT COUNT(*) FROM invite_tracking
   WHERE inviter_id = $1 AND converted = true) as successful_invites,
  (SELECT COUNT(*) FROM rewards
   WHERE reservation_id = $1 AND type = 'early_adopter_badge') as badge_status,
  (SELECT status FROM rewards
   WHERE reservation_id = $1 AND type = 'early_adopter_badge' LIMIT 1) as badge_unlock_status
;
```

---

## 5. Row Level Security (RLS)

```sql
-- reservations 테이블 RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 자신의 예약만 조회 가능
CREATE POLICY "Users can view own reservation" ON reservations FOR SELECT
  USING (email = current_user_email()); -- 또는 auth.email()

-- 자신의 예약만 수정 (status만 가능, 나머지 불가)
CREATE POLICY "Users can update own reservation" ON reservations FOR UPDATE
  USING (email = current_user_email())
  WITH CHECK (email = current_user_email());

-- 관리자만 모든 예약 조회
CREATE POLICY "Admin can view all reservations" ON reservations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- invite_tracking 테이블 RLS
ALTER TABLE invite_tracking ENABLE ROW LEVEL SECURITY;

-- 초대자: 자신의 초대 현황만 조회
CREATE POLICY "Inviters can view own tracking" ON invite_tracking FOR SELECT
  USING (inviter_id IN (
    SELECT id FROM reservations WHERE email = current_user_email()
  ));

-- rewards 테이블 RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- 사용자: 자신의 리워드만 조회
CREATE POLICY "Users can view own rewards" ON rewards FOR SELECT
  USING (reservation_id IN (
    SELECT id FROM reservations WHERE email = current_user_email()
  ));
```

---

## 6. 트리거 & 자동화 (선택)

### 트리거: 초대 성공 시 리워드 업데이트

```sql
-- 초대 전환 시 리워드 카운트 증가
CREATE OR REPLACE FUNCTION update_reward_on_invite()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.converted = true AND OLD.converted = false THEN
    UPDATE rewards
    SET invite_success_count = invite_success_count + 1,
        updated_at = NOW()
    WHERE reservation_id = NEW.inviter_id
      AND type = 'early_adopter_badge';

    -- 5명 도달 시 unlocked 상태로 변경
    UPDATE rewards
    SET status = 'unlocked',
        unlocked_at = NOW()
    WHERE reservation_id = NEW.inviter_id
      AND type = 'early_adopter_badge'
      AND invite_success_count >= 5
      AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_reward
AFTER UPDATE ON invite_tracking
FOR EACH ROW
EXECUTE FUNCTION update_reward_on_invite();
```

---

## 7. 마이그레이션 계획

```bash
# 마이그레이션 파일 목록
001_create_prelaunch_tables.sql    # 신규 테이블 3개
002_create_prelaunch_indexes.sql   # 인덱스
003_create_prelaunch_rls.sql       # RLS 정책
004_create_prelaunch_triggers.sql  # 트리거 (선택)
```

**001_create_prelaunch_tables.sql**:
```sql
CREATE TABLE reservations (...)
CREATE TABLE invite_tracking (...)
CREATE TABLE rewards (...)
```

---

## 8. 데이터 보존 & 삭제 정책

| 테이블 | 보존 기간 | 정책 |
|--------|---------|------|
| reservations | 무제한 | 본 서비스 가입 후 users로 이관 |
| invite_tracking | 무제한 | 초대 분석용 영구 보존 |
| rewards | 무제한 | 리워드 이력 추적 |

**GDPR 대응** (향후):
- 사용자 요청 시 하드 삭제 (soft delete 아님)
- Anonymization: 이메일 → hash 처리 (180일 후 자동, 선택)

---

## 9. 성능 최적화

### 9.1 쿼리 최적화

```sql
-- 느린 쿼리 예: 초대 전환율 계산 (개선 전)
SELECT *
FROM invite_tracking
WHERE converted = true
AND created_at > NOW() - INTERVAL 7 DAY;
-- 문제: 인덱스 미활용

-- 개선 후
SELECT *
FROM invite_tracking
WHERE converted = true
  AND created_at > NOW() - INTERVAL 7 DAY
ORDER BY created_at DESC
LIMIT 100;
-- 인덱스: (converted, created_at)
```

### 9.2 성능 목표

| 작업 | 목표 |
|------|------|
| SELECT (조회) | < 100ms |
| INSERT (삽입) | < 50ms |
| UPDATE (업데이트) | < 50ms |
| 대시보드 쿼리 | < 500ms |

---

## 10. 모니터링 & 관리

```sql
-- 테이블 크기 확인
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('reservations', 'invite_tracking', 'rewards')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 느린 쿼리 추적 (Supabase 대시보드)
-- 목표: 평균 응답시간 < 200ms
```

---

## 11. 기존 users 테이블 연동 (Phase 2)

```sql
-- 4주 후, 본 서비스 가입 시
ALTER TABLE users ADD COLUMN reservation_id UUID REFERENCES reservations(id);

-- 사전 예약과 본 가입 연결
UPDATE users SET reservation_id = (
  SELECT id FROM reservations WHERE email = users.email
) WHERE email IN (SELECT email FROM reservations);
```

---

## 12. 다음 단계

이 문서 완료 후:
1. **05-design-system.md**: 사전 예약 UI 컴포넌트
2. **06-screens.md**: 화면 와이어프레임
3. **07-coding-convention.md**: 구현 가이드

## 다음 단계: /screen-spec
Supabase 실제 마이그레이션 코드 및 seed 데이터

---

**문서 상태**: 검토 준비 완료
**작성 일시**: 2026-03-25
