# 06-screens.md: 사전 예약 페이지 화면 명세

**프로젝트**: Workside 사전 예약 페이지 (프리론칭)
**버전**: 1.0
**작성일**: 2026-03-25
**상태**: 화면 설계 완료

---

## MVP 캡슐 (10줄)

5개 화면 (SCR-1~5): 랜딩, 예약완료, 초대개인화, 예약자대시, 관리자통계. 각 화면은 섹션+컴포넌트+데이터 요구사항 정의. 상태: 로딩/성공/에러/빈상태. 네비게이션: /prelaunch, /prelaunch/reserved, /?ref={code}, /prelaunch/my-reservation, /admin/prelaunch. 와이어프레임: 텍스트 표현 (좌표는 개발 중 Figma로 상세화). 레이아웃: 모바일 우선 (320px~). 상호작용: 클릭, 입력, 스크롤 감지. 데이터 흐름: 폼 → API → DB → 대시보드 실시간 업데이트.

---

## 1. 화면 네비게이션 맵

```
/prelaunch (SCR-1)
├─ 공감 메시지 스크롤
├─ DNA 소개 읽음
├─ 예약 폼 입력
└─ [예약 버튼] → POST /api/prelaunch/reserve
   ↓
/prelaunch/reserved (SCR-2)
├─ 순번 표시
├─ 초대 링크 카드
├─ SNS 공유 버튼
└─ [링크 복사] → 클립보드
   ↓
초대 링크 공유 (카카오톡, Twitter, 이메일)
   ↓
/?ref={code} (SCR-3)
├─ 초대 배너 표시
└─ [예약 폼] → Flow 와동
   ↓
/prelaunch/my-reservation (SCR-4, 로그인 필요)
├─ 내 순번 표시
├─ 초대 현황 진행바
└─ 리워드 상태

/admin/prelaunch (SCR-5, Admin만)
├─ 총 예약 수 카드
├─ 초대 전환율 카드
├─ 직군/연차 차트
└─ 일별 추이 그래프
```

---

## 2. 화면별 상세 설계

### SCR-1: 랜딩 페이지 (`/prelaunch`)

**경로**: `/prelaunch`
**렌더링**: SSG (캐시 3600s)
**사용자**: 신규 방문자, 초대받은 사람

#### 섹션 구조

```
┌────────────────────────────────────┐
│ [Header - 로고/타이틀]              │
├────────────────────────────────────┤
│                                    │
│ [Section 1: HeroSection]           │
│ - 배경: 그래디언트 (amber→blue)    │
│ - 제목: "당신의 일 스타일을 먼저"   │
│ - 부제: "첫 500명을 위한 특별한"   │
│ - 아래 선(divider) 강조            │
│ - CTA 암시: "스크롤하세요"         │
│                                    │
├────────────────────────────────────┤
│                                    │
│ [Section 2: DNAIntroSection]       │
│ - 제목: "Work Style DNA란?"        │
│ - 4축 카드 (2×2 그리드)            │
│   ├─ P (Practice): ⚙️             │
│   ├─ C (Communication): 🤝        │
│   ├─ Pol (Politics): 🎯           │
│   └─ S (Self-leadership): 🚀      │
│ - 각 카드: 아이콘 + 라벨 + 설명    │
│                                    │
├────────────────────────────────────┤
│                                    │
│ [Section 3: ReservationForm]       │
│ - 배경: 흰색 (white)               │
│ - 제목: "지금 예약하기"             │
│ - 폼 필드:                         │
│   ├─ 이메일 (text, required)      │
│   ├─ 직군 (select, required)      │
│   └─ 연차 (select, required)      │
│ - 에러 메시지 영역 (red)           │
│ - 제출 버튼: "지금 예약하기"       │
│                                    │
├────────────────────────────────────┤
│ [Footer - 로고/링크]                │
└────────────────────────────────────┘
```

#### 컴포넌트 목록

| 컴포넌트 | 역할 | 상태 |
|---------|------|------|
| `<Header>` | 상단 네비게이션 | - |
| `<HeroSection>` | 공감 메시지 | - |
| `<DNAIntroSection>` | 4축 설명 | - |
| `<ReservationForm>` | 예약 폼 | idle / loading / success / error |
| `<Footer>` | 하단 정보 | - |

#### 데이터 요구사항

```json
{
  "form": {
    "email": "user@example.com",
    "industry": "IT",
    "experience_years": "4~5년차"
  },
  "api_response": {
    "id": "uuid",
    "queue_position": 123,
    "invite_code": "V1StGXR_Z5j3eK5t2nK6"
  }
}
```

#### 상호작용 & 상태

| 상황 | 상태 | 표시 |
|------|------|------|
| 폼 입력 중 | idle | 일반 버튼 |
| 제출 클릭 | loading | "예약 중..." + 스피너 |
| 성공 | success | `/prelaunch/reserved`로 이동 |
| 이메일 중복 | error | "이미 예약하신 이메일입니다" |
| 네트워크 오류 | error | "오류가 발생했습니다. 다시 시도해주세요" |

---

### SCR-2: 예약 완료 화면 (`/prelaunch/reserved`)

**경로**: `/prelaunch/reserved`
**렌더링**: CSR (데이터 props)
**사용자**: 예약 완료자

#### 섹션 구조

```
┌────────────────────────────────────┐
│ [Header - 로고]                     │
├────────────────────────────────────┤
│                                    │
│ [Section 1: 환영 메시지]            │
│ - 제목: "예약되었습니다! 🎉"        │
│ - 부제: "당신의 업무 스타일을 확인" │
│         "할 준비가 되었습니다"       │
│ - 텍스트: "첫 500명 중 #123번입니다" │
│                                    │
├────────────────────────────────────┤
│                                    │
│ [Section 2: 초대 카드]              │
│ - 배경: 보라 그래디언트             │
│ - 제목: "친구를 초대하세요"         │
│ - 초대 링크 표시 (보호됨, 복사 불가) │
│   "https://workside.day/?ref=xxx"  │
│ - [복사 버튼]                       │
│ - [클립보드 복사 확인 토스트]        │
│                                    │
├────────────────────────────────────┤
│                                    │
│ [Section 3: 초대 진행바]            │
│ - InviteProgressBar (0/5)          │
│ - "5명 초대하면 얼리어답터 배지"    │
│                                    │
├────────────────────────────────────┤
│                                    │
│ [Section 4: 리워드 안내]            │
│ - 카드 1: "얼리어답터 배지 🏆"     │
│ - 카드 2: "풀 진단 우선 접근 🚀"    │
│ - 텍스트: "4주 후 본 서비스 오픈"   │
│                                    │
├────────────────────────────────────┤
│                                    │
│ [Section 5: SNS 공유]               │
│ - SocialShareButtons                │
│   ├─ [카카오톡 공유]                │
│   ├─ [트위터 공유]                  │
│   └─ [인스타그램 복사]              │
│ - 각 버튼 클릭 시 외부 앱/URL 열림  │
│                                    │
├────────────────────────────────────┤
│ [Footer]                            │
└────────────────────────────────────┘
```

#### 컴포넌트 목록

| 컴포넌트 | 역할 | 데이터 |
|---------|------|--------|
| `<WelcomeMessage>` | 예약 축하 | queue_position |
| `<InviteLinkCard>` | 초대 링크 표시 | invite_code |
| `<CopyButton>` | 링크 복사 | clipboard |
| `<InviteProgressBar>` | 진행 상황 | current_count / 5 |
| `<RewardInfo>` | 리워드 설명 | - |
| `<SocialShareButtons>` | SNS 공유 | invite_code, inviter_name |

#### 데이터 요구사항

```json
{
  "reservation": {
    "id": "uuid",
    "email": "user@example.com",
    "queue_position": 123,
    "invite_code": "V1StGXR_Z5j3eK5t2nK6",
    "created_at": "2026-03-25T12:34:56Z"
  },
  "rewards": {
    "invite_success_count": 0,
    "required_count": 5,
    "status": "pending"
  }
}
```

---

### SCR-3: 초대 랜딩 페이지 (`/?ref={code}`)

**경로**: `/?ref={invite_code}` 또는 `/prelaunch?ref={code}`
**렌더링**: SSR (OG 이미지 동적 생성)
**사용자**: 초대받은 사람

#### 섹션 구조

```
┌────────────────────────────────────┐
│ [초대 배너 - 상단]                  │
│ 배경: 주황 (warn), 아이콘: 💌      │
│ 텍스트: "OO님이 초대했어요!"        │
│ 텍스트 크기: 18px, 폰트: 600       │
├────────────────────────────────────┤
│                                    │
│ [HeroSection] ← SCR-1과 동일       │
│ - 공감 메시지                       │
│ - 그래디언트 배경                   │
│                                    │
├────────────────────────────────────┤
│ [DNAIntroSection] ← SCR-1과 동일   │
├────────────────────────────────────┤
│ [ReservationForm] ← SCR-1과 동일   │
│ (단, ?ref={code} 파라미터 포함)    │
├────────────────────────────────────┤
│ [Footer]                            │
└────────────────────────────────────┘
```

#### 주요 차이점

| 항목 | SCR-1 | SCR-3 |
|------|--------|--------|
| 배너 | 없음 | 있음 (초대 안내) |
| 콘텐츠 | 동일 | 동일 |
| 폼 제출 | POST /api/prelaunch/reserve | POST /api/prelaunch/reserve?ref={code} |

#### 데이터 요구사항

```json
{
  "invite_code": "V1StGXR_Z5j3eK5t2nK6",
  "inviter_info": {
    "email": "friend@example.com",
    "queue_position": 45 (선택)
  }
}
```

#### OG 이미지 동적 생성

```
@vercel/og로 다음 정보를 카드로 표시:
- "OO님이 초대했어요"
- 아이콘: 💌
- 버튼: "지금 예약하기"
- 배경: 그래디언트 (주황→파랑)
```

---

### SCR-4: 예약자 대시보드 (`/prelaunch/my-reservation`)

**경로**: `/prelaunch/my-reservation`
**렌더링**: CSR (로그인 필요)
**사용자**: 예약 완료자 (재방문)

#### 섹션 구조

```
┌────────────────────────────────────┐
│ [Header - 로고 + 로그아웃]           │
├────────────────────────────────────┤
│                                    │
│ [Section 1: 내 순번]                │
│ - 큰 숫자: "#123"                  │
│ - 텍스트: "예약 순번"              │
│                                    │
├────────────────────────────────────┤
│                                    │
│ [Section 2: 초대 현황]              │
│ - InviteProgressBar (현재 값)      │
│ - "3/5 (2명 더 초대하면 배지)"      │
│                                    │
├────────────────────────────────────┤
│                                    │
│ [Section 3: 리워드 상태]            │
│ - "배지 상태: 진행중 ⏳"           │
│ - "우선 접근: 진행중 ⏳"           │
│                                    │
├────────────────────────────────────┤
│                                    │
│ [Section 4: 초대 링크 재확인]       │
│ - [링크 복사] 버튼                  │
│ - [SNS 공유] 버튼                   │
│                                    │
├────────────────────────────────────┤
│ [Footer]                            │
└────────────────────────────────────┘
```

#### 컴포넌트 목록

| 컴포넌트 | 역할 | 데이터 |
|---------|------|--------|
| `<QueuePosition>` | 순번 표시 | queue_position |
| `<InviteProgressBar>` | 초대 진행률 | current_count |
| `<RewardStatus>` | 리워드 상태 | status, unlocked_at |
| `<InviteLinkCard>` | 링크 재확인 | invite_code |
| `<SocialShareButtons>` | 공유 CTA | invite_code |

#### 데이터 요구사항

```json
{
  "reservation": {
    "id": "uuid",
    "queue_position": 123,
    "invite_code": "V1StGXR_Z5j3eK5t2nK6"
  },
  "invite_tracking": {
    "successful_invites": 3,
    "total_invites": 5
  },
  "rewards": [
    {
      "type": "early_adopter_badge",
      "status": "pending",
      "invite_success_count": 3,
      "required_count": 5
    }
  ]
}
```

#### 실시간 업데이트

```
초대 성공 시:
1. API: invite_tracking 테이블 업데이트 (converted = true)
2. 클라이언트: InviteProgressBar 값 증가 (3/5 → 4/5)
3. 애니메이션: 진행바 부드럽게 증가 (0.5s)
4. 텍스트 업데이트: "1명 더 초대하면..."
```

---

### SCR-5: 관리자 대시보드 (`/admin/prelaunch`)

**경로**: `/admin/prelaunch` (또는 `/admin`의 탭)
**렌더링**: CSR (관리자만)
**사용자**: 관리자

#### 섹션 구조

```
┌────────────────────────────────────┐
│ [Header - 타이틀 + 필터]             │
│ 기간 선택: [오늘] [이번주] [이번달] │
├────────────────────────────────────┤
│                                    │
│ [지표 카드 그리드 (2×2)]            │
│                                    │
│ [카드 1: 총 예약 수]                │
│ - 큰 숫자: "450"                   │
│ - 라벨: "총 예약"                   │
│ - 추세: "↑ +50 (어제 대비)"         │
│                                    │
│ [카드 2: 초대 전환율]                │
│ - 큰 숫자: "18.5%"                 │
│ - 라벨: "초대 전환율"               │
│ - 추세: "↓ -2.1%"                  │
│                                    │
│ [카드 3: 얼리어답터 배지 획득자]     │
│ - 큰 숫자: "87"                    │
│ - 라벨: "배지 획득"                 │
│ - 추세: "↑ +12"                    │
│                                    │
│ [카드 4: 평균 초대자당 초대]         │
│ - 큰 숫자: "2.1"                   │
│ - 라벨: "평균 초대 수"              │
│                                    │
├────────────────────────────────────┤
│                                    │
│ [차트 1: 일별 예약 추이]            │
│ - 꺾은선 차트 (Chart.js or Recharts) │
│ - X축: 날짜, Y축: 예약 수           │
│                                    │
│ [차트 2: 직군 분포]                 │
│ - 막대 차트                         │
│ - X축: 직군, Y축: 수                │
│ - IT(180), Finance(120), ...      │
│                                    │
│ [차트 3: 연차 분포]                 │
│ - 원형 차트 (pie)                  │
│ - 각 연차 비율 표시                 │
│                                    │
├────────────────────────────────────┤
│                                    │
│ [테이블: 상위 초대자]                │
│ - 순위, 이메일, 초대 수, 전환율     │
│ - 상위 10명 정렬                   │
│                                    │
├────────────────────────────────────┤
│ [CSV 내보내기 버튼]                  │
└────────────────────────────────────┘
```

#### 컴포넌트 목록

| 컴포넌트 | 역할 | 데이터 |
|---------|------|--------|
| `<StatCard>` | 지표 카드 (4개) | value, label, trend |
| `<DailyChart>` | 일별 추이 | date[], count[] |
| `<IndustryChart>` | 직군 분포 | industry[], percentage[] |
| `<ExperienceChart>` | 연차 분포 | years[], count[] |
| `<TopInvitersTable>` | 상위 초대자 | top_10 array |
| `<FilterButtons>` | 기간 필터 | selected_period |

#### 데이터 요구사항

```json
{
  "dashboard": {
    "total_reservations": 450,
    "invite_conversion_rate": 18.5,
    "early_adopter_badge_count": 87,
    "avg_invites_per_user": 2.1,
    "daily_stats": [
      { "date": "2026-03-25", "count": 50 },
      { "date": "2026-03-26", "count": 75 }
    ],
    "industry_distribution": {
      "IT": 180,
      "Finance": 120,
      "Marketing": 100
    },
    "top_inviters": [
      {
        "rank": 1,
        "email": "top@example.com",
        "successful_invites": 12,
        "conversion_rate": 80
      }
    ]
  }
}
```

#### 실시간 업데이트

```
- 5분마다 자동 갱신 (useEffect + setInterval)
- 또는 Supabase Realtime (Phase 2)
```

---

## 3. 화면 간 전환 (Navigation)

```
[SCR-1: 랜딩]
  ├─ 폼 제출 성공
  └─→ [SCR-2: 예약완료]
       ├─ SNS 공유
       └─→ 외부 앱 (카카오톡, Twitter)

[SCR-3: 초대개인화 (?ref)]
  ├─ 폼 제출 성공
  └─→ [SCR-2: 예약완료 (재리다이렉트)]

[SCR-4: 예약자대시]
  ├─ 초대 링크 클릭
  └─→ [SCR-3: 초대개인화]

[SCR-5: 관리자대시]
  ├─ 필터 변경
  └─→ 자체 갱신 (재요청)
```

---

## 4. 에러 & 빈 상태

### 로딩 상태

```
[폼 제출 중]
- 버튼: "예약 중..." + 스피너
- 버튼 비활성화

[대시보드 로드 중]
- 스켈레톤 UI (각 카드별)
- 또는 "데이터 로딩 중..." 메시지
```

### 빈 상태

```
[초대자 없음]
"아직 초대한 친구가 없습니다.
 초대 링크를 복사하여 친구에게 공유해보세요."
 [공유하기 버튼]

[예약 없음 (비로그인)]
"로그인하여 예약 현황을 확인하세요"
[로그인 버튼]
```

### 에러 상태

```
[이메일 중복]
"이미 예약하신 이메일입니다. 로그인하세요"
[내 예약 확인하기] [다른 이메일로 예약]

[네트워크 오류]
"오류가 발생했습니다. 다시 시도해주세요"
[재시도 버튼]

[초대코드 무효]
"유효하지 않은 초대 링크입니다"
[다시 예약하기]
```

---

## 5. 다음 단계

이 문서 완료 후:
1. **07-coding-convention.md**: 신규 코드 작성 규칙

## 다음 단계: /screen-spec
Figma 디자인 파일 생성 (상세 와이어프레임, 컬러, 폰트)

---

**문서 상태**: 검토 준비 완료
**작성 일시**: 2026-03-25
