// @TASK P2-S2-T1 - 예약 완료 웰컴 메시지 컴포넌트
// @SPEC specs/screens/prelaunch/reserved

interface WelcomeMessageProps {
  queuePosition: number;
}

export function WelcomeMessage({ queuePosition }: WelcomeMessageProps) {
  return (
    <div className="text-center py-6">
      <div className="text-4xl mb-3">🎉</div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">예약이 완료되었습니다!</h1>
      <p className="text-slate-500 text-lg">
        첫 500명 중{' '}
        <span className="text-indigo-600 font-bold text-3xl">
          {queuePosition}번
        </span>
        째 입니다
      </p>
    </div>
  );
}
