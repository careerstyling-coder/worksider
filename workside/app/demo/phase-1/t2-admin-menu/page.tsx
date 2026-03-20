// @TASK P1-S0-T2 - AdminMenu + SidebarLayout + FullWidthLayout 데모
'use client';

import { useState } from 'react';
import { AdminMenu } from '@/components/AdminMenu';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { FullWidthLayout } from '@/components/layouts/FullWidthLayout';

type DemoState = 'sidebar-dashboard' | 'sidebar-questions' | 'sidebar-users' | 'sidebar-settings' | 'fullwidth-sm' | 'fullwidth-md' | 'fullwidth-lg' | 'fullwidth-xl' | 'fullwidth-full';

const ROUTES: Record<string, string> = {
  'sidebar-dashboard': '/admin',
  'sidebar-questions': '/admin/questions',
  'sidebar-users': '/admin/users',
  'sidebar-settings': '/admin/settings',
};

const FULLWIDTH_SIZES = ['sm', 'md', 'lg', 'xl', 'full'] as const;

export default function DemoPage() {
  const [state, setState] = useState<DemoState>('sidebar-dashboard');

  const isSidebarState = state.startsWith('sidebar-');
  const isFullWidthState = state.startsWith('fullwidth-');
  const activeRoute = isSidebarState ? ROUTES[state] : '/admin';
  const fullWidthSize = isFullWidthState
    ? (state.replace('fullwidth-', '') as 'sm' | 'md' | 'lg' | 'xl' | 'full')
    : 'md';

  return (
    <div className="min-h-screen bg-bg-page">
      {/* 상태 선택기 */}
      <div className="fixed top-0 right-0 z-50 p-4 bg-bg-page border-l border-b border-border rounded-bl-xl max-w-xs">
        <p className="text-xs text-text-tertiary mb-2 font-medium uppercase tracking-widest">Demo State</p>

        <div className="mb-3">
          <p className="text-xs text-text-tertiary mb-1">AdminMenu (SidebarLayout)</p>
          <div className="flex flex-wrap gap-1">
            {(['sidebar-dashboard', 'sidebar-questions', 'sidebar-users', 'sidebar-settings'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  state === s
                    ? 'bg-primary text-black font-semibold'
                    : 'bg-bg-page text-text-secondary hover:bg-bg-active'
                }`}
              >
                {s.replace('sidebar-', '')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-text-tertiary mb-1">FullWidthLayout</p>
          <div className="flex flex-wrap gap-1">
            {FULLWIDTH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setState(`fullwidth-${size}` as DemoState)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  state === `fullwidth-${size}`
                    ? 'bg-primary text-black font-semibold'
                    : 'bg-bg-page text-text-secondary hover:bg-bg-active'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 컴포넌트 렌더링 */}
      {isSidebarState && (
        <SidebarLayout
          sidebar={<AdminMenu activeRoute={activeRoute} />}
        >
          <div className="p-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {state.replace('sidebar-', '').charAt(0).toUpperCase() + state.replace('sidebar-', '').slice(1)}
            </h1>
            <p className="text-text-secondary">
              Active route: <code className="text-primary">{activeRoute}</code>
            </p>
            <div className="mt-6 p-4 bg-bg-page border border-border rounded-xl">
              <p className="text-sm text-text-tertiary">Main content area (flex-1)</p>
            </div>
          </div>
        </SidebarLayout>
      )}

      {isFullWidthState && (
        <div className="pt-24 px-4">
          <FullWidthLayout maxWidth={fullWidthSize}>
            <div className="bg-bg-page border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                FullWidthLayout — maxWidth: <span className="text-primary">{fullWidthSize}</span>
              </h2>
              <p className="text-text-secondary text-sm">
                mx-auto + px-4 sm:px-6 lg:px-8 + max-w-{fullWidthSize}
              </p>
              <div className="mt-4 h-16 bg-white rounded-lg flex items-center justify-center">
                <span className="text-text-tertiary text-sm">Content block</span>
              </div>
            </div>
          </FullWidthLayout>
        </div>
      )}

      {/* 상태 정보 */}
      <div className="fixed bottom-4 right-4 z-50">
        <pre className="text-xs bg-bg-page border border-border rounded-lg p-3 text-text-secondary">
          {JSON.stringify({ state, activeRoute: isSidebarState ? activeRoute : undefined, fullWidthSize: isFullWidthState ? fullWidthSize : undefined }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
