'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SuggestionDetail {
  id: string;
  title: string;
  background: string | null;
  status: string;
  shout_out_count: number;
  created_at: string;
  user_id: string;
}

export default function SuggestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [suggestion, setSuggestion] = useState<SuggestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouted, setShouted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/suggestions/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestion(data.data);
        }
      } catch {
        // 에러 무시
      } finally {
        setLoading(false);
      }
    }
    if (params.id) load();
  }, [params.id]);

  const handleShoutOut = useCallback(async () => {
    if (!suggestion) return;
    try {
      const res = await fetch(`/api/suggestions/${suggestion.id}/shout-out`, { method: 'POST' });
      if (res.ok) {
        setSuggestion(prev => prev ? { ...prev, shout_out_count: prev.shout_out_count + 1 } : prev);
        setShouted(true);
      }
    } catch {}
  }, [suggestion]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bg-active border-t-primary animate-spin" />
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-secondary mb-4">해당 글을 찾을 수 없습니다.</p>
          <Link href="/feed" className="text-primary hover:underline text-[15px]">피드로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-page">
      {/* 상단 네비게이션 */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-2xl flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.back()} className="p-2 text-text-secondary hover:bg-bg-hover rounded-md transition" aria-label="뒤로가기">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[15px] font-semibold text-text-primary">궁금합니다</h1>
        </div>
      </header>

      {/* 콘텐츠 */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <article className="bg-white rounded-lg border border-border p-6">
          {/* 제목 */}
          <h2 className="text-xl font-bold text-text-primary leading-snug">
            {suggestion.title}
          </h2>

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 mt-3 text-sm text-text-tertiary">
            <span className="flex items-center gap-1">
              <User size={14} />
              익명
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(suggestion.created_at).toLocaleDateString('ko-KR')}
            </span>
          </div>

          {/* 배경 설명 */}
          {suggestion.background && (
            <div className="mt-5 pt-5 border-t border-divider">
              <p className="text-[15px] text-text-primary leading-relaxed whitespace-pre-wrap">
                {suggestion.background}
              </p>
            </div>
          )}

          {/* Shout out 영역 */}
          <div className="mt-6 pt-5 border-t border-divider flex items-center justify-between">
            <Button
              variant={shouted ? 'primary' : 'outline'}
              size="md"
              onClick={handleShoutOut}
              disabled={shouted}
            >
              <Megaphone size={16} />
              {shouted ? 'Shout out 완료!' : 'Shout out'}
              <span className="font-bold">{suggestion.shout_out_count}</span>
            </Button>

            <p className="text-xs text-text-tertiary">
              shout out이 많을수록 더 많은 사람에게 노출됩니다
            </p>
          </div>
        </article>

        {/* 피드로 돌아가기 */}
        <div className="mt-4 text-center">
          <Link href="/feed" className="text-sm text-text-secondary hover:text-primary transition">
            ← 피드로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
