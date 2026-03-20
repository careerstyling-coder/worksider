// @TASK P2-S4-T1 - 공유 수신 페이지 (서버 컴포넌트)
// @SPEC docs/planning/03-user-flow.md#share
// @TEST __tests__/app/share/page.test.tsx

import { createClient } from '@/lib/supabase/server';
import { SharedResultCard } from '@/components/share/SharedResultCard';
import { CTASection } from '@/components/share/CTASection';
import { InvalidSharePage } from '@/components/share/InvalidSharePage';
import { DNAResult } from '@/types/database';

interface SharePageProps {
  params: Promise<{ shareId: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params;

  let result: DNAResult | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('dna_results')
      .select('*')
      .eq('share_token', shareId)
      .single();

    if (!error && data) {
      result = data as DNAResult;
    }
  } catch {
    // 서버 오류 시 result는 null 유지
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <InvalidSharePage />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* 헤더 */}
        <div className="text-center mb-2">
          <span className="text-primary text-xs font-semibold uppercase tracking-widest">
            Work DNA 공유 결과
          </span>
        </div>

        {/* DNA 결과 카드 */}
        <SharedResultCard result={result} />

        {/* CTA 섹션 */}
        <CTASection />
      </div>
    </main>
  );
}
