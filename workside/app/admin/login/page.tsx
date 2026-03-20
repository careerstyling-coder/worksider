'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/client';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Shield } from 'lucide-react';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function AdminLoginPage() {
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
      const { data, error } = await signIn(email, password);

      if (error) {
        setToast({ message: '이메일 또는 비밀번호가 올바르지 않습니다', type: 'error' });
        setIsSubmitting(false);
        return;
      }

      // 로그인 성공 후 admin 역할 확인 (클라이언트에서 직접 조회)
      if (data?.user) {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile || profile.role !== 'admin') {
          await supabase.auth.signOut();
          setToast({ message: '관리자 권한이 없는 계정입니다', type: 'error' });
          setIsSubmitting(false);
          return;
        }
      }

      router.push('/admin');
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
        {/* 로고 + 관리자 표시 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-light mb-4">
            <Shield size={28} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Workside 관리자</h1>
          <p className="mt-1 text-sm text-text-secondary">관리자 계정으로 돌아오세요</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="admin-email"
              label="관리자 이메일"
              type="email"
              placeholder="admin@workside.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <InputField
              id="admin-password"
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
              관리자 로그인
            </Button>
          </form>
        </div>

        {/* 안내 */}
        <p className="mt-4 text-center text-xs text-text-tertiary">
          이 페이지는 관리자 전용입니다.<br />
          일반 사용자 로그인은 <a href="/login" className="text-primary hover:underline">여기</a>를 이용해주세요.
        </p>
      </div>
    </div>
  );
}
