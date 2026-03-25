// @TASK P2-S2-T1 - 초대 현황 프로그레스바 컴포넌트
// @SPEC specs/screens/prelaunch/reserved

interface InviteProgressBarProps {
  current?: number;
  total?: number;
}

export function InviteProgressBar({
  current = 0,
  total = 5,
}: InviteProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const isComplete = current >= total;

  return (
    <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-semibold">친구 초대 현황</span>
        <span className="text-white/70 text-sm">{current}/{total}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
        <div
          data-testid="progress-fill"
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete
              ? 'bg-green-500 complete'
              : 'bg-accent-neon'
          }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
      <p className="mt-3 text-white/50 text-sm">
        5명 초대하면 얼리어답터 배지를 받을 수 있습니다
      </p>
    </div>
  );
}
