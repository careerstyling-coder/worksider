# 05-design-system.md: 디자인 시스템

**프로젝트**: Workside (워크사이드)
**버전**: 1.0
**작성일**: 2026-03-16
**상태**: MVP Phase 1 기획

---

## 1. 디자인 철학

### 1.1 목표
직장인 대상 플랫폼이므로 **전문적이면서도 접근성 높은** 설계
- 신뢰도: 명확한 정보 구조, 일관된 간격
- 접근성: 높은 명도 대비, 직관적 네비게이션
- 효율성: 인지 부담 최소화, 최소한의 클릭

### 1.2 대상 사용자 특성
- 나이: 25~40대 직장인
- 기술 리터러시: 중상 (모바일/웹 익숙)
- 맥락: 업무 중간에 빠르게 사용
- 모바일 우선 (공유 링크 → 모바일 접근)

---

## 2. 색상 팔레트

### 2.1 Primary Color System

| 용도 | 색상 | Hex | RGB | 사용 |
|------|------|-----|-----|------|
| **Primary** | 짙은 파랑 | #0052CC | 0, 82, 204 | CTA 버튼, 링크, 강조 |
| **Primary Light** | 밝은 파랑 | #E3F2FF | 227, 242, 255 | 배경 강조, 호버 상태 |
| **Secondary** | 연한 자주 | #6C63FF | 108, 99, 255 | 시각적 보조 요소 |

### 2.2 Status Colors

| 상태 | 색상 | Hex | 사용 |
|------|------|-----|------|
| **Success** | 초록 | #10B981 | 완료, 성공, 제출됨 |
| **Warning** | 주황 | #F59E0B | 주의, 처리 중 |
| **Error** | 빨강 | #EF4444 | 오류, 실패, 경고 |
| **Info** | 하늘 | #3B82F6 | 정보, 팁 |

### 2.3 Neutral Colors

| 레벨 | 색상 | Hex | 사용 |
|------|------|-----|------|
| **Black (Neutral-900)** | 거의 검정 | #111827 | 제목, 본문 |
| **Dark Gray (Neutral-700)** | 어두운 회색 | #374151 | 부제목, 강조 텍스트 |
| **Medium Gray (Neutral-500)** | 중간 회색 | #6B7280 | 안내문, 플레이스홀더 |
| **Light Gray (Neutral-300)** | 밝은 회색 | #D1D5DB | 구분선, 비활성 상태 |
| **Very Light Gray (Neutral-100)** | 매우 밝은 회색 | #F3F4F6 | 배경, 카드 |
| **White** | 흰색 | #FFFFFF | 베이스 배경, 카드 |

### 2.4 DNA 축별 색상 (Radar Chart)

| 축 | 색상 | Hex | 의미 |
|----|------|-----|------|
| **P (Practice)** | 파랑 | #3B82F6 | 실행력 |
| **C (Communication)** | 초록 | #10B981 | 협력 |
| **Pol (Politics)** | 주황 | #F59E0B | 영향력 |
| **S (Self-leadership)** | 보라 | #8B5CF6 | 자율성 |

---

## 3. 타이포그래피

### 3.1 폰트 스택

```css
/* 한글 */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;

/* 영문 */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;

/* Monospace (코드 영역) */
font-family: 'Fira Code', 'Monaco', monospace;
```

**이유**:
- Pretendard: 한글 가독성 우수, 한국 기업 폰트
- Inter: 균형잡힌 영문 산세리프
- 시스템 폰트 폴백: 빠른 로딩

### 3.2 타이포그래피 스케일

| 레벨 | 크기 | 굵기 | 행 높이 | 사용 |
|------|------|------|--------|------|
| **H1** | 32px | 700 (Bold) | 40px | 페이지 제목 |
| **H2** | 28px | 700 | 36px | 섹션 제목 |
| **H3** | 24px | 600 (SemiBold) | 32px | 서브 섹션 |
| **H4** | 20px | 600 | 28px | 카드 제목 |
| **Body Large** | 18px | 400 (Regular) | 28px | 본문 강조 |
| **Body** | 16px | 400 | 24px | 일반 본문 |
| **Body Small** | 14px | 400 | 20px | 보조 텍스트 |
| **Caption** | 12px | 500 (Medium) | 16px | 라벨, 설명 |

### 3.3 타이포그래피 예시

```css
/* Tailwind CSS 기반 */
.h1 { @apply text-4xl font-bold leading-10; }
.h2 { @apply text-3xl font-bold leading-9; }
.h3 { @apply text-2xl font-semibold leading-8; }
.body { @apply text-base font-normal leading-6; }
.caption { @apply text-sm font-medium leading-4; }
```

---

## 4. 공백 (Spacing) 시스템

### 4.1 간격 스케일

```
4px:   xs
8px:   sm
12px:  md
16px:  lg
24px:  xl
32px:  2xl
48px:  3xl
64px:  4xl
```

**Tailwind CSS 매핑**:
```
p-1 = 4px, p-2 = 8px, p-3 = 12px, p-4 = 16px, p-6 = 24px, p-8 = 32px, p-12 = 48px, p-16 = 64px
```

### 4.2 적용 규칙

| 영역 | 패딩 | 마진 | 예시 |
|------|------|------|------|
| **카드** | 24px | 16px (하단) | `.p-6 mb-4` |
| **버튼** | 12px 16px | 8px | `.px-4 py-3 mb-2` |
| **입력 필드** | 12px | 16px (하단) | `.px-3 py-2 mb-4` |
| **섹션** | - | 48px (상단/하단) | `.my-12` |
| **컴포넌트** | 변함 | 변함 | 컴포넌트마다 정의 |

---

## 5. 보더 & 라운더

### 5.1 보더 반지름

| 크기 | 값 | 사용 |
|------|-----|------|
| **None** | 0 | 날카로운 모서리 (사용 최소화) |
| **Small** | 4px | 입력 필드, 작은 요소 |
| **Medium** | 8px | 버튼, 카드 |
| **Large** | 12px | 모달, 큰 컴포넌트 |
| **Full** | 9999px | 원형 (아바타, 배지) |

**Tailwind CSS**:
```
rounded-none: 0, rounded-sm: 4px, rounded: 8px, rounded-lg: 12px, rounded-full: 50%
```

### 5.2 보더 스타일

| 유형 | 두께 | 색상 | 사용 |
|------|------|------|------|
| **Divider** | 1px | #D1D5DB (Neutral-300) | 섹션 구분 |
| **Input Border** | 1px | #D1D5DB | 기본 상태 |
| **Input Focus** | 2px | #0052CC | 포커스 상태 |
| **Card Shadow** | - | rgba(0,0,0,0.05) | 카드 깊이 |

---

## 6. 그림자 (Elevation)

### 6.1 그림자 레벨

```css
/* Tailwind CSS */
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
```

### 6.2 사용 가이드

| 요소 | 그림자 레벨 | 상황 |
|------|-----------|------|
| **카드** | shadow-md | 정상 상태 |
| **카드 (호버)** | shadow-lg | 마우스 오버 |
| **모달** | shadow-xl | 포커스된 오버레이 |
| **드롭다운** | shadow-lg | 열렸을 때 |
| **일반 UI** | shadow-sm 또는 none | 미니멀 디자인 |

---

## 7. 컴포넌트 명세

### 7.1 Button

```tsx
// 종류
- Primary (파랑): CTA, 주요 행동
- Secondary (흰색 + 보더): 대체 행동
- Tertiary (텍스트): 낮은 우선순위
- Danger (빨강): 삭제, 위험한 행동

// 크기
- Small (px-3 py-1, 14px)
- Medium (px-4 py-2, 16px) ← 기본값
- Large (px-6 py-3, 18px)

// 상태
- Default
- Hover (그림자 + 밝아짐)
- Active/Pressed
- Disabled (회색, 클릭 불가)
- Loading (스피너 + 텍스트 숨김)
```

**예시**:
```tsx
<Button variant="primary" size="medium">
  DNA 진단 시작
</Button>

<Button variant="secondary" size="small" disabled>
  이미 참여함
</Button>
```

### 7.2 Input Field

```tsx
// 타입
- Text (일반)
- Email
- Password
- Number
- Select (드롭다운)
- Textarea

// 상태
- Default (회색 보더)
- Focus (파란 보더, 그림자)
- Error (빨강 보더 + 오류 텍스트)
- Filled (배경 채워짐)
- Disabled (회색, 클릭 불가)

// 크기
- Compact (py-1, 텍스트 14px)
- Default (py-2, 텍스트 16px)
- Large (py-3, 텍스트 18px)
```

**예시**:
```tsx
<Input
  type="email"
  placeholder="이메일을 입력하세요"
  label="이메일"
  error="유효하지 않은 이메일 형식입니다"
/>
```

### 7.3 Card

```tsx
// 구조
- Header (선택, 제목 + 아이콘)
- Content (본문)
- Footer (선택, 액션 버튼)

// 변형
- Elevated (그림자)
- Outlined (보더)
- Flat (배경색)

// 상호작용
- Hover 상태 (그림자 증가)
- 클릭 가능 (커서 포인터)
- 선택 상태 (보더 강조)
```

**예시**:
```tsx
<Card variant="elevated">
  <Card.Header>
    <h3>당신의 DNA 결과</h3>
  </Card.Header>
  <Card.Content>
    <RadarChart data={dnaScores} />
  </Card.Content>
  <Card.Footer>
    <Button>공유하기</Button>
  </Card.Footer>
</Card>
```

### 7.4 RadarChart (DNA 시각화)

```tsx
// 특징
- 4축 (P, C, Pol, S)
- 0-100 스케일
- 축별 색상 다름 (P=파랑, C=초록, Pol=주황, S=보라)
- 반응형 (모바일에서 더 작음)

// 상호작용
- 호버 시 축 값 표시
- 터치 기기에서도 정보 노출
```

**예시**:
```tsx
<RadarChart
  data={[
    { axis: 'P', value: 72, fill: '#3B82F6' },
    { axis: 'C', value: 45, fill: '#10B981' },
    { axis: 'Pol', value: 38, fill: '#F59E0B' },
    { axis: 'S', value: 61, fill: '#8B5CF6' }
  ]}
/>
```

### 7.5 Modal / Dialog

```tsx
// 구성
- Overlay (반투명 배경)
- Header (닫기 버튼 포함)
- Content (본문)
- Footer (액션 버튼)

// 크기
- Small (400px)
- Medium (600px) ← 기본값
- Large (800px)

// 애니메이션
- 열기: fade-in + scale-up (150ms)
- 닫기: fade-out + scale-down (150ms)
```

**예시**:
```tsx
<Modal isOpen={true} onClose={handleClose}>
  <Modal.Header>
    <h2>질문 제안하기</h2>
  </Modal.Header>
  <Modal.Content>
    {/* 폼 */}
  </Modal.Content>
  <Modal.Footer>
    <Button variant="secondary">취소</Button>
    <Button variant="primary">제안하기</Button>
  </Modal.Footer>
</Modal>
```

### 7.6 Badge / Label

```tsx
// 유형
- Default (회색)
- Success (초록)
- Warning (주황)
- Error (빨강)
- Info (파랑)

// 크기
- Small (12px, 컴팩트)
- Medium (14px) ← 기본값

// 스타일
- Filled (배경색)
- Outlined (보더만)
```

**예시**:
```tsx
<Badge variant="success">완료됨</Badge>
<Badge variant="warning">진행중</Badge>
<Badge variant="error">마감됨</Badge>
```

### 7.7 Progress / Progress Bar

```tsx
// 용도
- 진단 문항 진행률 (%)
- 질문 참여율

// 시각화
- 색상: Primary Blue (#0052CC)
- 높이: 4px 또는 8px
- 애니메이션: 부드러운 변화 (200ms)
```

**예시**:
```tsx
<ProgressBar value={65} max={100} label="65%" />
```

---

## 8. 반응형 디자인

### 8.1 Break Points

| 기기 | 너비 | Tailwind | 사용 |
|------|------|---------|------|
| **Mobile** | < 640px | sm | 스마트폰 (기본) |
| **Tablet** | 640px - 1024px | md/lg | 태블릿, 가로 모드 |
| **Desktop** | ≥ 1024px | xl/2xl | 데스크톱 |

### 8.2 모바일 우선 전략

```tsx
// 기본: 모바일 (100% 너비)
// sm: 상단부터 탭
// lg: 데스크톱 멀티 컬럼

<div className="flex flex-col sm:flex-row gap-4">
  <div className="w-full sm:w-1/2">좌측</div>
  <div className="w-full sm:w-1/2">우측</div>
</div>
```

### 8.3 주요 요소 반응형 조정

| 요소 | 모바일 | 데스크톱 |
|------|--------|--------|
| **마진** | 16px | 24px |
| **버튼 크기** | 48px (높이) | 40px |
| **폰트** | 16px (본문) | 16px (변화 없음) |
| **카드 너비** | 100% | 33% (3 컬럼) |
| **모달 너비** | 90% | 600px |

---

## 9. 다크 모드 (Future / Phase 2)

### 9.1 다크 팔레트 (참고)

| 요소 | 라이트 | 다크 |
|------|--------|------|
| 배경 | #FFFFFF | #0F1419 |
| 카드 | #F3F4F6 | #1E2329 |
| 텍스트 주 | #111827 | #F3F4F6 |
| 텍스트 보조 | #6B7280 | #9CA3AF |

**구현**: Tailwind CSS `dark:` prefix 사용

---

## 10. 접근성 (A11y)

### 10.1 색상 대비

- **AAA 기준**: 명도 비율 7:1 (최상)
- **AA 기준**: 명도 비율 4.5:1 (최소)
- 모든 텍스트 ≥ AA (4.5:1)

### 10.2 상호작용 피드백

```tsx
// 모든 버튼/링크
- 호버 상태 명확히 표시
- 포커스 아웃라인 보이기 (outline: 2px solid #0052CC)
- 클릭 피드백 (active state)
```

### 10.3 키보드 네비게이션

```tsx
// Tab 순서 정의
<Button tabIndex={1}>1번</Button>
<Button tabIndex={2}>2번</Button>
<Button tabIndex={3}>3번</Button>

// 스킵 링크 (고급)
<a href="#main-content">본문으로 이동</a>
```

### 10.4 ARIA 라벨

```tsx
<button aria-label="메뉴 열기">☰</button>
<input aria-label="이메일 주소" type="email" />
<div role="status" aria-live="polite">완료되었습니다</div>
```

---

## 11. 애니메이션 & 전환

### 11.1 기본 전환

```css
/* Tailwind CSS */
.transition { transition-property: all; transition-duration: 150ms; }
.transition-all { transition-property: all; }

/* 시간 */
duration-75:  75ms   (빠른 반응)
duration-150: 150ms  (일반, 기본값)
duration-300: 300ms  (느린 애니메이션)
```

### 11.2 주요 애니메이션

| 상황 | 애니메이션 | 시간 | 예시 |
|------|----------|------|------|
| 호버 | 스케일 + 색상 | 150ms | 버튼 호버 |
| 페이드 | Opacity | 200ms | 모달 열기/닫기 |
| 슬라이드 | Transform | 200ms | 드롭다운 닫히기 |
| 진행 | 스무스한 폭 증가 | 300ms | Progress bar |

---

## 12. 이미지 & 아이콘

### 12.1 아이콘 라이브러리
- **Hero Icons** (선택): 깔끔한 24x24 SVG
- 또는 **Tabler Icons**: 의료/업무용
- **최소화 규칙**: 텍스트 라벨 함께 표시 (모바일 터치 친화)

### 12.2 이미지 최적화

```tsx
// Next.js Image 컴포넌트
<Image
  src="/dna-chart.png"
  alt="DNA 레이더 차트"
  width={400}
  height={400}
  priority={false} // 진단 결과는 lazy load
/>
```

---

## 13. 컴포넌트 라이브러리 (구현 가이드)

### 13.1 폴더 구조

```
components/
├── ui/              # 기본 UI 컴포넌트
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── Badge.tsx
├── dna/             # DNA 특화 컴포넌트
│   ├── RadarChart.tsx
│   └── PersonaCard.tsx
├── question/        # 질문 관련
│   ├── QuestionCard.tsx
│   └── OptionSelector.tsx
└── layout/          # 레이아웃
    ├── Header.tsx
    ├── Sidebar.tsx
    └── Footer.tsx
```

### 13.2 스토리북 (선택, Phase 2)

```bash
npm install -D storybook @storybook/nextjs

# components/Button.stories.tsx
export const Primary = () => <Button variant="primary">버튼</Button>;
export const Secondary = () => <Button variant="secondary">버튼</Button>;
```

---

## 14. 디자인 토큰 (CSS Variables)

### 14.1 Tailwind 설정 확장

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E3F2FF',
          500: '#0052CC',
          900: '#0052CC'
        },
        dna: {
          p: '#3B82F6',
          c: '#10B981',
          pol: '#F59E0B',
          s: '#8B5CF6'
        }
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px'
      }
    }
  }
};
```

---

## 15. 디자인 체크리스트

### Phase 1 (MVP)

- [ ] 색상 팔레트 정의 및 Tailwind 적용
- [ ] 타이포그래피 스케일 Tailwind 매핑
- [ ] Button, Input, Card 컴포넌트 구현
- [ ] RadarChart Recharts로 구현
- [ ] 모바일 반응형 (640px break point)
- [ ] 모든 요소 AAA 색상 대비 검증
- [ ] 키보드 네비게이션 테스트

### Phase 2 (확장)

- [ ] 다크 모드 지원
- [ ] 애니메이션 상세 정의
- [ ] Storybook 문서화
- [ ] 접근성 감시 도구 (Axe, WAVE)

---

**문서 상태**: 검토 준비 완료
**다음 단계**: 06-screens.md (화면 목록) 작성
