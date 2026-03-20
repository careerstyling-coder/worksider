# 04-database-design.md: 데이터베이스 설계

**프로젝트**: Workside (워크사이드)
**버전**: 1.0
**작성일**: 2026-03-16
**상태**: MVP Phase 1 기획

---

## 1. 데이터베이스 개요

### 1.1 선택 사항
**Supabase (PostgreSQL 기반)**
- 이유: Auth + Database + Realtime 통합, 개인 프로젝트에 무료 티어 충분
- 호스팅: Supabase 클라우드 (자동 백업, HTTPS)
- 접근: Supabase JavaScript 클라이언트 또는 API

### 1.2 데이터 모델 원칙
- **정규화**: 3NF 준수 (중복 최소화)
- **익명성**: 질문 응답 시 사용자 신원 분리
- **감사 추적**: created_at, updated_at 자동 기록
- **확장성**: 모듈화된 테이블 구조 (Phase 2 추가 기능 용이)

---

## 2. 핵심 테이블 설계

### 2.1 users (인증 사용자)

```sql
CREATE TABLE users (
  -- PK
  id UUID PRIMARY KEY DEFAULT auth.uid(),

  -- 프로필
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(100) NOT NULL,

  -- 온보딩 정보
  industry VARCHAR(100),         -- 산업군 (예: IT, 금융, 제조, ...)
  company_size VARCHAR(50),      -- 회사 규모 (S/M/L/XL)

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,

  -- 제약
  CONSTRAINT nickname_length CHECK (length(nickname) >= 2),
  CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**설명**:
- `id`: Supabase Auth에서 자동 생성 (UUID)
- `email`: 로그인 식별자
- `nickname`: 공개 표시명 (필수)
- `industry`, `company_size`: 선택적 온보딩 정보 (필터링용)
- `last_login`: 활성 사용자 판단용

---

### 2.2 dna_sessions (진단 세션)

```sql
CREATE TABLE dna_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 사용자 (선택적 - 비회원도 가능)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- 진단 정보
  version VARCHAR(20) NOT NULL CHECK (version IN ('semi', 'full')),
  status VARCHAR(20) DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  -- 타이밍
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INT CHECK (duration_seconds > 0),

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address INET -- 중복 진단 방지용
);

CREATE INDEX idx_dna_sessions_user_id ON dna_sessions(user_id);
CREATE INDEX idx_dna_sessions_status ON dna_sessions(status);
CREATE INDEX idx_dna_sessions_created_at ON dna_sessions(created_at);
```

**설명**:
- `user_id`: NULL 가능 (비회원 진단 가능)
- `version`: 'semi' (12문항) 또는 'full' (40문항)
- `status`: in_progress → completed (또는 abandoned)
- `duration_seconds`: 진단 소요시간 분석용
- `ip_address`: 비회원 중복 방지 (선택적)

---

### 2.3 dna_questions (진단 질문 마스터)

```sql
CREATE TABLE dna_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 분류
  version VARCHAR(20) NOT NULL CHECK (version IN ('semi', 'full')),
  axis VARCHAR(10) NOT NULL CHECK (axis IN ('P', 'C', 'Pol', 'S')),
  question_type VARCHAR(20) NOT NULL
    CHECK (question_type IN ('behavioral', 'situational', 'value')),

  -- 콘텐츠
  question_text TEXT NOT NULL,

  -- 순서
  display_order INT NOT NULL,

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dna_questions_version ON dna_questions(version);
CREATE INDEX idx_dna_questions_axis ON dna_questions(axis);
CREATE UNIQUE INDEX idx_dna_questions_order ON dna_questions(version, axis, display_order);
```

**설명**:
- `version`: 세미(12개) 또는 풀(40개) 분류
- `axis`: P/C/Pol/S 4축 분류
- `question_type`: 행동형(behavioral)/상황형(situational)/가치형(value)
- `display_order`: 세션 내 표시 순서
- 예: version='semi', axis='P', question_type='behavioral', display_order=1

---

### 2.4 dna_responses (진단 응답)

```sql
CREATE TABLE dna_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 외래키
  session_id UUID NOT NULL REFERENCES dna_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES dna_questions(id) ON DELETE RESTRICT,

  -- 응답
  response_value INT NOT NULL CHECK (response_value BETWEEN 1 AND 7),

  -- 메타
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dna_responses_session_id ON dna_responses(session_id);
CREATE INDEX idx_dna_responses_question_id ON dna_responses(question_id);
CREATE UNIQUE INDEX idx_dna_responses_unique ON dna_responses(session_id, question_id);
```

**설명**:
- `response_value`: Likert 1~7 (1=강력히 동의 안함, 7=강력히 동의)
- UNIQUE 제약: 동일 세션에서 중복 응답 불가
- 세션 삭제 시 응답도 삭제 (CASCADE)

---

### 2.5 dna_results (계산된 결과)

```sql
CREATE TABLE dna_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 외래키 (Unique)
  session_id UUID UNIQUE NOT NULL REFERENCES dna_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- 정규화된 점수 (0-100)
  score_p INT CHECK (score_p BETWEEN 0 AND 100),
  score_c INT CHECK (score_c BETWEEN 0 AND 100),
  score_pol INT CHECK (score_pol BETWEEN 0 AND 100),
  score_s INT CHECK (score_s BETWEEN 0 AND 100),

  -- 분류
  persona_label VARCHAR(100),
  -- '실무형 전문가', '조직형 정치인', '관계형 촉매자', '자율형 독립가',
  -- '전략적 성과자', '안정적 조력자'

  -- 공유
  share_token VARCHAR(255) UNIQUE NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  share_count INT DEFAULT 0,

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dna_results_user_id ON dna_results(user_id);
CREATE INDEX idx_dna_results_share_token ON dna_results(share_token);
CREATE INDEX idx_dna_results_created_at ON dna_results(created_at);
```

**설명**:
- `share_token`: nanoid (21자) - 비예측 공유 링크용
- `persona_label`: 계산된 페르소나 이름
- `is_shared`, `share_count`: 공유 행동 추적
- `user_id`: NULL 가능 (비회원 진단)

---

### 2.6 questions (커뮤니티 질문)

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 콘텐츠
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- 유형
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('single', 'multiple')),
  -- 'single': 하나 선택 (이진 또는 3~5지선다)
  -- 'multiple': 여러 질문 연쇄 (설문형)

  -- 상태
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'closed')),
  published_at TIMESTAMP,
  closed_at TIMESTAMP,

  -- 관리자
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_created_by ON questions(created_by);
CREATE INDEX idx_questions_published_at ON questions(published_at DESC);
```

**설명**:
- `question_type`: 'single' (1회성) 또는 'multiple' (설문형)
- `status`: draft → published → closed
- `published_at`: 배포 시간 (트렌딩 정렬용)

---

### 2.7 question_options (선택지)

```sql
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 외래키
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,

  -- 콘텐츠
  option_text VARCHAR(500) NOT NULL,
  display_order INT NOT NULL,

  -- 메타
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE UNIQUE INDEX idx_question_options_order ON question_options(question_id, display_order);
```

**설명**:
- 하나의 질문에 여러 선택지
- `display_order`: 노출 순서

---

### 2.8 question_responses (사용자 응답)

```sql
CREATE TABLE question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 외래키
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL이면 비회원
  option_id UUID NOT NULL REFERENCES question_options(id) ON DELETE RESTRICT,

  -- DNA 정보 (익명화)
  dna_persona VARCHAR(100), -- 사용자 페르소나 (익명 보장)

  -- 메타
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_question_responses_question_id ON question_responses(question_id);
CREATE INDEX idx_question_responses_user_id ON question_responses(user_id);
CREATE INDEX idx_question_responses_option_id ON question_responses(option_id);
-- 사용자별 중복 응답 방지 (같은 사람이 같은 질문에 두 번 응답 안 함)
CREATE UNIQUE INDEX idx_qr_unique_user ON question_responses(question_id, user_id)
  WHERE user_id IS NOT NULL;
```

**설명**:
- `user_id`: NULL 가능 (비회원 응답)
- `dna_persona`: 응답자의 페르소나 (익명화, 결과 분석용)
- UNIQUE 제약: 회원은 동일 질문에 중복 응답 불가 (비회원 제외)

---

### 2.9 question_suggestions (질문 제안)

```sql
CREATE TABLE question_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 제안자
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 콘텐츠
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,

  -- 상태
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  rejection_reason TEXT,

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_suggestions_user_id ON question_suggestions(user_id);
CREATE INDEX idx_suggestions_status ON question_suggestions(status);
CREATE INDEX idx_suggestions_created_at ON question_suggestions(created_at DESC);
```

**설명**:
- `status`: pending → approved (또는 rejected)
- `approved_by`: 채택을 승인한 관리자 ID
- `rejection_reason`: 반려 사유 (선택적)

---

### 2.10 shout_outs (Shout out 반응)

```sql
CREATE TABLE shout_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 외래키
  suggestion_id UUID NOT NULL REFERENCES question_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),

  -- 제약: 중복 반응 방지
  CONSTRAINT unique_shoutout UNIQUE (suggestion_id, user_id)
);

CREATE INDEX idx_shout_outs_suggestion_id ON shout_outs(suggestion_id);
CREATE INDEX idx_shout_outs_user_id ON shout_outs(user_id);
```

**설명**:
- 사용자가 제안에 응원 표시 (하트 또는 공감)
- UNIQUE: 같은 제안에 중복 Shout out 불가

---

### 2.11 participation_history (참여 이력 추적)

```sql
CREATE TABLE participation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 외래키
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  response_id UUID REFERENCES question_responses(id) ON DELETE SET NULL,

  -- 타이밍
  participated_at TIMESTAMP DEFAULT NOW(),

  -- 메타
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_participation_user_id ON participation_history(user_id);
CREATE INDEX idx_participation_question_id ON participation_history(question_id);
CREATE INDEX idx_participation_participated_at ON participation_history(participated_at DESC);
```

**설명**:
- **용도**: 재참여율 계산, 사용자 분석 (비노출)
- Phase 1부터 자동 기록 (데이터 축적)
- Phase 2에서 "최근 참여", "재참여율" 등으로 활용

---

### 2.12 access_levels (접근 제어)

```sql
CREATE TABLE access_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 설정
  level_name VARCHAR(100) NOT NULL UNIQUE,
  -- 'basic' (비회원), 'user' (회원), 'premium' (유료), 'admin'

  -- 기능 권한 (JSONB)
  features JSONB NOT NULL,
  -- {
  --   "can_view_dna_result": true,
  --   "can_participate_question": true,
  --   "can_view_question_result": true,
  --   "can_suggest_question": true,
  --   "can_shoutout": true,
  --   "can_access_admin": false,
  --   "can_view_pdf_report": false
  -- }

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_access_levels_name ON access_levels(level_name);
```

**설명**:
- **용도**: 모듈화된 접근 제어 (Phase 2 확장용)
- Phase 1: 'basic' (비회원), 'user' (회원), 'admin'
- JSONB로 유연하게 기능 관리

---

### 2.13 admin_settings (관리자 설정)

```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 키-값
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,

  -- 메타
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_settings_key ON admin_settings(setting_key);

-- 초기값 예시:
-- {
--   "setting_key": "signup_gate_position",
--   "setting_value": {"gate_after": "diagnosis"} -- 또는 "result", "question"
-- }
-- {
--   "setting_key": "question_publish_frequency",
--   "setting_value": {"frequency": "twice_per_week"}
-- }
-- {
--   "setting_key": "email_notification_enabled",
--   "setting_value": {"enabled": true}
-- }
```

**설명**:
- **용도**: 동적 설정값 관리
- 관리자 UI에서 변경 가능
- Phase 2: A/B 테스트 등에 활용

---

## 3. 관계 다이어그램 (텍스트 표현)

```
users (인증 사용자)
├── 1:N → dna_sessions (진단 세션)
│         └─ 1:N → dna_responses (응답)
│                  └─ FK: dna_questions
│         └─ 1:1 → dna_results (계산 결과)
├── 1:N → question_responses (질문 응답)
├── 1:N → question_suggestions (질문 제안)
├── 1:N → shout_outs (반응)
└── 1:N → participation_history (참여 이력)

questions (커뮤니티 질문)
├── 1:N → question_options (선택지)
├── 1:N → question_responses (응답)
└── 1:N → participation_history

question_suggestions
├── 1:N → shout_outs
└── FK: users (제안자)
```

---

## 4. Row Level Security (RLS) 정책

### 4.1 users 테이블

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- SELECT: 자신 또는 인증된 사용자가 필드 일부 볼 수 있음
CREATE POLICY "Users can view own data" ON users FOR SELECT
  USING (auth.uid() = id);

-- UPDATE: 자신만 수정
CREATE POLICY "Users can update own profile" ON users FOR UPDATE
  USING (auth.uid() = id);

-- INSERT: 인증 시점에 자동 (Auth에서 처리)
```

### 4.2 dna_results 테이블

```sql
ALTER TABLE dna_results ENABLE ROW LEVEL SECURITY;

-- SELECT: 자신의 결과 또는 공개 공유 링크
CREATE POLICY "Users can view own results" ON dna_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public results via share token" ON dna_results FOR SELECT
  USING (is_shared = true); -- Phase 2: 공개 공유
```

### 4.3 question_responses 테이블

```sql
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;

-- INSERT: 인증된 사용자만 or 비회원 (user_id IS NULL)
CREATE POLICY "Authenticated users can submit response" ON question_responses FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR
    (user_id IS NULL AND (SELECT auth.user() IS NULL))
  );

-- SELECT: 집계 데이터만 조회 (개인 응답 미노출)
CREATE POLICY "View question results only" ON question_responses FOR SELECT
  USING (true); -- 모든 사용자 결과 통계 조회 가능 (개인 응답 숨김)
```

### 4.4 admin_settings 테이블

```sql
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Admin만 접근
CREATE POLICY "Only admins can access settings" ON admin_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND id IN (SELECT id FROM users WHERE email LIKE '%@workside.admin%')
    )
  );
```

---

## 5. 핵심 쿼리 패턴

### 5.1 DNA 진단 완료 및 결과 계산

```sql
-- 1. 진단 완료 표시
UPDATE dna_sessions
SET status = 'completed', completed_at = NOW(), duration_seconds = ?
WHERE id = ? AND status = 'in_progress';

-- 2. 응답 평균 계산 (예: P축)
SELECT AVG(response_value)::INT as avg_score
FROM dna_responses
WHERE session_id = ? AND question_id IN (
  SELECT id FROM dna_questions
  WHERE version = 'semi' AND axis = 'P'
);

-- 3. 점수 정규화 및 결과 저장
INSERT INTO dna_results (session_id, user_id, score_p, score_c, score_pol, score_s, persona_label, share_token)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
```

### 5.2 질문별 응답 집계

```sql
-- 질문별 선택지 분포
SELECT
  qo.option_text,
  COUNT(qr.id) as response_count,
  ROUND(100.0 * COUNT(qr.id) / (SELECT COUNT(*) FROM question_responses WHERE question_id = ?), 1) as percentage
FROM question_options qo
LEFT JOIN question_responses qr ON qo.id = qr.option_id
WHERE qo.question_id = ?
GROUP BY qo.id, qo.option_text
ORDER BY qo.display_order;

-- 유형별 분포 (DNA 페르소나로)
SELECT
  dna_persona,
  COUNT(*) as count
FROM question_responses
WHERE question_id = ? AND dna_persona IS NOT NULL
GROUP BY dna_persona
ORDER BY count DESC;
```

### 5.3 소수 의견 (Minority View) 추출

```sql
-- 특정 선택지에서 다르게 선택한 유형
SELECT
  qr.dna_persona,
  COUNT(*) as minority_count
FROM question_responses qr
WHERE qr.question_id = ?
  AND qr.option_id = ?
  AND qr.dna_persona IN (
    SELECT dna_persona FROM question_responses
    WHERE question_id = ?
    GROUP BY dna_persona
    HAVING COUNT(*) < (SELECT COUNT(*) FROM question_responses WHERE question_id = ?) / 4
  )
GROUP BY qr.dna_persona;
```

### 5.4 재참여율 계산

```sql
-- 1회 참여자 중 2회차도 참여한 비율
WITH first_time_participants AS (
  SELECT DISTINCT user_id
  FROM participation_history
  WHERE participated_at BETWEEN ? AND ?
    AND user_id IS NOT NULL
),
repeat_participants AS (
  SELECT DISTINCT user_id
  FROM participation_history
  WHERE participated_at > ?
    AND user_id IS NOT NULL
    AND user_id IN (SELECT user_id FROM first_time_participants)
)
SELECT
  COUNT(DISTINCT rp.user_id)::FLOAT / COUNT(DISTINCT ftp.user_id) * 100 as repeat_rate_percent
FROM first_time_participants ftp
LEFT JOIN repeat_participants rp ON ftp.user_id = rp.user_id;
```

---

## 6. 인덱싱 전략

### 6.1 조회 성능 (READ-HEAVY)

```sql
-- 자주 사용되는 필터
CREATE INDEX idx_questions_status_published_at
  ON questions(status, published_at DESC);

CREATE INDEX idx_question_responses_question_created
  ON question_responses(question_id, created_at DESC);

-- 대시보드 쿼리
CREATE INDEX idx_users_created_industry
  ON users(created_at DESC, industry);
```

### 6.2 쓰기 최적화 (WRITE-HEAVY)

```sql
-- 삽입이 많은 테이블
-- dna_responses, question_responses는 외래키만 인덱싱 (기본)

-- 일괄 삽입 시 성능
-- - dna_sessions, dna_responses: 배치 INSERT 권장
-- - question_responses: 트랜잭션 처리
```

### 6.3 파티셔닝 (Phase 2+, 대용량 시)

```sql
-- 월별 파티셔닝 (예: question_responses)
CREATE TABLE question_responses_2024_03
  PARTITION OF question_responses
  FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
```

---

## 7. 마이그레이션 계획

### Phase 1 (초기 배포)

```bash
# 1. 기본 테이블 생성
001_create_base_tables.sql

# 2. 인덱스 추가
002_create_indexes.sql

# 3. RLS 정책 활성화
003_enable_rls.sql

# 4. 샘플 DNA 질문 데이터 삽입
004_seed_dna_questions.sql

# 5. 초기 관리자 설정
005_seed_admin_settings.sql
```

### Phase 2 (확장 기능)

```bash
006_add_analytics_tables.sql
007_add_team_management.sql
008_create_partitions.sql
```

---

## 8. 데이터 보존 정책

| 테이블 | 보존 기간 | 정책 |
|--------|---------|------|
| dna_sessions | 무제한 | 분석을 위해 영구 보존 |
| dna_responses | 무제한 | 진단 복원을 위해 보존 |
| dna_results | 무제한 | 사용자 요청 시 내보내기 |
| question_responses | 무제한 | 통계 분석용 보존 |
| participation_history | 무제한 | 재참여율 추적용 |
| users | 무제한 | 계정 활성 여부 추적 |
| admin_settings | 무제한 | 설정 히스토리 (updated_at 참고) |

**GDPR 대응** (향후):
- 사용자 요청 시 데이터 삭제 (하드 삭제, soft delete 아님)
- 자동 익명화 정책 (180일 이상 비활성)

---

## 9. 백업 및 복구

### 9.1 자동 백업
- Supabase: 일일 자동 백업 (최근 30일 유지)
- 수동 백업: pg_dump로 주간 내보내기

### 9.2 복구 계획

```bash
# Supabase 웹 대시보드에서 복구 포인트 선택 후 복구
# 또는 로컬에서 백업 파일로 복구
pg_restore -U postgres -d workside backup.sql
```

---

## 10. 성능 모니터링

### 10.1 쿼리 성능

```sql
-- 느린 쿼리 추적 (Supabase 대시보드)
-- 목표: 평균 응답시간 < 200ms
-- 조회: 100ms, 삽입: 50ms
```

### 10.2 저장소 사용량

```sql
-- 테이블 크기 확인
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 10.3 연결 풀 관리

- Supabase 기본: 20 연결
- 초기 목표: 100 동시 사용자 수용 (충분)
- 필요시: Supabase Pro로 업그레이드

---

## 11. 보안 & 감사

### 11.1 접근 제어
- Supabase Auth: 인증 게이트
- RLS: 행 수준 접근 제어
- 암호화: HTTPS + TLS 1.3

### 11.2 감사 로그
- 자동 `created_at`, `updated_at` 기록
- 민감한 변경 (admin_settings): 별도 로그 테이블 (Phase 2)

### 11.3 데이터 익명화
- DNA 응답: 사용자 신원 제외
- 질문 응답: 페르소나 기반 집계만 노출

---

**문서 상태**: 검토 준비 완료
**다음 단계**: 05-design-system.md (디자인 시스템) 작성
