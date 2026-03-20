# 07-coding-convention.md: 코딩 컨벤션

**프로젝트**: Workside (워크사이드)
**버전**: 1.0
**작성일**: 2026-03-16
**상태**: MVP Phase 1 기획

---

## 1. 개요

본 문서는 Workside 프로젝트의 코딩 스타일 가이드이다. 모든 개발자(AI 포함)는 이 규칙을 따른다.

**기술 스택**:
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Package Manager**: npm / pnpm

---

## 2. 파일 구조 (Project Architecture)

### 2.1 Root Level

```
workside/
├── app/                    # Next.js App Router
├── components/             # React 컴포넌트
├── lib/                    # 유틸 함수, 헬퍼
├── types/                  # TypeScript 타입 정의
├── styles/                 # 글로벌 CSS
├── public/                 # 정적 자산
├── tests/                  # 테스트 파일
├── docs/                   # 문서 (마크다운)
├── .env.local.example      # 환경 변수 템플릿
├── .eslintrc.json          # ESLint 설정
├── .prettierrc              # Prettier 설정
├── tsconfig.json           # TypeScript 설정
├── tailwind.config.js      # Tailwind 설정
├── next.config.js          # Next.js 설정
└── package.json
```

### 2.2 app/ (Next.js App Router)

```
app/
├── (public)/               # 공개 라우트 (layout group)
│   ├── page.tsx            # /
│   ├── share/
│   │   └── [shareId]/
│   │       └── page.tsx    # /share/:shareId
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx    # /auth/login
│   │   └── signup/
│   │       └── page.tsx    # /auth/signup
│   └── layout.tsx          # 공개 라우트 레이아웃
│
├── (private)/              # 보호된 라우트 (layout group)
│   ├── diagnosis/
│   │   └── page.tsx        # /diagnosis
│   ├── result/
│   │   └── [sessionId]/
│   │       └── page.tsx    # /result/:sessionId
│   ├── my-dna/
│   │   └── page.tsx        # /my-dna
│   ├── feed/
│   │   └── page.tsx        # /feed
│   ├── question/
│   │   └── [questionId]/
│   │       ├── page.tsx    # /question/:questionId
│   │       └── result/
│   │           └── page.tsx # /question/:questionId/result
│   ├── suggest/
│   │   └── page.tsx        # /suggest
│   └── layout.tsx          # 보호된 라우트 레이아웃 (미들웨어)
│
├── admin/                  # 관리자 라우트 (미들웨어 보호)
│   ├── page.tsx            # /admin
│   ├── questions/
│   │   └── page.tsx        # /admin/questions
│   ├── users/
│   │   └── page.tsx        # /admin/users
│   └── layout.tsx          # 관리자 레이아웃
│
├── api/                    # API 라우트
│   ├── diagnosis/
│   │   ├── start/
│   │   │   └── route.ts    # POST /api/diagnosis/start
│   │   ├── [sessionId]/
│   │   │   ├── response/
│   │   │   │   └── route.ts # POST /api/diagnosis/:sessionId/response
│   │   │   └── complete/
│   │   │       └── route.ts # POST /api/diagnosis/:sessionId/complete
│   │   └── result/
│   │       └── [sessionId]/
│   │           └── route.ts # GET /api/diagnosis/result/:sessionId
│   ├── questions/
│   │   ├── route.ts        # GET /api/questions (list)
│   │   ├── [questionId]/
│   │   │   ├── route.ts    # GET /api/questions/:questionId
│   │   │   ├── respond/
│   │   │   │   └── route.ts # POST /api/questions/:questionId/respond
│   │   │   └── result/
│   │   │       └── route.ts # GET /api/questions/:questionId/result
│   │   └── suggest/
│   │       └── route.ts    # POST /api/questions/suggest
│   ├── users/
│   │   └── profile/
│   │       └── route.ts    # GET/PUT /api/users/profile
│   └── admin/
│       ├── dashboard/
│       │   └── route.ts    # GET /api/admin/dashboard
│       ├── questions/
│       │   └── route.ts    # POST/GET /api/admin/questions
│       └── settings/
│           └── route.ts    # PUT /api/admin/settings
│
├── layout.tsx              # Root layout
├── globals.css             # 글로벌 스타일
└── error.tsx               # 에러 페이지
```

### 2.3 components/

```
components/
├── ui/                     # 기본 UI 컴포넌트 (재사용)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── ProgressBar.tsx
│   └── index.ts            # 배럴 export
│
├── dna/                    # DNA 특화 컴포넌트
│   ├── RadarChart.tsx
│   ├── PersonaCard.tsx
│   ├── DNAResultSummary.tsx
│   └── index.ts
│
├── question/               # 질문 관련 컴포넌트
│   ├── QuestionCard.tsx
│   ├── OptionSelector.tsx
│   ├── ResultChart.tsx
│   └── index.ts
│
├── auth/                   # 인증 관련
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── index.ts
│
├── layout/                 # 레이아웃 컴포넌트
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── index.ts
│
└── common/                 # 기타 공통 컴포넌트
    ├── Loading.tsx
    ├── ErrorBoundary.tsx
    └── index.ts
```

### 2.4 lib/

```
lib/
├── auth.ts                 # Supabase Auth 헬퍼
├── supabase.ts             # Supabase 클라이언트
├── api-client.ts           # API 호출 유틸
├── validators.ts           # Zod 스키마
├── constants.ts            # 상수 정의
├── utils.ts                # 일반 유틸 함수
├── dna/
│   ├── calculator.ts       # 진단 점수 계산
│   ├── personaMapping.ts   # DNA → 페르소나 매핑
│   └── descriptions.ts     # 페르소나 설명문
├── question/
│   ├── aggregator.ts       # 응답 집계
│   └── minorityView.ts     # 소수 의견 추출
└── hooks/                  # Custom React Hooks
    ├── useAuth.ts
    ├── useDNA.ts
    ├── useQuestion.ts
    └── index.ts
```

### 2.5 types/

```
types/
├── index.ts                # 타입 배럴
├── auth.ts                 # 인증 관련
├── dna.ts                  # DNA 관련
├── question.ts             # 질문 관련
├── api.ts                  # API 응답 타입
└── db.ts                   # 데이터베이스 스키마 (생성됨)
```

---

## 3. 네이밍 컨벤션

### 3.1 파일명

| 유형 | 형식 | 예시 |
|------|------|------|
| **React 컴포넌트** | PascalCase | `Button.tsx`, `DNAChart.tsx` |
| **API 라우트** | camelCase | `route.ts` (Next.js 필수) |
| **유틸/헬퍼** | camelCase | `calculateScore.ts`, `validateEmail.ts` |
| **타입 정의** | PascalCase | `User.ts`, `DNAResult.ts` |
| **CSS 모듈** | camelCase | `button.module.css` (필요시) |
| **테스트** | `.test.ts` 또는 `.spec.ts` | `Button.test.tsx` |

### 3.2 변수명

```typescript
// 상수: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 함수/변수: camelCase
const userName = 'John';
const calculateScore = (responses) => { ... };

// 컴포넌트 props: camelCase
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
}

// 부울 변수: is/has 접두사
const isLoading = true;
const hasError = false;
const canSubmit = true;

// 이벤트 핸들러: handle + CamelCase
const handleClick = () => { ... };
const handleInputChange = (e) => { ... };
```

### 3.3 컴포넌트명

```typescript
// 페이지 컴포넌트 (라우트)
export default function HomePage() { ... }

// 기능 컴포넌트
export function Button({ ... }) { ... }

// 레이아웃
export function RootLayout({ children }) { ... }

// 폼
export function SignupForm() { ... }

// 훅
export function useAuth() { ... }
export function useDNACalculation() { ... }
```

---

## 4. TypeScript 스타일

### 4.1 타입 정의

```typescript
// 좋은 예: 명시적 타입
interface User {
  id: string;
  email: string;
  nickname: string;
  createdAt: Date;
}

// 좋은 예: Zod 스키마 (런타임 검증)
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nickname: z.string().min(2).max(20),
});

type User = z.infer<typeof UserSchema>;

// 좋은 예: Union 타입 (상태)
type DiagnosisStatus = 'in_progress' | 'completed' | 'abandoned';

// 좋은 예: Generic
interface ApiResponse<T> {
  data: T;
  error: null | string;
  status: number;
}

// 나쁜 예: any 사용 금지
const response: any = await fetch(...); // ❌ 피할 것
```

### 4.2 함수 시그니처

```typescript
// 좋은 예: 명시적 반환 타입
function calculateDNAScore(responses: number[]): number {
  return responses.reduce((a, b) => a + b, 0) / responses.length;
}

// 좋은 예: 비동기 함수
async function fetchUser(id: string): Promise<User> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

// 좋은 예: Optional / Union 타입
function getPersonaLabel(scoreP: number, scoreC: number): string | null {
  if (scoreP > 70 && scoreC < 30) return '실무형 전문가';
  return null;
}

// 나쁜 예: 암시적 any
const handleSubmit = (data) => { ... }; // ❌ data: any

// 좋은 예: 명시적 타입
const handleSubmit = (data: FormData) => { ... };
```

### 4.3 에러 처리

```typescript
// 좋은 예: 커스텀 에러 클래스
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 좋은 예: try-catch with 타입
try {
  const response = await fetchUser(id);
  return response;
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error (${error.statusCode}): ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`Unexpected error: ${error.message}`);
  } else {
    console.error('Unknown error occurred');
  }
  throw error;
}
```

---

## 5. React & Next.js 컨벤션

### 5.1 함수형 컴포넌트

```typescript
// 좋은 예: 함수형 컴포넌트 + Props 인터페이스
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  children,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// 나쁜 예: 클래스 컴포넌트 (React hooks 시대에 불필요)
class Button extends React.Component { ... } // ❌
```

### 5.2 Props와 상태

```typescript
// 좋은 예: Props 분리 (구조 분해)
export function Card({
  title,
  description,
  onClick,
}: CardProps) {
  return (
    <div onClick={onClick}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// 좋은 예: 상태 관리 (useState)
export function Counter() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => setCount(count + 1);
  const handleDecrement = () => setCount(count - 1);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>+</button>
      <button onClick={handleDecrement}>-</button>
    </div>
  );
}

// 좋은 예: useCallback (메모이제이션)
export function Form() {
  const [value, setValue] = useState('');

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  return <input onChange={handleChange} />;
}
```

### 5.3 Next.js 페이지 컴포넌트

```typescript
// 좋은 예: page.tsx (클라이언트 컴포넌트)
'use client';

import { useEffect, useState } from 'react';

export default function FeedPage() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div>
      <h1>피드</h1>
      {/* 콘텐츠 */}
    </div>
  );
}

// 좋은 예: layout.tsx (서버 컴포넌트)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

// 좋은 예: API 라우트 (route.ts)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const response = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    return Response.json({ data: response.data });
  } catch (error) {
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

---

## 6. CSS & Tailwind

### 6.1 Tailwind 클래스 순서

```typescript
// 좋은 예: 일관된 순서 (Tailwind 공식)
// 1. 레이아웃 (display, flex, grid, position)
// 2. 공간 (margin, padding)
// 3. 크기 (width, height)
// 4. 텍스트 (font, color, text-align)
// 5. 시각 (background, border, opacity)
// 6. 반응형 (sm:, md:, lg:)
// 7. 상태 (hover:, focus:, disabled:)

<button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">
  클릭하기
</button>

// 나쁜 예: 무작위 순서
<button className="text-white bg-blue-600 rounded py-2 px-4 flex items-center">
  // ❌ 순서가 일관성 없음
</button>
```

### 6.2 클래스 이름 길이 제한

```typescript
// 좋은 예: 짧고 읽기 쉬운 클래스
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  {/* 콘텐츠 */}
</div>

// 나쁜 예: 매우 긴 클래스 문자열
<div className="flex flex-col sm:flex-row md:flex-row lg:flex-row items-start sm:items-center md:items-center lg:items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8 bg-white hover:bg-gray-50 rounded-none sm:rounded-md md:rounded-lg lg:rounded-xl shadow-none sm:shadow-sm md:shadow-md lg:shadow-lg">
  {/* ❌ 너무 길고 읽기 어려움 */}
</div>

// 대안: 컴포넌트로 추출
const containerClass = 'flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-lg shadow-md';

<div className={containerClass}>
  {/* 콘텐츠 */}
</div>
```

### 6.3 조건부 클래스

```typescript
// 좋은 예: clsx or classnames 라이브러리
import clsx from 'clsx';

export function Button({ variant, disabled }: ButtonProps) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded font-semibold transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
          'opacity-50 cursor-not-allowed': disabled,
        }
      )}
      disabled={disabled}
    >
      {/* 콘텐츠 */}
    </button>
  );
}

// 좋은 예: 템플릿 리터럴 (간단한 경우)
<div className={`p-4 ${isActive ? 'bg-blue-100' : 'bg-white'}`}>
  {/* 콘텐츠 */}
</div>
```

---

## 7. 코드 스타일 (ESLint + Prettier)

### 7.1 .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-var": "error",
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-types": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

### 7.2 .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

### 7.3 패키지 설정 (package.json)

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 8. 주석 작성

### 8.1 주석 스타일

```typescript
// 좋은 예: 간결한 주석 (한 줄)
const isValid = age >= 18; // 성인 판단

// 좋은 예: 블록 주석 (복잡한 로직)
/**
 * DNA 점수를 정규화한다.
 * @param responses - 응답값 배열 (1~7)
 * @returns 정규화된 점수 (0~100)
 */
function normalizeScore(responses: number[]): number {
  const avg = responses.reduce((a, b) => a + b, 0) / responses.length;
  return Math.round((avg / 7) * 100);
}

// 좋은 예: TODO 주석 (추후 작업)
// TODO: 캐싱 추가 (성능 개선)
// FIXME: 엣지 케이스 처리 필요

// 나쁜 예: 불필요한 주석
const x = 5; // x를 5로 설정
```

### 8.2 JSDoc

```typescript
/**
 * 사용자 프로필을 업데이트한다.
 *
 * @param userId - 사용자 ID
 * @param data - 업데이트할 데이터 { nickname?: string; industry?: string }
 * @returns 업데이트된 사용자 객체
 * @throws APIError - API 요청 실패 시
 *
 * @example
 * const updatedUser = await updateProfile('user-123', { nickname: 'John' });
 */
export async function updateProfile(
  userId: string,
  data: Partial<User>
): Promise<User> {
  // 구현
}
```

---

## 9. Git 커밋 메시지 (Conventional Commits)

### 9.1 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 9.2 타입

| 타입 | 설명 |
|------|------|
| **feat** | 새로운 기능 |
| **fix** | 버그 수정 |
| **docs** | 문서 변경 |
| **style** | 코드 포맷팅 (의미 변화 없음) |
| **refactor** | 코드 구조 변경 (기능 동일) |
| **perf** | 성능 개선 |
| **test** | 테스트 추가/수정 |
| **chore** | 빌드, 의존성 업그레이드 |

### 9.3 예시

```
feat(dna): add radar chart visualization

- Implement RadarChart component using Recharts
- Calculate DNA scores from responses
- Display 4 axes (P, C, Pol, S)

Closes #42

feat(auth): implement Supabase authentication
fix(diagnosis): correct score normalization formula
docs(readme): update installation instructions
refactor(utils): extract common logic to helpers
```

---

## 10. 성능 최적화

### 10.1 컴포넌트 메모이제이션

```typescript
// 좋은 예: 비용이 많이 드는 컴포넌트 메모이제이션
const RadarChart = memo(function RadarChart({ data }: Props) {
  return <Recharts.RadarChart>{/* ... */}</Recharts.RadarChart>;
});

export default RadarChart;

// 좋은 예: 콜백 메모이제이션
const handleSubmit = useCallback(
  (data: FormData) => {
    submitForm(data);
  },
  [] // 의존성 배열
);

// 나쁜 예: 모든 컴포넌트를 memo로 감싸기
const Button = memo(function Button(props) { ... }); // 불필요
```

### 10.2 이미지 최적화

```typescript
// 좋은 예: Next.js Image 컴포넌트
import Image from 'next/image';

<Image
  src="/dna-chart.png"
  alt="DNA 레이더 차트"
  width={400}
  height={400}
  priority={false} // 지연 로딩
/>

// 나쁜 예: HTML img 태그
<img src="/dna-chart.png" alt="chart" /> // ❌
```

### 10.3 번들 크기 관리

```typescript
// 좋은 예: 동적 임포트
const RadarChart = dynamic(() => import('@/components/dna/RadarChart'), {
  loading: () => <div>로딩중...</div>,
  ssr: false, // 필요시
});

// 나쁜 예: 모든 차트 라이브러리 임포트
import * as Recharts from 'recharts'; // 불필요한 전체 임포트
```

---

## 11. 테스트 작성

### 11.1 유닛 테스트 (Jest)

```typescript
// calculateScore.test.ts
import { calculateDNAScore } from '@/lib/dna/calculator';

describe('calculateDNAScore', () => {
  it('should return average of responses normalized to 0-100', () => {
    const responses = [5, 6, 4];
    const result = calculateDNAScore(responses);

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('should handle edge cases', () => {
    expect(calculateDNAScore([1, 1, 1])).toBe(0);
    expect(calculateDNAScore([7, 7, 7])).toBe(100);
  });
});
```

### 11.2 컴포넌트 테스트 (React Testing Library)

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render with label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 12. 환경 변수

### 12.1 .env.local.example

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# API (필요시)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Vercel (배포 시)
VERCEL_URL=https://workside.vercel.app
```

### 12.2 접근 방식

```typescript
// 좋은 예: 클라이언트에서 접근 (NEXT_PUBLIC_ 필수)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// 좋은 예: 서버에서만 접근
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 좋은 예: 환경변수 검증
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
```

---

## 13. 보안 가이드

### 13.1 민감한 정보 보호

```typescript
// 나쁜 예: 민감한 정보를 클라이언트 노출
const API_KEY = 'super-secret-key'; // ❌ 클라이언트에 보인다

// 좋은 예: 서버 API 라우트에서만 처리
// route.ts (서버)
export async function POST(request: Request) {
  const apiKey = process.env.SECRET_API_KEY; // ✓ 안전
  // 처리
}
```

### 13.2 SQL Injection 방지

```typescript
// 나쁜 예: 직접 쿼리 조합
const query = `SELECT * FROM users WHERE email = '${email}'`; // ❌

// 좋은 예: Supabase 클라이언트 사용
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', email); // ✓ 파라미터화
```

### 13.3 XSS 방지

```typescript
// 나쁜 예: 사용자 입력 직접 렌더링
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // ❌

// 좋은 예: 안전한 렌더링
<div>{userInput}</div> // ✓ 자동 이스케이프
```

---

## 14. 모니터링 및 로깅

### 14.1 로깅 레벨

```typescript
// 에러
console.error('DNA 계산 실패:', error);

// 경고
console.warn('응답 속도가 느림 (>500ms):', duration);

// 정보
console.info('진단 완료:', { sessionId, duration });

// 디버그 (개발 중만)
if (process.env.NODE_ENV === 'development') {
  console.debug('Debug info:', data);
}
```

### 14.2 에러 추적 (선택, Phase 2)

```typescript
// Sentry 예시 (Phase 2)
import * as Sentry from '@sentry/nextjs';

try {
  await complexOperation();
} catch (error) {
  Sentry.captureException(error);
}
```

---

## 15. 체크리스트

### 개발 전

- [ ] 함수 시그니처 및 반환 타입 정의
- [ ] Props 인터페이스 정의
- [ ] API 응답 타입 정의

### 개발 중

- [ ] ESLint 에러 없음
- [ ] 타입 검사 통과 (tsc --noEmit)
- [ ] 모든 함수에 JSDoc 주석
- [ ] Tailwind 클래스 순서 일관성

### 커밋 전

- [ ] 테스트 통과
- [ ] Prettier 포맷팅 실행
- [ ] Conventional Commits 형식

### 배포 전

- [ ] 번들 크기 검토
- [ ] 성능 메트릭 확인
- [ ] 보안 검토 완료

---

**문서 상태**: 검토 준비 완료
**마지막 검증**: 2026-03-16

이 컨벤션은 모든 개발자가 따르는 필수 표준이다.
질문이나 개선 제안은 GitHub Discussions에서 논의한다.
