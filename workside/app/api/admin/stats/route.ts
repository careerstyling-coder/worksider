import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/stats - Dashboard statistics from real DB (admin only)
export async function GET() {
  try {
    const supabase = await createClient();

    // Auth + admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 1. DNA completed count
    const { count: dnaCompleted } = await supabase
      .from('dna_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // 2. Question responses count
    const { count: questionResponses } = await supabase
      .from('question_responses')
      .select('*', { count: 'exact', head: true });

    // 3. Share clicks (participation_history with action_type='share')
    const { count: shareClicks } = await supabase
      .from('participation_history')
      .select('*', { count: 'exact', head: true })
      .eq('action_type', 'share');

    // 4. Total registered users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 5. DNA trend (last 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    const { data: recentSessions } = await supabase
      .from('dna_sessions')
      .select('created_at')
      .eq('status', 'completed')
      .gte('created_at', fourteenDaysAgo)
      .order('created_at', { ascending: true });

    // Group by date
    const trendMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      trendMap[key] = 0;
    }
    if (recentSessions) {
      for (const s of recentSessions) {
        const key = new Date(s.created_at).toISOString().slice(0, 10);
        if (trendMap[key] !== undefined) {
          trendMap[key]++;
        }
      }
    }
    const trendData = Object.entries(trendMap).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      count,
    }));

    return NextResponse.json({
      data: {
        dnaCompleted: dnaCompleted ?? 0,
        questionResponses: questionResponses ?? 0,
        shareClicks: shareClicks ?? 0,
        totalUsers: totalUsers ?? 0,
        trendData,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
