// @TASK P2-S5-T2 - 가입 플로우 Supabase Auth 연동 + 리다이렉트
// @SPEC docs/planning/03-user-flow.md#signup
// @TEST __tests__/app/signup/page.test.tsx

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { signUpSchema } from '@/lib/validations/auth';
import { signUp } from '@/lib/supabase/auth';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';

// ─── 타입 ────────────────────────────────────────────────────────────────────

type PasswordStrength = 'weak' | 'medium' | 'strong';

type Industry = 'IT' | 'Finance' | 'Manufacturing' | 'Service' | 'Other';

type CompanySize = 'xs' | 'small' | 'medium' | 'large' | 'xlarge';

interface FormData {
  email: string;
  nickname: string;
  password: string;
  passwordConfirm: string;
  industry: Industry | '';
  companySize: CompanySize | '';
}

interface FormErrors {
  email?: string;
  nickname?: string;
  password?: string;
  passwordConfirm?: string;
}

// ─── 비밀번호 강도 계산 ───────────────────────────────────────────────────────

function getPasswordStrength(pw: string): PasswordStrength | null {
  if (!pw) return null;
  if (pw.length < 8) return 'weak';
  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  if (hasSpecial && hasLetter && hasNumber) return 'strong';
  if (hasLetter && hasNumber) return 'medium';
  return 'weak';
}

const strengthLabel: Record<PasswordStrength, string> = {
  weak: 'weak',
  medium: 'medium',
  strong: 'strong',
};

const strengthColor: Record<PasswordStrength, string> = {
  weak: 'bg-red-500',
  medium: 'bg-yellow-400',
  strong: 'bg-primary',
};

const strengthWidth: Record<PasswordStrength, string> = {
  weak: 'w-1/3',
  medium: 'w-2/3',
  strong: 'w-full',
};

// ─── ProgressIndicator ───────────────────────────────────────────────────────

function ProgressIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-8" role="list" aria-label="가입 단계">
      {([1, 2] as const).map((s) => {
        const isCurrent = s === step;
        const isDone = s < step;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              data-testid={`progress-step-${s}`}
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                isCurrent
                  ? 'bg-primary text-black'
                  : isDone
                  ? 'bg-primary/30 text-primary'
                  : 'bg-bg-page text-text-tertiary'
              )}
            >
              {s}
            </div>
            {s < 2 && (
              <div
                className={cn(
                  'w-12 h-0.5 transition-all duration-300',
                  step > s ? 'bg-primary/60' : 'bg-bg-page'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PasswordStrengthBar ─────────────────────────────────────────────────────

function PasswordStrengthBar({ strength }: { strength: PasswordStrength | null }) {
  if (!strength) return null;
  return (
    <div className="mt-1.5">
      <div className="h-1 w-full bg-bg-page rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            strengthColor[strength],
            strengthWidth[strength]
          )}
        />
      </div>
      <p className="text-xs mt-1 text-text-secondary">
        강도: <span className="text-text-secondary">{strengthLabel[strength]}</span>
      </p>
    </div>
  );
}

// ─── CompanySizeCard ─────────────────────────────────────────────────────────

const companySizeOptions: { value: CompanySize; label: string; desc: string; testId: string }[] = [
  { value: 'xs', label: '5인 이하', desc: '소규모 조직', testId: 'company-size-xs' },
  { value: 'small', label: '5~30인', desc: '소기업', testId: 'company-size-small' },
  { value: 'medium', label: '30~100인', desc: '중소기업', testId: 'company-size-medium' },
  { value: 'large', label: '100~1,000인', desc: '중견기업', testId: 'company-size-large' },
  { value: 'xlarge', label: '1,000인 이상', desc: '대기업', testId: 'company-size-xlarge' },
];

// ─── ToastState ──────────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// ─── CompletionMessage ────────────────────────────────────────────────────────

function CompletionMessage({ onGoToFeed }: { onGoToFeed: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-8 text-center"
      aria-live="polite"
    >
      {/* 체크 아이콘 */}
      <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-2">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="18" stroke="#31A24C" strokeWidth="2" />
          <path d="M12 20l6 6 10-12" stroke="#31A24C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 환영 메시지 */}
      <h2 className="text-2xl font-bold text-text-primary">함께하게 되어 반갑습니다! 🎉</h2>
      <p className="text-[15px] text-text-secondary leading-relaxed max-w-sm">
        이제부터 함께 성장하는 여정이 시작돼요.<br />
        첫 번째 발견을 시작해볼까요?<br />
        3분이면 나의 Workstyle DNA를 만날 수 있어요.
      </p>

      {/* 추천 다음 단계 */}
      <div className="w-full mt-4 space-y-3">
        <Link
          href="/diagnosis"
          className="flex items-center justify-between w-full px-5 py-4 rounded-lg border border-primary bg-primary-light hover:bg-blue-50 transition group"
        >
          <div className="text-left">
            <span className="text-[15px] font-semibold text-primary">나를 발견하러 가기</span>
            <span className="block text-[13px] text-text-secondary mt-0.5">3분이면 나의 성장 지도가 그려져요</span>
          </div>
          <ChevronRight className="text-primary group-hover:translate-x-0.5 transition-transform" size={20} />
        </Link>

        <button
          onClick={onGoToFeed}
          className="flex items-center justify-between w-full px-5 py-4 rounded-lg border border-border bg-white hover:bg-bg-hover transition group"
        >
          <div className="text-left">
            <span className="text-[15px] font-semibold text-text-primary">피드 둘러보기</span>
            <span className="block text-[13px] text-text-secondary mt-0.5">다른 직장인들의 질문과 인사이트를 확인하세요</span>
          </div>
          <ChevronRight className="text-text-tertiary group-hover:translate-x-0.5 transition-transform" size={20} />
        </button>
      </div>

      <p className="text-[13px] text-text-tertiary mt-2">아래에서 다음 단계를 선택해주세요</p>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
    industry: '',
    companySize: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const passwordStrength = getPasswordStrength(formData.password);

  // ── 리다이렉트 타이머 ─────────────────────────────────────────────────────

  // 자동 리다이렉트 제거 — 사용자가 직접 선택하여 이동

  // ── 필드 변경 ──────────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        // 실시간 비밀번호 확인 체크
        if (field === 'passwordConfirm' || field === 'password') {
          const pw = field === 'password' ? value : formData.password;
          const confirm = field === 'passwordConfirm' ? value : formData.passwordConfirm;
          if (confirm && pw !== confirm) {
            setErrors((prev) => ({ ...prev, passwordConfirm: '비밀번호가 일치하지 않습니다' }));
          } else {
            setErrors((prev) => ({ ...prev, passwordConfirm: undefined }));
          }
        }
      },
    [formData.password, formData.passwordConfirm]
  );

  // ── 이메일 blur → 중복 확인 ──────────────────────────────────────────────

  const handleEmailBlur = useCallback(async () => {
    const emailResult = signUpSchema.shape.email.safeParse(formData.email);
    if (!emailResult.success) {
      setErrors((prev) => ({
        ...prev,
        email: emailResult.error.issues?.[0]?.message ?? emailResult.error.message,
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, email: undefined }));

    setEmailChecking(true);
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!data.available) {
        setErrors((prev) => ({
          ...prev,
          email: '이미 사용 중인 이메일입니다',
        }));
      }
    } catch {
      // 서버 오류는 무시 (step 이동 시 재검증)
    } finally {
      setEmailChecking(false);
    }
  }, [formData.email]);

  // ── 닉네임 blur → 검증 ───────────────────────────────────────────────────

  const handleNicknameBlur = useCallback(() => {
    const result = signUpSchema.shape.nickname.safeParse(formData.nickname);
    if (!result.success) {
      setErrors((prev) => ({
        ...prev,
        nickname: result.error.issues?.[0]?.message ?? result.error.message,
      }));
    } else {
      setErrors((prev) => ({ ...prev, nickname: undefined }));
    }
  }, [formData.nickname]);

  // ── 비밀번호 blur ─────────────────────────────────────────────────────────

  const handlePasswordBlur = useCallback(() => {
    const result = signUpSchema.shape.password.safeParse(formData.password);
    if (!result.success) {
      setErrors((prev) => ({
        ...prev,
        password: result.error.issues?.[0]?.message ?? result.error.message,
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  }, [formData.password]);

  // ── 비밀번호 확인 blur ────────────────────────────────────────────────────

  const handlePasswordConfirmBlur = useCallback(() => {
    if (formData.password !== formData.passwordConfirm) {
      setErrors((prev) => ({
        ...prev,
        passwordConfirm: '비밀번호가 일치하지 않습니다',
      }));
    } else {
      setErrors((prev) => ({ ...prev, passwordConfirm: undefined }));
    }
  }, [formData.password, formData.passwordConfirm]);

  // ── Step 1 유효성 검사 ────────────────────────────────────────────────────

  const validateStep1 = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    const emailResult = signUpSchema.shape.email.safeParse(formData.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.issues?.[0]?.message ?? emailResult.error.message;
    }

    const nicknameResult = signUpSchema.shape.nickname.safeParse(formData.nickname);
    if (!nicknameResult.success) {
      newErrors.nickname = nicknameResult.error.issues?.[0]?.message ?? nicknameResult.error.message;
    }

    const passwordResult = signUpSchema.shape.password.safeParse(formData.password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.issues?.[0]?.message ?? passwordResult.error.message;
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNextStep = useCallback(() => {
    // 이미 이메일 에러가 있으면 진행 불가
    if (errors.email) return;
    if (validateStep1()) {
      setStep(2);
    }
  }, [errors.email, validateStep1]);

  // ── 회사 규모 카드 선택 ───────────────────────────────────────────────────

  const handleCompanySizeSelect = useCallback((size: CompanySize) => {
    setFormData((prev) => ({ ...prev, companySize: size }));
  }, []);

  // ── 피드 이동 ─────────────────────────────────────────────────────────────

  const handleGoToFeed = useCallback(() => {
    router.push('/feed');
  }, [router]);

  // ── 비회원 DNA 결과 연결 ───────────────────────────────────────────────────

  const linkPendingDnaResult = useCallback(async (userId: string) => {
    const pendingSessionId = localStorage.getItem('pendingSessionId');
    if (!pendingSessionId) return;

    try {
      await fetch('/api/dna/results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: pendingSessionId, user_id: userId }),
      });
      localStorage.removeItem('pendingSessionId');
    } catch {
      // DNA 연결 실패는 조용히 처리 (가입 자체는 성공)
    }
  }, []);

  // ── 가입 완료 제출 ────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const metadata: { industry?: string; company_size?: string } = {};
      if (formData.industry) metadata.industry = formData.industry;
      if (formData.companySize) metadata.company_size = formData.companySize;

      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.nickname,
        metadata
      );

      if (error) {
        const isAlreadyRegistered =
          error.message?.toLowerCase().includes('already registered') ||
          error.message?.toLowerCase().includes('already exists');
        setToast({
          message: isAlreadyRegistered
            ? '이미 가입된 이메일입니다. 로그인을 시도해보세요.'
            : `가입 실패: ${error.message}`,
          type: 'error',
        });
        return;
      }

      const userId = data?.user?.id;
      if (userId) {
        await linkPendingDnaResult(userId);
      }

      setIsCompleted(true);
    } catch {
      setToast({
        message: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, linkPendingDnaResult]);

  // ─────────────────────────────────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      {/* Toast 알림 */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="w-full max-w-md">
        {/* 로고/브랜드 */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-text-primary">Workside</span>
        </div>

        {/* 가입 완료 메시지 */}
        {isCompleted && <CompletionMessage onGoToFeed={handleGoToFeed} />}

        {/* 진행 표시기 — 완료 전에만 표시 */}
        {!isCompleted && <ProgressIndicator step={step} />}

        {/* ── Step 1: 기본 정보 ─────────────────────────────────────────── */}
        {!isCompleted && step === 1 && (
          <div className="space-y-5">
            <h1 className="text-xl font-semibold text-text-primary mb-6">함께 시작해볼까요?</h1>

            {/* 이메일 */}
            <div>
              <InputField
                id="email"
                label="이메일"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange('email')}
                onBlur={handleEmailBlur}
                error={errors.email}
                helperText={emailChecking ? '확인 중...' : undefined}
                autoComplete="email"
                disabled={emailChecking}
              />
            </div>

            {/* 닉네임 */}
            <InputField
              id="nickname"
              label="닉네임"
              type="text"
              placeholder="2~20자"
              value={formData.nickname}
              onChange={handleChange('nickname')}
              onBlur={handleNicknameBlur}
              error={errors.nickname}
              autoComplete="username"
            />

            {/* 비밀번호 */}
            <div>
              <InputField
                id="password"
                label="비밀번호"
                type="password"
                placeholder="8자 이상"
                value={formData.password}
                onChange={handleChange('password')}
                onBlur={handlePasswordBlur}
                error={errors.password}
                autoComplete="new-password"
              />
              <PasswordStrengthBar strength={passwordStrength} />
            </div>

            {/* 비밀번호 확인 */}
            <InputField
              id="passwordConfirm"
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={handleChange('passwordConfirm')}
              onBlur={handlePasswordConfirmBlur}
              error={errors.passwordConfirm}
              autoComplete="new-password"
            />

            {/* 다음 버튼 */}
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-2"
              onClick={handleNextStep}
            >
              다음
            </Button>
          </div>
        )}

        {/* ── Step 2: 온보딩 정보 ───────────────────────────────────────── */}
        {!isCompleted && step === 2 && (
          <div className="space-y-6">
            <h1 className="text-xl font-semibold text-text-primary mb-6">
              조금 더 알려주시면 맞춤 경험을 드릴게요{' '}
              <span className="text-sm font-normal text-text-tertiary">(선택)</span>
            </h1>

            {/* 산업군 드롭다운 */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="industry"
                className="text-sm font-medium text-text-secondary"
              >
                산업군
              </label>
              <select
                id="industry"
                value={formData.industry}
                onChange={handleChange('industry')}
                className={cn(
                  'w-full px-3 py-2 rounded-lg bg-white border border-border',
                  'text-text-primary focus:outline-none focus:ring-2 focus:ring-primary',
                  'transition-all duration-200 min-h-[44px]',
                  'hover:border-text-tertiary',
                  !formData.industry && 'text-text-tertiary'
                )}
              >
                <option value="" disabled>산업군을 선택하세요</option>
                <option value="IT/소프트웨어">IT/소프트웨어</option>
                <option value="금융/보험">금융/보험</option>
                <option value="제조/생산">제조/생산</option>
                <option value="유통/물류">유통/물류</option>
                <option value="서비스업">서비스업</option>
                <option value="교육">교육</option>
                <option value="의료/제약/바이오">의료/제약/바이오</option>
                <option value="건설/부동산">건설/부동산</option>
                <option value="미디어/엔터테인먼트">미디어/엔터테인먼트</option>
                <option value="광고/마케팅">광고/마케팅</option>
                <option value="법률/회계/컨설팅">법률/회계/컨설팅</option>
                <option value="공공/정부/비영리">공공/정부/비영리</option>
                <option value="에너지/환경">에너지/환경</option>
                <option value="외식/식품">외식/식품</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* 회사 규모 카드형 선택 */}
            <div>
              <p className="text-sm font-medium text-text-secondary mb-3">회사 규모</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {companySizeOptions.map(({ value, label, desc, testId }) => {
                  const isSelected = formData.companySize === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      data-testid={testId}
                      aria-pressed={isSelected}
                      onClick={() => handleCompanySizeSelect(value)}
                      className={cn(
                        'rounded-xl p-4 text-left border transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        'min-h-[44px]',
                        isSelected
                          ? 'bg-primary-light border-primary text-text-primary'
                          : 'bg-white border-border text-text-secondary hover:border-text-tertiary hover:text-text-primary'
                      )}
                    >
                      <span className="block text-sm font-semibold">{label}</span>
                      <span className="block text-xs mt-0.5 text-text-tertiary">{desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                건너뛰기
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? '처리 중...' : '가입 완료'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
