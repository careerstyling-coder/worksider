# 05-design-system.md: 사전 예약 페이지 디자인 시스템

**프로젝트**: Workside 사전 예약 페이지 (프리론칭)
**버전**: 1.0
**작성일**: 2026-03-25
**상태**: 디자인 설계 완료

---

## MVP 캡슐 (10줄)

기존 Workside 디자인 시스템 (Tailwind, 컬러, 타이포)을 90% 재사용. 사전 예약 전용 무드: 공감(Warmth) + 신뢰(Trust) + 기대감(Excitement). 새로운 컴포넌트 5개: HeroSection(공감), DNAIntroSection(4축 설명), ReservationForm(폼), ReservedPage(예약 완료), InviteProgressBar(진행바). 컬러: 기존 Primary Blue(#0052CC) + Gradient 배경 (따뜻한 톤). 모바일 우선 (직장인이 공유 링크로 접속할 때 최적화). 애니메이션: 부드러운 fade-in + progress bar smooth. 접근성: AAA 명도 대비, 키보드 네비게이션.

---

## 1. 디자인 철학 (사전 예약 특화)

### 1.1 목표
"첫 만남"을 따뜻하고 신뢰감 있게 표현

- **공감**: 사용자의 고민(업무 스타일)을 이해하는 톤
- **신뢰**: 명확한 정보 구조, 안정적인 필드
- **기대감**: 리워드와 초대 진행바로 심리 자극

### 1.2 사용자 맥락
- 공유 링크로 모바일 접속 (SNS, 메시지)
- 업무 중간에 빠르게 확인 (< 30초)
- 직장인 대상 (전문적 톤)

---

## 2. 컬러 팔레트 (기존 + 신규)

### 2.1 기존 Workside 컬러

| 용도 | 색상 | Hex | 사용 |
|------|------|-----|------|
| Primary | 짙은 파랑 | #0052CC | 버튼, 링크 |
| Success | 초록 | #10B981 | 완료 상태 |
| Warning | 주황 | #F59E0B | 주의 상태 |
| Error | 빨강 | #EF4444 | 오류 상태 |

### 2.2 사전 예약 신규 컬러 (따뜻한 톤)

| 용도 | 색상 | Hex | 사용 |
|------|------|-----|------|
| **Warmth** | 따뜻한 주황 | #F97316 | 공감 섹션 배경 |
| **Warmth Bg** | 연한 주황 | #FEF3C7 | HeroSection 배경 (옅음) |
| **Trust** | 부드러운 파랑 | #3B82F6 | CTA 버튼, 진행바 |
| **Excitement** | 보라 | #8B5CF6 | 리워드 배지, 강조 |

### 2.3 그래디언트 (Hero)

```css
background: linear-gradient(
  135deg,
  #FEF3C7 0%,    /* 연한 주황 */
  #FED7AA 50%,   /* 중간 주황 */
  #E3F2FF 100%   /* 연한 파랑 */
);
```

**의도**: 따뜻함(황) → 신뢰(파랑)로의 자연스러운 전이

---

## 3. 타이포그래피 (기존 유지)

### 3.1 폰트

```css
/* 한글 */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* 영문 */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### 3.2 스케일 (기존 유지)

| 레벨 | 크기 | 굵기 | 사용 |
|------|------|------|------|
| H1 | 32px | 700 | 페이지 제목 ("당신의 일 스타일을...") |
| H2 | 28px | 700 | 섹션 제목 ("DNA란?") |
| H3 | 24px | 600 | 서브 섹션 ("4가지 축") |
| Body | 16px | 400 | 일반 본문 |
| Body Small | 14px | 400 | 라벨, 설명 |
| Caption | 12px | 500 | 진행바 텍스트 (0/5) |

---

## 4. 공간 (Spacing, 기존 유지)

```
xs = 4px,  sm = 8px,  md = 12px,  lg = 16px,  xl = 24px,  2xl = 32px
```

**적용**:
- 카드: p-6 (24px)
- 버튼: px-4 py-3 (16px × 12px)
- 입력 필드: px-3 py-2 (12px × 8px)
- 섹션 간격: my-12 (48px)

---

## 5. 새로운 컴포넌트 (사전 예약 전용)

### 5.1 HeroSection

**목표**: 첫 인상, 공감 형성

```tsx
export function HeroSection() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-amber-100 via-amber-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          당신의 일 스타일을
          <br />
          먼저 알아보세요
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          10년의 비즈니스 코칭 경험을 바탕으로 한
          <br />
          당신만의 업무 스타일 진단
        </p>
        <p className="text-sm text-gray-600 mb-12">
          첫 500명을 위한 특별한 기회
        </p>
        <div className="h-1 w-20 bg-orange-400 mx-auto mb-8" />
      </div>
    </section>
  );
}
```

**특징**:
- 그래디언트 배경 (따뜻함)
- 큰 제목 (H1)
- 선(divider) 강조

---

### 5.2 DNAIntroSection

**목표**: 4축 설명, 신뢰 구축

```tsx
export function DNAIntroSection() {
  const axes = [
    {
      axis: 'P',
      label: 'Practice (실무)',
      description: '업무 전문성과 실행력',
      icon: '⚙️'
    },
    {
      axis: 'C',
      label: 'Communication (관계)',
      description: '팀원 협력과 관계 형성',
      icon: '🤝'
    },
    {
      axis: 'Pol',
      label: 'Politics (영향력)',
      description: '조직 내 영향력과 의사결정',
      icon: '🎯'
    },
    {
      axis: 'S',
      label: 'Self-leadership (자율)',
      description: '자율성과 독립적 주도성',
      icon: '🚀'
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Work Style DNA란?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {axes.map((item) => (
            <div key={item.axis} className="bg-gray-50 p-6 rounded-lg">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {item.label}
              </h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**특징**:
- 4축 카드 (2×2 그리드, 모바일은 1×4)
- 아이콘 + 라벨 + 설명
- 깔끔한 정보 구조

---

### 5.3 ReservationForm

**목표**: 빠른 입력, 검증

```tsx
export function ReservationForm() {
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [years, setYears] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const industries = [
    'IT', 'Finance', 'Manufacturing', 'Education',
    'Communications', 'Marketing', 'Other'
  ];

  const experienceYears = [
    '1년차', '2~3년차', '4~5년차', '6~10년차', '10년 이상'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/prelaunch/reserve', {
        method: 'POST',
        body: JSON.stringify({ email, industry, experience_years: years })
      });

      if (res.ok) {
        // Redirect to /prelaunch/reserved
        window.location.href = '/prelaunch/reserved';
      } else {
        const data = await res.json();
        setError(data.message || '오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          지금 예약하기
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              직군
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택하세요</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연차
            </label>
            <select
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택하세요</option>
              {experienceYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '예약 중...' : '지금 예약하기'}
          </button>
        </form>
      </div>
    </section>
  );
}
```

**특징**:
- 3개 필드 (이메일, 직군, 연차)
- 유효성 검증
- 로딩 상태
- 에러 메시지

---

### 5.4 InviteProgressBar

**목표**: 초대 진행 상황 시각화

```tsx
export function InviteProgressBar({
  currentCount,
  targetCount = 5
}: {
  currentCount: number;
  targetCount?: number;
}) {
  const percentage = Math.min((currentCount / targetCount) * 100, 100);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          초대 진행률
        </h3>
        <span className="text-2xl font-bold text-purple-600">
          {currentCount}/{targetCount}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage === 100 ? (
        <p className="text-sm text-green-600 font-medium">
          ✓ 얼리어답터 배지 획득 완료!
        </p>
      ) : (
        <p className="text-sm text-gray-600">
          {targetCount - currentCount}명 더 초대하면 배지를 얻습니다
        </p>
      )}
    </div>
  );
}
```

**특징**:
- 진행 상황 시각화 (0/5 → 5/5)
- 부드러운 애니메이션
- 성공 상태 표시

---

### 5.5 SocialShareButtons

**목표**: SNS 공유 CTA

```tsx
export function SocialShareButtons({
  inviteCode,
  inviterName
}: {
  inviteCode: string;
  inviterName: string;
}) {
  const shareUrl = `https://workside.day/?ref=${inviteCode}`;
  const shareMessage = `${inviterName}님이 당신의 업무 스타일을 확인해보라고 초대했어요! 🎯`;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedMessage = encodeURIComponent(shareMessage);

    switch (platform) {
      case 'kakao':
        // Kakao Share API
        window.location.href = `https://story.kakao.com/?post=${encodedUrl}`;
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
          '_blank'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('링크가 복사되었습니다!');
        break;
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">친구에게 공유하세요</p>
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleShare('kakao')}
          className="flex items-center justify-center py-3 bg-yellow-300 text-gray-900 rounded-lg font-medium hover:bg-yellow-400"
        >
          카카오톡
        </button>
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center justify-center py-3 bg-blue-400 text-white rounded-lg font-medium hover:bg-blue-500"
        >
          트위터
        </button>
        <button
          onClick={() => handleShare('copy')}
          className="flex items-center justify-center py-3 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400"
        >
          복사
        </button>
      </div>
    </div>
  );
}
```

---

## 6. 반응형 디자인

### 6.1 Breakpoints

| 기기 | 너비 | Tailwind |
|------|------|---------|
| Mobile | < 640px | 기본 |
| Tablet | 640px - 1024px | sm/md |
| Desktop | ≥ 1024px | lg/xl |

### 6.2 모바일 우선 조정

```tsx
// Hero 섹션
<h1 className="text-3xl md:text-4xl lg:text-5xl">
  {/* 모바일: 32px, 태블릿: 40px, 데스크톱: 56px */}
</h1>

// 4축 그리드
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* 모바일: 1 컬럼, 태블릿+: 2 컬럼 */}
</div>

// 폼 너비
<div className="max-w-xl mx-auto px-4">
  {/* 모바일: 풀 너비 (px-4), 데스크톱: 최대 640px */}
</div>
```

---

## 7. 애니메이션

### 7.1 진행바 (Progress Bar)

```css
.progress-fill {
  transition: width 0.5s ease-out;
}
```

**의도**: 초대 성공 시 부드럽게 증가

### 7.2 페이드 인 (Fade In)

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-in-out;
}
```

**의도**: 페이지 로드 시 자연스러운 전개

---

## 8. 접근성 (A11y)

### 8.1 색상 대비

- 모든 텍스트: AAA 기준 (7:1) 이상
- 텍스트 색상: 흰색(#FFF) on 파랑(#0052CC) = 12:1 ✓

### 8.2 키보드 네비게이션

```tsx
<input tabIndex={0} />
<select tabIndex={1} />
<button tabIndex={2} />
```

### 8.3 ARIA 라벨

```tsx
<input
  type="email"
  aria-label="이메일 주소"
  aria-required="true"
  aria-invalid={!!error}
/>

<div role="progressbar" aria-valuenow={3} aria-valuemin={0} aria-valuemax={5}>
  {/* 진행바 */}
</div>
```

---

## 9. 폴더 구조 (컴포넌트)

```
components/
├── prelaunch/              [신규]
│   ├── HeroSection.tsx
│   ├── DNAIntroSection.tsx
│   ├── ReservationForm.tsx
│   ├── ReservedPage.tsx
│   ├── InviteProgressBar.tsx
│   ├── SocialShareButtons.tsx
│   ├── MyReservationDashboard.tsx
│   └── index.ts
│
├── ui/                     (기존 재사용)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── ...
│
└── layout/
    ├── Header.tsx
    ├── Footer.tsx
    └── ...
```

---

## 10. 디자인 체크리스트 (Phase 1)

- [ ] HeroSection 배경 그래디언트 정확함
- [ ] DNAIntroSection 4축 카드 반응형 (1×4 → 2×2)
- [ ] ReservationForm 3개 필드 입력/검증 작동
- [ ] ReservedPage 초대 링크 복사 작동
- [ ] InviteProgressBar 실시간 업데이트
- [ ] SocialShareButtons 모든 플랫폼 작동
- [ ] 모바일 < 640px 최적화
- [ ] 모든 요소 AAA 명도 대비 검증
- [ ] 키보드 Tab 네비게이션 가능
- [ ] 로딩 상태 및 에러 메시지 표시

---

## 11. 다음 단계

이 문서 완료 후:
1. **06-screens.md**: 화면 와이어프레임 & 상세 레이아웃
2. **07-coding-convention.md**: 신규 코드 작성 규칙

## 다음 단계: /screen-spec
컴포넌트 상태 관리 & 애니메이션 타이밍 정의

---

**문서 상태**: 검토 준비 완료
**작성 일시**: 2026-03-25
