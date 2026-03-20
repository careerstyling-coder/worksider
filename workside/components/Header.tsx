'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';

interface HeaderProps {
  showAuthButtons?: boolean;
  activeRoute?: string;
}

const USER_MENU_ITEMS = [
  { label: '내 DNA', href: '/my-dna' },
  { label: '피드', href: '/feed' },
];

export default function Header({ showAuthButtons = true }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 h-14">
        <Link href="/" className="text-xl font-bold text-primary">
          Workside
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {showAuthButtons ? (
            <>
              <Link href="/login" className="px-4 py-2 text-[15px] font-medium text-text-secondary hover:bg-bg-hover rounded-md transition">
                로그인
              </Link>
              <Link href="/diagnosis" className="px-4 py-2 text-[15px] font-semibold text-white bg-primary hover:bg-primary-hover rounded-md transition">
                진단 시작
              </Link>
            </>
          ) : (
            <div className="relative" data-testid="user-menu">
              <button
                data-testid="user-menu-button"
                onClick={() => setDropdownOpen(p => !p)}
                className="flex items-center gap-1 px-3 py-2 text-[15px] font-medium text-text-primary hover:bg-bg-hover rounded-md transition"
              >
                사용자
                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-border shadow-lg py-1">
                  {USER_MENU_ITEMS.map(item => (
                    <Link key={item.href} href={item.href} className="block px-4 py-2.5 text-[15px] text-text-primary hover:bg-bg-hover" onClick={() => setDropdownOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                  <hr className="my-1 border-divider" />
                  <button className="w-full text-left px-4 py-2.5 text-[15px] text-text-primary hover:bg-bg-hover" onClick={() => setDropdownOpen(false)}>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="md:hidden p-2 text-text-secondary hover:bg-bg-hover rounded-md transition"
          onClick={() => setMobileOpen(p => !p)}
          aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-divider bg-white px-4 py-2">
          {showAuthButtons ? (
            <>
              <Link href="/login" className="block px-3 py-2.5 text-[15px] text-text-primary hover:bg-bg-hover rounded-md" onClick={() => setMobileOpen(false)}>돌아오기</Link>
              <Link href="/diagnosis" className="block px-3 py-2.5 text-[15px] font-semibold text-white bg-primary hover:bg-primary-hover rounded-md mt-1" onClick={() => setMobileOpen(false)}>나를 발견하기</Link>
            </>
          ) : (
            <>
              {USER_MENU_ITEMS.map(item => (
                <Link key={item.href} href={item.href} className="block px-3 py-2.5 text-[15px] text-text-primary hover:bg-bg-hover rounded-md" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <button className="w-full text-left px-3 py-2.5 text-[15px] text-text-primary hover:bg-bg-hover rounded-md" onClick={() => setMobileOpen(false)}>로그아웃</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
