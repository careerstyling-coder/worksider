// @TASK P3-S4-T1 - 예약 순번 표시 컴포넌트
// @SPEC specs/screens/prelaunch/my-reservation

interface QueuePositionProps {
  position: number;
}

export function QueuePosition({ position }: QueuePositionProps) {
  return (
    <div
      data-testid="queue-position"
      className="bg-bg-secondary border border-white/10 rounded-2xl p-6 text-center"
    >
      <p className="text-white/50 text-sm mb-2">나의 예약 순번</p>
      <span className="text-7xl font-bold text-accent-neon block leading-none">
        {position}
      </span>
      <p className="text-white/40 text-sm mt-2">번째 예약자</p>
    </div>
  );
}
