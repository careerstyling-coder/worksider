// @TASK P2-S5-T2 - 가입 플로우 데모 페이지 (Supabase Auth 연동)

import SignupPage from '@/app/signup/page';

export default function DemoPage() {
  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 border-b border-border px-4 py-2">
        <p className="text-xs text-text-secondary">
          Demo: P2-S5-T2 Signup Form — Supabase Auth + 리다이렉트
          &nbsp;|&nbsp; 기능: signUp() 호출, 완료 메시지, 3초 후 /feed 이동, DNA 연결
        </p>
      </div>
      <div className="pt-10">
        <SignupPage />
      </div>
    </div>
  );
}
