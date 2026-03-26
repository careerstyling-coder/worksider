// @TASK P2-S0-T1 - Prelaunch 전용 레이아웃
// @SPEC docs/planning/prelaunch/layout

import SingleColumnLayout from '@/components/layout/SingleColumnLayout';
import { KakaoSDK } from '@/components/prelaunch/KakaoSDK';

interface PrelaunchLayoutProps {
  children: React.ReactNode;
}

export default function PrelaunchLayout({ children }: PrelaunchLayoutProps) {
  return (
    <>
      <KakaoSDK />
      <SingleColumnLayout>{children}</SingleColumnLayout>
    </>
  );
}
