import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/admin/survey — 정식 설문 배포
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Admin 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { question_id, target_filter } = body;

    if (!question_id) return NextResponse.json({ error: 'question_id is required' }, { status: 400 });

    // 대상자 조회 (필터 기반)
    let query = supabase.from('users').select('id');

    if (target_filter) {
      if (target_filter.industry) query = query.eq('industry', target_filter.industry);
      if (target_filter.company_size) query = query.eq('company_size', target_filter.company_size);
    }

    const { data: targetUsers, error: usersError } = await query;
    if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });
    if (!targetUsers || targetUsers.length === 0) return NextResponse.json({ error: 'No matching users found' }, { status: 400 });

    // survey_targets에 일괄 삽입
    const targets = targetUsers.map(u => ({
      question_id,
      user_id: u.id,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('survey_targets')
      .upsert(targets, { onConflict: 'question_id,user_id' })
      .select();

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    // 질문의 target_filter 업데이트
    await supabase
      .from('questions')
      .update({ target_filter, survey_type: 'formal' })
      .eq('id', question_id);

    return NextResponse.json({
      success: true,
      distributed: inserted?.length || 0,
      total_targets: targetUsers.length,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET /api/admin/survey/preview — 대상자 수 미리보기
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    const industry = url.searchParams.get('industry');
    const company_size = url.searchParams.get('company_size');

    let query = supabase.from('users').select('id', { count: 'exact', head: true });

    if (industry) query = query.eq('industry', industry);
    if (company_size) query = query.eq('company_size', company_size);

    const { count, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
