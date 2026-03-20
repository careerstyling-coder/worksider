// @TASK P2-R2-T1 - DNA Results CRUD API (list/filter)
// @SPEC docs/planning/02-trd.md#dna-results

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const userId = searchParams.get('user_id');

    if (!sessionId && !userId) {
      return NextResponse.json(
        { error: 'session_id 또는 user_id 파라미터가 필요합니다' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const filterKey = sessionId ? 'session_id' : 'user_id';
    const filterValue = sessionId ?? userId;

    const { data, error } = await supabase
      .from('dna_results')
      .select('*')
      .eq(filterKey, filterValue!)
      .order('created_at', { ascending: false });

    if (error) {
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
