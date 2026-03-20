// @TASK P2-R2-T1 - DNA Results share token lookup API
// @SPEC docs/planning/02-trd.md#dna-results

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('dna_results')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '해당 공유 토큰으로 결과를 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: '결과를 조회하는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
