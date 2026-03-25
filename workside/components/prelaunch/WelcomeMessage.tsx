// @TASK P2-S2-T1 - 예약 완료 웰컴 메시지 컴포넌트
// @SPEC specs/screens/prelaunch/reserved

interface WelcomeMessageProps {
  queuePosition: number;
}

export function WelcomeMessage({ queuePosition }: WelcomeMessageProps) {
  return (
    <div className="text-center py-8">
      <h1 className="text-3xl font-bold text-white mb-4">예약되었습니다!</h1>
      <p className="text-white/70 text-lg">
        첫 500명 중{' '}
        <span className="text-accent-neon font-bold text-4xl">
          {queuePosition}번
        </span>
        입니다
      </p>
    </div>
  );
}
