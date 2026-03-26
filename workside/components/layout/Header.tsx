// @TASK P2-S0-T1 - 프리론칭 페이지 공통 Header
// @SPEC docs/planning/prelaunch/layout

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <nav className="mx-auto flex max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
        <Link href="/prelaunch" className="text-xl font-bold text-gray-900">
          workside
        </Link>
      </nav>
    </header>
  );
}
