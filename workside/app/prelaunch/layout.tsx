// @TASK P2-S0-T1 - Prelaunch 전용 레이아웃
// @SPEC docs/planning/prelaunch/layout

import SingleColumnLayout from '@/components/layout/SingleColumnLayout';

interface PrelaunchLayoutProps {
  children: React.ReactNode;
}

export default function PrelaunchLayout({ children }: PrelaunchLayoutProps) {
  return <SingleColumnLayout>{children}</SingleColumnLayout>;
}
