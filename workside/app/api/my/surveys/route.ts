import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/my/surveys — 나에게 온 설문 목록
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('survey_targets')
      .select(`
        id,
        question_id,
        responded_at,
        created_at,
        questions:question_id (id, title, status, deadline, survey_type, participant_count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
