// @TASK P3-S3-T1 - 초대 랜딩 페이지 (SCR-3: ref 파라미터로 InviteBanner 표시)
// @TASK P3-S3-T2 - 초대 랜딩 API 연동 + 추적 (서버사이드 초대자 조회, 클릭 추적)
// @TASK P3-S3-T3 - OG 이미지 동적 생성 (ref 파라미터 기반 og:image 설정)
// @SPEC specs/screens/prelaunch/invite-landing

import type { Metadata } from 'next';
import { HeroSection } from '@/components/prelaunch/HeroSection';
import { DNAIntroSection } from '@/components/prelaunch/DNAIntroSection';
import { PrelaunchFormWrapper } from '@/components/prelaunch/PrelaunchFormWrapper';
import { InviteBanner } from '@/components/prelaunch/InviteBanner';
import { InviteTracker } from '@/components/prelaunch/InviteTracker';
import { createClient } from '@/lib/supabase/server';

interface PrelaunchPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export async function generateMetadata({ searchParams }: PrelaunchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const refCode = params.ref;

  const ogImageUrl = refCode
    ? `/api/og?inviter=${encodeURIComponent(refCode)}`
    : '/api/og';

  const title = refCode
    ? `${refCode}님이 추천하는 Workside`
    : 'Workside - 나의 Work DNA를 분석하세요';

  const description = '나의 일하는 방식을 DNA로 분석하고, 같은 성향의 팀을 연결합니다';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

async function getInviterName(refCode: string): Promise<string | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null;
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('email')
      .eq('invite_code', refCode)
      .single();

    if (error || !data) return null;
    return data.email ?? null;
  } catch {
    return null;
  }
}

export default async function PrelaunchPage({ searchParams }: PrelaunchPageProps) {
  const params = await searchParams;
  const refCode = params.ref;

  // 서버사이드에서 초대자 이름(이메일) 직접 조회
  const inviterName = refCode ? await getInviterName(refCode) : null;

  return (
    <main>
      {inviterName && <InviteBanner inviterName={inviterName} />}
      {/* 클릭 추적: Client 컴포넌트에서 useEffect로 처리 */}
      {refCode && <InviteTracker invite_code={refCode} />}
      <HeroSection />
      <DNAIntroSection />
      <PrelaunchFormWrapper refCode={refCode} />
    </main>
  );
}
