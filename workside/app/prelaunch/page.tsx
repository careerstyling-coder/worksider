// @TASK P2-S1-T1 - 프리론칭 랜딩 페이지
// @SPEC specs/screens/prelaunch/landing

import { HeroSection } from '@/components/prelaunch/HeroSection';
import { DNAIntroSection } from '@/components/prelaunch/DNAIntroSection';
import { PrelaunchFormWrapper } from '@/components/prelaunch/PrelaunchFormWrapper';

export default function PrelaunchPage() {
  return (
    <main>
      <HeroSection />
      <DNAIntroSection />
      <PrelaunchFormWrapper />
    </main>
  );
}
