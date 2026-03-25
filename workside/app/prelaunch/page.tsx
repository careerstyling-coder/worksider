// @TASK P3-S3-T1 - 초대 랜딩 페이지 (SCR-3: ref 파라미터로 InviteBanner 표시)
// @SPEC specs/screens/prelaunch/invite-landing

import { HeroSection } from '@/components/prelaunch/HeroSection';
import { DNAIntroSection } from '@/components/prelaunch/DNAIntroSection';
import { PrelaunchFormWrapper } from '@/components/prelaunch/PrelaunchFormWrapper';
import { InviteBanner } from '@/components/prelaunch/InviteBanner';

interface PrelaunchPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function PrelaunchPage({ searchParams }: PrelaunchPageProps) {
  const params = await searchParams;
  const refCode = params.ref;

  // ref 코드가 있으면 초대자명으로 사용 (실제 서비스에서는 API로 조회)
  // 현재는 ref 코드 자체를 초대자명으로 표시 (추후 API 연동)
  const inviterName = refCode || undefined;

  return (
    <main>
      {inviterName && <InviteBanner inviterName={inviterName} />}
      <HeroSection />
      <DNAIntroSection />
      <PrelaunchFormWrapper refCode={refCode} />
    </main>
  );
}
