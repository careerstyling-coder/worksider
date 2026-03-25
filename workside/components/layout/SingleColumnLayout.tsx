// @TASK P2-S0-T1 - 단일 컬럼 레이아웃 (Header + children + Footer)
// @SPEC docs/planning/prelaunch/layout

import Header from './Header';
import Footer from './Footer';

interface SingleColumnLayoutProps {
  children: React.ReactNode;
}

export default function SingleColumnLayout({ children }: SingleColumnLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
