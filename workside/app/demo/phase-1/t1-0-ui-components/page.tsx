// @TASK P1-S0-T3 - UI 컴포넌트 데모 페이지
'use client';

import { useState } from 'react';
import { User, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { PersonaBadge } from '@/components/ui/PersonaBadge';
import { StatCard } from '@/components/ui/StatCard';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export default function UIComponentsDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [skeletonVariant, setSkeletonVariant] = useState<'card' | 'list' | 'grid' | 'chart'>('card');

  const showToast = (type: ToastType) => {
    const messages: Record<ToastType, string> = {
      success: '저장되었습니다.',
      error: '오류가 발생했습니다.',
      warning: '주의가 필요합니다.',
      info: '새 업데이트가 있습니다.',
    };
    setToast({ type, message: messages[type] });
  };

  return (
    <div className="min-h-screen bg-white text-text-primary p-8">
      <h1 className="text-3xl font-bold mb-2">UI 컴포넌트 라이브러리</h1>
      <p className="text-text-secondary mb-10">P1-S0-T3 데모 페이지</p>

      {/* Button */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-primary">Button</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          {(['primary', 'secondary', 'danger', 'outline', 'ghost'] as const).map((v) => (
            <Button key={v} variant={v}>{v}</Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <Button key={s} size={s}>size {s}</Button>
          ))}
        </div>
        <Button loading>Loading...</Button>
      </section>

      {/* InputField */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-primary">InputField</h2>
        <div className="max-w-md space-y-4">
          <InputField label="이메일" type="email" placeholder="you@example.com" />
          <InputField label="비밀번호" type="password" placeholder="••••••••" />
          <InputField label="검색" type="search" placeholder="검색어 입력" />
          <InputField
            label="에러 상태"
            error="올바른 이메일을 입력해주세요."
            defaultValue="invalid"
          />
          <InputField
            label="헬퍼 텍스트"
            helperText="8자 이상 입력해주세요."
            type="password"
          />
        </div>
      </section>

      {/* Modal */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-primary">Modal</h2>
        <Button onClick={() => setModalOpen(true)}>모달 열기</Button>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="코칭 세션 시작"
          actions={[
            { label: '취소', onClick: () => setModalOpen(false), variant: 'secondary' },
            { label: '시작', onClick: () => setModalOpen(false) },
          ]}
        >
          <p>새로운 코칭 세션을 시작하시겠습니까? 페르소나와의 대화가 시작됩니다.</p>
        </Modal>
      </section>

      {/* Toast */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-primary">Toast</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          {(['success', 'error', 'warning', 'info'] as const).map((t) => (
            <Button key={t} variant="secondary" onClick={() => showToast(t)}>{t}</Button>
          ))}
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </section>

      {/* LoadingSpinner */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-primary">LoadingSpinner</h2>
        <div className="flex items-end gap-6">
          <LoadingSpinner size="small" />
          <LoadingSpinner size="medium" />
          <LoadingSpinner size="large" />
        </div>
      </section>

      {/* SkeletonLoader */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-primary">SkeletonLoader</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(['card', 'list', 'grid', 'chart'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setSkeletonVariant(v)}
              className={`px-4 py-2 rounded-lg text-sm ${skeletonVariant === v ? 'bg-primary text-black font-medium' : 'bg-bg-page text-text-primary'}`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="max-w-lg">
          <SkeletonLoader variant={skeletonVariant} />
        </div>
      </section>

      {/* PersonaBadge */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-primary">PersonaBadge</h2>
        <div className="flex flex-wrap gap-3">
          <PersonaBadge label="Neurion" variant="primary" />
          <PersonaBadge label="Cogito" variant="secondary" />
          <PersonaBadge label="Eros" variant="outline" />
          <PersonaBadge label="Socrates" variant="primary" />
        </div>
      </section>

      {/* StatCard */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-primary">StatCard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="총 세션 수"
            value="128"
            subtitle="이번 달"
            icon={<User size={16} />}
            trend={{ direction: 'up', percentage: 12 }}
          />
          <StatCard
            title="평균 만족도"
            value="4.8"
            subtitle="5점 만점"
            icon={<BarChart2 size={16} />}
            trend={{ direction: 'up', percentage: 5 }}
          />
          <StatCard
            title="활성 클라이언트"
            value="34"
            trend={{ direction: 'neutral', percentage: 0 }}
          />
          <StatCard
            title="취소율"
            value="3.2%"
            trend={{ direction: 'down', percentage: 8 }}
          />
        </div>
      </section>
    </div>
  );
}
