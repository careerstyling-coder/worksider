'use client';

import Link from 'next/link';
import {
  Home, Dna, Share2, UserPlus, User, Rss, MessageCircle,
  BarChart3, Lightbulb, LayoutDashboard, Users, Settings
} from 'lucide-react';

const sections = [
  {
    title: '사용자 화면',
    color: 'bg-primary-light border-primary/20',
    titleColor: 'text-primary',
    links: [
      { href: '/', label: '랜딩 페이지', icon: Home, desc: '메인 랜딩' },
      { href: '/about', label: '서비스 소개', icon: Home, desc: '공감→발견→연결→성장 소개 페이지' },
      { href: '/diagnosis', label: 'DNA 진단', icon: Dna, desc: '세미/풀 진단 설문' },
      { href: '/signup', label: '가입 플로우', icon: UserPlus, desc: 'Step 1/2 가입 폼' },
      { href: '/feed', label: '피드 (메인)', icon: Rss, desc: '질문 + 제안 통합 피드' },
      { href: '/suggest', label: '궁금합니다', icon: Lightbulb, desc: '새 궁금합니다 (로그인 필요)', auth: true },
      { href: '/my-dna', label: '내 DNA', icon: User, desc: '프로필 + 진단 이력 (로그인 필요)', auth: true },
    ],
  },
  {
    title: '관리자 화면 (로그인+관리자 권한 필요)',
    color: 'bg-amber-500/10 border-amber-500/20',
    titleColor: 'text-amber-400',
    links: [
      { href: '/admin', label: '대시보드', icon: LayoutDashboard, desc: '핵심 지표 + 설정', auth: true },
      { href: '/admin/questions', label: '질문 관리', icon: MessageCircle, desc: 'CRUD + 제안 검토', auth: true },
      { href: '/admin/users', label: '사용자 관리', icon: Users, desc: '통계 + 인구통계 + 코호트', auth: true },
    ],
  },
  {
    title: '데모 페이지 (로그인 없이 모든 UI 확인)',
    color: 'bg-emerald-500/10 border-emerald-500/20',
    titleColor: 'text-emerald-400',
    links: [
      { href: '/demo/phase-1/t1-0-ui-components', label: 'UI 컴포넌트', icon: Settings, desc: 'Button, Input, Modal, Toast 등 8개' },
      { href: '/demo/phase-1/t2-admin-menu', label: 'AdminMenu + Layout', icon: LayoutDashboard, desc: '사이드바 + 레이아웃' },
      { href: '/demo/phase-2/t3-1-result-page', label: 'DNA 결과', icon: BarChart3, desc: 'RadarChart + 페르소나 + 점수' },
      { href: '/demo/phase-2/t3-2-share-buttons', label: '공유 버튼', icon: Share2, desc: 'SNS 공유 + 링크 복사' },
      { href: '/demo/phase-2/t4-1-share-page', label: '공유 수신', icon: Share2, desc: '공유 결과 열람 + CTA' },
      { href: '/demo/phase-2/t5-1-signup-form', label: '가입 폼', icon: UserPlus, desc: 'Step 1/2 + 검증' },
      { href: '/demo/phase-2/t5-2-welcome', label: '가입 환영', icon: UserPlus, desc: '환영 메시지 + 다음 단계 선택' },
      { href: '/demo/phase-3/t1-feed-page', label: '피드', icon: Rss, desc: 'FilterTabs + QuestionCard + FAB' },
      { href: '/demo/phase-3/t2-1-question-page', label: '질문 참여', icon: MessageCircle, desc: '옵션 선택 + 제출' },
      { href: '/demo/phase-3/t3-1-question-result', label: '질문 결과', icon: BarChart3, desc: '차트 + 페르소나 분포 + 인사이트' },
      { href: '/demo/phase-3/t4-1-suggest-form', label: '궁금합니다', icon: Lightbulb, desc: '제안 폼 + 최근 제안' },
      { href: '/demo/phase-4/t1-my-dna', label: '내 DNA (프로필)', icon: User, desc: '프로필 + RadarChart + 이력 + 통계' },
      { href: '/demo/phase-5/admin-dashboard', label: '관리자 대시보드', icon: LayoutDashboard, desc: '현황 + 추세 + 사용자 구성 + 목록 + 설정 (통합)' },
      { href: '/demo/phase-5/admin-questions', label: '관리자 질문 관리', icon: MessageCircle, desc: 'CRUD + 궁금합니다 검토 + 배포' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-bg-page">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Workside Sitemap</h1>
          <p className="text-text-secondary mt-2">모든 페이지에 쉽게 접근할 수 있는 인덱스</p>
        </div>

        {sections.map((section) => (
          <section key={section.title} className={`border rounded-xl p-6 mb-8 ${section.color}`}>
            <h2 className={`text-lg font-semibold mb-4 ${section.titleColor}`}>{section.title}</h2>
            <div className="grid gap-3">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-4 p-3 bg-bg-page/60 hover:bg-bg-active rounded-lg transition group"
                >
                  <div className="p-2 bg-bg-active rounded-lg group-hover:bg-bg-active transition">
                    <link.icon size={18} className="text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{link.label}</span>
                      {'auth' in link && link.auth && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">AUTH</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{link.desc}</p>
                  </div>
                  <code className="text-xs text-text-secondary hidden sm:block">{link.href}</code>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="text-center text-text-secondary text-xs mt-8">
          <p>Supabase Studio: <a href="http://127.0.0.1:54323" className="text-primary hover:underline">http://127.0.0.1:54323</a></p>
        </div>
      </div>
    </div>
  );
}
