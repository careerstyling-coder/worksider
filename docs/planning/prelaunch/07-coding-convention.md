# 07-coding-convention.md: 사전 예약 페이지 코딩 컨벤션

**프로젝트**: Workside 사전 예약 페이지 (프리론칭)
**버전**: 1.0
**작성일**: 2026-03-25
**상태**: 개발 규칙 정의 완료

---

## MVP 캡슐 (10줄)

기존 Workside 컨벤션 완전 준수 (파일명, 네이밍, TypeScript, React). 신규 폴더: `app/(prelaunch)/`, `components/prelaunch/`, `lib/prelaunch/`. 파일 네이밍: PascalCase (컴포넌트), camelCase (함수/API). 신규 API 라우트: `app/api/prelaunch/` 그룹화. 타입 정의: Zod 스키마 검증 + TypeScript 인터페이스. 컴포넌트: React Hook Form + TanStack Query. 에러 처리: try-catch + 에러 상태 관리. 커밋: Conventional Commits (`feat(prelaunch): ...`). 테스트: Jest + React Testing Library. 배포: Vercel 자동.

---

## 1. 프로젝트 구조 (신규 파일)

### 1.1 파일 구조

```
app/
├── (prelaunch)/                      [신규 라우트 그룹]
│   ├── page.tsx                      (/ → /prelaunch 홈)
│   ├── layout.tsx                    (레이아웃)
│   ├── reserved/
│   │   └── page.tsx                  (/prelaunch/reserved)
│   ├── my-reservation/
│   │   └── page.tsx                  (/prelaunch/my-reservation)
│   └── error.tsx                     (에러 바운더리)
│
├── api/
│   └── prelaunch/                    [신규 API 라우트]
│       ├── reserve/
│       │   └── route.ts              (POST /api/prelaunch/reserve)
│       ├── invite/
│       │   ├── track/
│       │   │   └── route.ts          (POST /api/prelaunch/invite/track)
│       │   └── [code]/
│       │       └── route.ts          (GET /api/prelaunch/invite/:code)
│       └── dashboard/
│           └── route.ts              (GET /api/prelaunch/dashboard)
│
├── admin/
│   └── prelaunch/                    [기존 /admin에 탭 추가]
│       └── page.tsx                  (/admin/prelaunch)
│
└── ...기존 구조...

components/
├── prelaunch/                        [신규 컴포넌트 폴더]
│   ├── HeroSection.tsx
│   ├── DNAIntroSection.tsx
│   ├── ReservationForm.tsx
│   ├── ReservedPage.tsx
│   ├── InviteProgressBar.tsx
│   ├── SocialShareButtons.tsx
│   ├── MyReservationDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── index.ts                      (배럴 export)
│
└── ...기존 구조...

lib/
├── prelaunch/                        [신규 유틸 폴더]
│   ├── api.ts                        (API 호출 함수)
│   ├── validators.ts                 (Zod 스키마)
│   ├── hooks.ts                      (커스텀 훅)
│   └── utils.ts                      (유틸 함수)
│
└── ...기존 구조...

types/
├── prelaunch.ts                      [신규 타입]
│
└── ...기존 구조...
```

---

## 2. 네이밍 컨벤션

### 2.1 파일명 (기존 규칙 준수)

```typescript
// 컴포넌트: PascalCase
HeroSection.tsx
ReservationForm.tsx
InviteProgressBar.tsx

// API 라우트: route.ts (Next.js 필수)
app/api/prelaunch/reserve/route.ts
app/api/prelaunch/invite/track/route.ts

// 유틸 함수: camelCase
createReservation.ts
calculateConversionRate.ts
trackInviteClick.ts

// 타입 정의: PascalCase
PrelaunchReservation.ts
InviteTracking.ts

// 테스트: .test.tsx 또는 .spec.tsx
HeroSection.test.tsx
ReservationForm.spec.tsx
```

### 2.2 변수/함수명 (기존 규칙 준수)

```typescript
// 상수: UPPER_SNAKE_CASE
const MAX_INVITATIONS = 5;
const PRELAUNCH_DURATION_WEEKS = 4;
const INVITE_CODE_LENGTH = 21;

// 함수/변수: camelCase
const handleReservation = async () => {};
const inviteCode = nanoid(21);
const conversionRate = 0.225;

// 부울 변수: is/has 접두사
const isLoading = false;
const hasError = true;
const canSubmit = email !== '';

// 이벤트 핸들러: handle + CamelCase
const handleSubmit = (e: React.FormEvent) => {};
const handleInviteClick = () => {};
const handleCopyLink = () => {};
```

### 2.3 컴포넌트명

```typescript
// 페이지 컴포넌트
export default function PrelaunchPage() {}
export default function ReservedPage() {}
export default function MyReservationPage() {}

// 기능 컴포넌트
export function HeroSection() {}
export function ReservationForm() {}
export function InviteProgressBar() {}

// 훅
export function useReservation() {}
export function useInviteTracking() {}
export function usePrelaunchDashboard() {}
```

---

## 3. TypeScript 스타일

### 3.1 타입 정의 (Zod + 인터페이스)

```typescript
// lib/prelaunch/validators.ts
import { z } from 'zod';

// 예약 요청 스키마
export const ReservationSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  industry: z.enum(
    ['IT', 'Finance', 'Manufacturing', 'Education', 'Communications', 'Marketing', 'Other'],
    { errorMap: () => ({ message: '유효한 직군을 선택하세요' }) }
  ),
  experience_years: z.enum(['1년차', '2~3년차', '4~5년차', '6~10년차', '10년 이상']),
});

export type Reservation = z.infer<typeof ReservationSchema>;

// API 응답 타입
export interface ReservationResponse {
  success: boolean;
  data?: {
    id: string;
    queue_position: number;
    invite_code: string;
    created_at: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// 초대 추적
export interface InviteTrackingData {
  inviter_id: string;
  invitee_id: string | null;
  invite_code: string;
  link_clicked: boolean;
  converted: boolean;
  created_at: string;
}

// 리워드
export interface RewardData {
  id: string;
  reservation_id: string;
  type: 'early_adopter_badge' | 'priority_access';
  status: 'pending' | 'unlocked' | 'redeemed';
  invite_success_count: number;
  required_count: number;
  unlocked_at?: string;
}
```

### 3.2 함수 시그니처

```typescript
// lib/prelaunch/api.ts

// 예약 등록
async function createReservation(
  email: string,
  industry: string,
  experience_years: string,
  inviteCode?: string // 초대받은 경우
): Promise<ReservationResponse> {
  const response = await fetch('/api/prelaunch/reserve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, industry, experience_years, invite_code: inviteCode }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create reservation');
  }

  return response.json();
}

// 초대 추적
async function trackInviteClick(inviteCode: string): Promise<void> {
  const response = await fetch('/api/prelaunch/invite/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invite_code: inviteCode }),
  });

  if (!response.ok) {
    throw new Error('Failed to track invite click');
  }
}

// 대시보드 데이터 조회
async function fetchPrelaunchDashboard(): Promise<DashboardData> {
  const response = await fetch('/api/admin/prelaunch/dashboard');
  if (!response.ok) throw new Error('Failed to fetch dashboard');
  return response.json();
}
```

### 3.3 에러 처리

```typescript
// 커스텀 에러 클래스
class PrelaunchError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'PrelaunchError';
  }
}

// try-catch 패턴
try {
  const result = await createReservation(email, industry, years);
  console.info('Reservation created', { result });
} catch (error) {
  if (error instanceof PrelaunchError) {
    console.error(`PrelaunchError (${error.statusCode}): ${error.message}`);
    setError(error.message);
  } else if (error instanceof Error) {
    console.error(`Unexpected error: ${error.message}`);
    setError('오류가 발생했습니다. 다시 시도해주세요.');
  } else {
    console.error('Unknown error');
    setError('알 수 없는 오류가 발생했습니다.');
  }
}
```

---

## 4. React & Next.js 컨벤션

### 4.1 페이지 컴포넌트

```typescript
// app/(prelaunch)/page.tsx
import { HeroSection, DNAIntroSection, ReservationForm } from '@/components/prelaunch';

export const metadata = {
  title: 'Workside 사전 예약',
  description: '당신의 일 스타일을 먼저 알아보세요',
};

export default function PrelaunchPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <DNAIntroSection />
      <ReservationForm />
    </div>
  );
}
```

### 4.2 클라이언트 컴포넌트 (예약 폼)

```typescript
// components/prelaunch/ReservationForm.tsx
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReservationSchema, type Reservation } from '@/lib/prelaunch/validators';
import { createReservation } from '@/lib/prelaunch/api';

interface ReservationFormProps {
  inviteCode?: string;
}

export function ReservationForm({ inviteCode }: ReservationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Reservation>({
    resolver: zodResolver(ReservationSchema),
  });

  const onSubmit = useCallback(async (data: Reservation) => {
    setIsLoading(true);
    try {
      const result = await createReservation(
        data.email,
        data.industry,
        data.experience_years,
        inviteCode
      );
      if (result.success && result.data) {
        // Redirect to /prelaunch/reserved
        window.location.href = '/prelaunch/reserved';
      }
    } finally {
      setIsLoading(false);
    }
  }, [inviteCode]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">이메일</label>
        <input
          {...register('email')}
          type="email"
          placeholder="user@example.com"
          className="w-full px-4 py-2 border rounded-lg"
        />
        {errors.email && <span className="text-red-600 text-sm">{errors.email.message}</span>}
      </div>

      {/* ... select 필드들 */}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
      >
        {isLoading ? '예약 중...' : '지금 예약하기'}
      </button>
    </form>
  );
}
```

### 4.3 커스텀 훅

```typescript
// lib/prelaunch/hooks.ts
'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPrelaunchDashboard } from './api';

// 예약 폼 상태 관리
export function useReservationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: Reservation, inviteCode?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await createReservation(data.email, data.industry, data.experience_years, inviteCode);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, submit };
}

// 대시보드 데이터 조회
export function usePrelaunchDashboard() {
  return useQuery({
    queryKey: ['prelaunch-dashboard'],
    queryFn: fetchPrelaunchDashboard,
    refetchInterval: 300000, // 5분마다 갱신
  });
}
```

---

## 5. API 라우트 스타일

### 5.1 POST /api/prelaunch/reserve

```typescript
// app/api/prelaunch/reserve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReservationSchema } from '@/lib/prelaunch/validators';
import { nanoid } from 'nanoid';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // 1. 요청 바디 파싱
    const body = await request.json();

    // 2. Zod 검증
    const validated = ReservationSchema.parse(body);

    // 3. 이메일 중복 확인
    const { data: existing } = await supabase
      .from('reservations')
      .select('id')
      .eq('email', validated.email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'already_registered', message: '이미 예약하신 이메일입니다' },
        { status: 409 }
      );
    }

    // 4. 초대코드 생성
    const inviteCode = nanoid(21);

    // 5. DB 삽입
    const { data, error } = await supabase
      .from('reservations')
      .insert([
        {
          email: validated.email,
          industry: validated.industry,
          experience_years: validated.experience_years,
          invite_code: inviteCode,
          status: 'pending',
          // invited_by_id: body.invite_code ? ... : null
        },
      ])
      .select('id, queue_position, invite_code, created_at')
      .single();

    if (error) throw error;

    // 6. 성공 응답
    return NextResponse.json(
      {
        success: true,
        data: {
          id: data.id,
          queue_position: data.queue_position,
          invite_code: data.invite_code,
          created_at: data.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'validation_error', message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Reserve error:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
```

### 5.2 Rate Limiting (미들웨어)

```typescript
// lib/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      const ip = request.ip || 'unknown';
      const now = Date.now();

      let record = rateLimitStore.get(ip);
      if (!record || now > record.resetTime) {
        record = { count: 0, resetTime: now + windowMs };
        rateLimitStore.set(ip, record);
      }

      if (record.count >= maxRequests) {
        return NextResponse.json(
          { error: 'too_many_requests' },
          { status: 429 }
        );
      }

      record.count++;
      return handler(request);
    };
  };
}

// 사용 예
export const POST = rateLimit(10, 60000)(async (request) => {
  // 처리 로직
});
```

---

## 6. 테스트 작성

### 6.1 유닛 테스트

```typescript
// lib/prelaunch/__tests__/api.test.ts
import { createReservation } from '../api';

describe('createReservation', () => {
  it('should create reservation with valid data', async () => {
    const result = await createReservation('test@example.com', 'IT', '4~5년차');
    expect(result.success).toBe(true);
    expect(result.data?.invite_code).toMatch(/^[a-zA-Z0-9_-]{21}$/);
  });

  it('should reject duplicate email', async () => {
    await createReservation('test@example.com', 'IT', '4~5년차');
    const result = await createReservation('test@example.com', 'Finance', '1년차');
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('already_registered');
  });

  it('should include invite_code in response', async () => {
    const result = await createReservation('new@example.com', 'IT', '4~5년차');
    expect(result.data?.invite_code).toBeDefined();
    expect(result.data?.queue_position).toBeDefined();
  });
});
```

### 6.2 컴포넌트 테스트

```typescript
// components/prelaunch/__tests__/ReservationForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReservationForm } from '../ReservationForm';

describe('ReservationForm', () => {
  it('should render form fields', () => {
    render(<ReservationForm />);
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/직군/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/연차/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    render(<ReservationForm />);

    fireEvent.change(screen.getByLabelText(/이메일/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/직군/i), { target: { value: 'IT' } });
    fireEvent.change(screen.getByLabelText(/연차/i), { target: { value: '4~5년차' } });

    fireEvent.click(screen.getByRole('button', { name: /지금 예약하기/i }));

    await waitFor(() => {
      expect(window.location.href).toContain('/prelaunch/reserved');
    });
  });

  it('should show error for invalid email', async () => {
    render(<ReservationForm />);

    fireEvent.change(screen.getByLabelText(/이메일/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/유효한 이메일/i)).toBeInTheDocument();
    });
  });
});
```

---

## 7. Git 커밋 메시지 (Conventional Commits)

```
feat(prelaunch): add reservation form component

- Implement ReservationForm with email, industry, years fields
- Add Zod validation for input data
- Integrate API call to /api/prelaunch/reserve
- Show success/error states

Close #42

feat(prelaunch): add invite progress bar visualization
fix(prelaunch): correct invite code generation length
docs(prelaunch): update API route documentation
refactor(prelaunch): extract validation schemas to utils
test(prelaunch): add unit tests for createReservation
chore(prelaunch): setup database migrations
```

---

## 8. 성능 최적화

### 8.1 컴포넌트 메모이제이션

```typescript
// 비용이 많이 드는 컴포넌트만 메모이제이션
const AdminDashboard = memo(function AdminDashboard({ data }: Props) {
  return <div>{/* 복잡한 차트 렌더링 */}</div>;
});

export default AdminDashboard;
```

### 8.2 이미지 최적화

```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image';

<Image
  src="/dna-icon.png"
  alt="DNA 아이콘"
  width={32}
  height={32}
  priority={false}
/>
```

### 8.3 동적 임포트

```typescript
// 무거운 차트 라이브러리는 동적 로드
const AdminDashboard = dynamic(
  () => import('@/components/prelaunch/AdminDashboard'),
  {
    loading: () => <div>대시보드 로딩 중...</div>,
    ssr: false, // 서버에서 렌더링하지 않음
  }
);
```

---

## 9. 주석 작성 규칙

```typescript
// 간단한 한 줄 주석
const inviteCode = nanoid(21); // nanoid로 21자 무작위 코드 생성

// 복잡한 로직은 블록 주석
/**
 * 초대 전환율을 계산한다
 * @param successCount - 성공 초대 수
 * @param totalClicks - 총 클릭 수
 * @returns 전환율 (0~1)
 */
function calculateConversionRate(successCount: number, totalClicks: number): number {
  if (totalClicks === 0) return 0;
  return successCount / totalClicks;
}

// TODO/FIXME 주석
// TODO: Phase 2에서 이메일 인증 추가
// FIXME: 초대 링크 만료 로직 구현 필요
```

---

## 10. 환경 변수

```env
# .env.local.example
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Prelaunch (선택)
NEXT_PUBLIC_PRELAUNCH_ENABLED=true
PRELAUNCH_MAX_RESERVATIONS=500
PRELAUNCH_REWARD_THRESHOLD=5
```

---

## 11. 체크리스트 (개발 전/중/후)

### 개발 전
- [ ] API 엔드포인트 정의 (02-trd.md 참고)
- [ ] DB 스키마 작성 (04-database-design.md 참고)
- [ ] 화면 와이어프레임 검토 (06-screens.md 참고)

### 개발 중
- [ ] ESLint 에러 없음
- [ ] TypeScript 타입 검사 통과 (tsc --noEmit)
- [ ] Zod 검증 스키마 작성
- [ ] 에러 처리 (try-catch, 상태 관리)
- [ ] 유닛 테스트 작성
- [ ] React Hook Form + TanStack Query 활용

### 커밋 전
- [ ] 테스트 통과
- [ ] Prettier 포맷팅 실행
- [ ] Conventional Commits 형식

### 배포 전
- [ ] 성능 검증 (Lighthouse > 90)
- [ ] 모바일 반응형 테스트
- [ ] 접근성 검증 (AAA 명도 대비)
- [ ] 보안 검토 (입력 검증, 레이트 리미팅)

---

## 12. 기존 코드 참조

**기존 Workside 컨벤션 완전 준수**:
- 파일 구조: `docs/planning/07-coding-convention.md`
- 타입 정의: `types/` 폴더
- API 라우트: `app/api/` 폴더
- 컴포넌트 구조: `components/ui/`, `components/layout/`

---

## 13. 다음 단계

코딩 컨벤션 정의 완료 후:
1. 기존 Workside 코드베이스 최종 검토
2. Supabase 마이그레이션 파일 생성
3. 개발 시작 (2~3주 소요)

## 다음 단계: 개발 시작
Figma 디자인 완성 → 컴포넌트 개발 → API 구현 → 통합 테스트

---

**문서 상태**: 검토 준비 완료
**작성 일시**: 2026-03-25
**마지막 검증**: Workside MVP 컨벤션 일관성 확인 완료
