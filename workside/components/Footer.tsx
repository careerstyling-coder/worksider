'use client';

import Link from 'next/link';
import { Twitter, Facebook, Linkedin } from 'lucide-react';

interface FooterProps {
  showLinks?: boolean;
}

export default function Footer({ showLinks = true }: FooterProps) {
  return (
    <footer className="bg-white border-t border-divider py-10 px-6" data-testid="footer">
      <div className="mx-auto max-w-5xl">
        {showLinks && (
          <div className="grid gap-8 sm:grid-cols-3 mb-8">
            <div>
              <h4 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-3">About</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-[15px] text-text-secondary hover:text-text-primary transition">회사 소개</Link></li>
                <li><Link href="#" className="text-[15px] text-text-secondary hover:text-text-primary transition">Press</Link></li>
                <li><Link href="#" className="text-[15px] text-text-secondary hover:text-text-primary transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-[15px] text-text-secondary hover:text-text-primary transition">개인정보처리방침</Link></li>
                <li><Link href="#" className="text-[15px] text-text-secondary hover:text-text-primary transition">이용약관</Link></li>
                <li><Link href="#" className="text-[15px] text-text-secondary hover:text-text-primary transition">문의</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-3">Social</h4>
              <div className="flex gap-2" data-testid="social-links">
                <a href="#" className="p-2 text-text-secondary hover:bg-bg-hover rounded-full transition" aria-label="Twitter"><Twitter size={18} /></a>
                <a href="#" className="p-2 text-text-secondary hover:bg-bg-hover rounded-full transition" aria-label="Facebook"><Facebook size={18} /></a>
                <a href="#" className="p-2 text-text-secondary hover:bg-bg-hover rounded-full transition" aria-label="LinkedIn"><Linkedin size={18} /></a>
              </div>
            </div>
          </div>
        )}
        <div className="border-t border-divider pt-6 text-center">
          <p className="text-[13px] text-text-tertiary">&copy; 2026 Workside. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
