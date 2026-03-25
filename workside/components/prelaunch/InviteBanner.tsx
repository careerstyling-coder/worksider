// @TASK P3-S3-T1 - 초대 랜딩 배너 컴포넌트
// @SPEC specs/screens/prelaunch/invite-landing
// @TEST __tests__/components/prelaunch/invite-landing.test.tsx

interface InviteBannerProps {
  inviterName?: string;
}

export function InviteBanner({ inviterName }: InviteBannerProps) {
  if (!inviterName) return null;

  return (
    <div
      data-testid="invite-banner"
      className="w-full bg-orange-500/20 border border-orange-400/40 text-orange-300 py-3 px-6 text-center text-sm font-medium"
    >
      <span className="mr-2">🎉</span>
      {inviterName}님이 초대했어요!
    </div>
  );
}
