// @TASK P3-S4-T1 - 리워드 상태 컴포넌트
// @SPEC specs/screens/prelaunch/my-reservation

interface Reward {
  type: string;
  status: string;
  unlocked_at?: string;
}

interface RewardStatusProps {
  rewards: Reward[];
}

const REWARD_LABELS: Record<string, string> = {
  early_adopter_badge: '얼리어답터 배지',
  priority_access: '풀 진단 우선 접근',
};

const REWARD_DESCRIPTIONS: Record<string, string> = {
  early_adopter_badge: '5명 초대 달성 시 지급되는 특별 배지',
  priority_access: '정식 오픈 시 진단 우선 이용권',
};

export function RewardStatus({ rewards }: RewardStatusProps) {
  // 표시할 리워드 타입 순서 고정
  const displayTypes = ['early_adopter_badge', 'priority_access'];

  const getReward = (type: string) =>
    rewards.find((r) => r.type === type) ?? { type, status: 'locked' };

  return (
    <div
      data-testid="reward-status"
      className="bg-bg-secondary border border-white/10 rounded-2xl p-6"
    >
      <h2 className="text-white font-semibold mb-4">리워드 현황</h2>
      <div className="flex flex-col gap-3">
        {displayTypes.map((type) => {
          const reward = getReward(type);
          const isUnlocked = reward.status === 'unlocked';

          return (
            <div
              key={type}
              data-status={reward.status}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                isUnlocked
                  ? 'border-accent-neon/40 bg-accent-neon/5'
                  : 'border-white/10 bg-white/5 opacity-60'
              }`}
            >
              {/* 잠금 아이콘 */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isUnlocked
                    ? 'bg-accent-neon text-black'
                    : 'bg-white/10 text-white/40'
                }`}
                aria-hidden="true"
              >
                {isUnlocked ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`font-semibold text-sm ${
                    isUnlocked ? 'text-white' : 'text-white/50'
                  }`}
                >
                  {REWARD_LABELS[type] ?? type}
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {REWARD_DESCRIPTIONS[type] ?? ''}
                </p>
              </div>

              {isUnlocked && (
                <span className="text-xs font-semibold text-accent-neon bg-accent-neon/10 px-2 py-1 rounded-full shrink-0">
                  획득
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
