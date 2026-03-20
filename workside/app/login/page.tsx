'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/supabase/auth';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const validate = useCallback(() => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = '이메일을 입력해주세요';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = '유효한 이메일을 입력해주세요';
    if (!password) newErrors.password = '비밀번호를 입력해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setToast({ message: '이메일 또는 비밀번호가 올바르지 않습니다', type: 'error' });
      } else {
        router.push('/feed');
      }
    } catch {
      setToast({ message: '네트워크 오류가 발생했습니다', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, validate, router]);

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center px-4 py-16">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-primary">Workside</Link>
          <p className="mt-2 text-text-secondary text-[15px]">다시 만나서 반가워요</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="email"
              label="이메일"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <InputField
              id="password"
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isSubmitting}
            >
              로그인
            </Button>
          </form>
        </div>

        {/* 가입 안내 */}
        <div className="mt-4 text-center bg-white rounded-lg border border-border p-4 shadow-sm">
          <p className="text-[15px] text-text-secondary">
            아직 함께하고 있지 않으신가요?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              가입하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
