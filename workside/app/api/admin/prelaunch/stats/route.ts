// @TASK P4-S5-T2 - 관리자 사전예약 집계 API (SCR-5)
// @SPEC specs/screens/prelaunch/scr-5-admin-prelaunch.md
// @TEST __tests__/api/admin/prelaunch.test.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Period = 'today' | 'this_week' | 'this_month';

function getPeriodRange(period: Period): { from: string } {
  const now = new Date();
  let from: Date;

  if (period === 'today') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === 'this_week') {
    const day = now.getDay(); // 0=Sun
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  } else {
    // this_month
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { from: from.toISOString() };
}

// GET /api/admin/prelaunch/stats?period={today|this_week|this_month}
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // Admin role check
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') ?? 'this_week') as Period;
    const { from } = getPeriodRange(period);

    // 1. Total reservations
    const { count: total_reservations } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', from);

    // 2. Invite conversion rate
    const { data: inviteData } = await supabase
      .from('invite_tracking')
      .select('status')
      .gte('created_at', from);

    const totalClicks = inviteData?.length ?? 0;
    const converted = inviteData?.filter((r: { status: string }) => r.status === 'converted').length ?? 0;
    const invite_conversion_rate = totalClicks > 0 ? converted / totalClicks : 0;

    // 3. Badge count (early_adopter_badge, unlocked)
    const { count: badge_count } = await supabase
      .from('rewards')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unlocked')
      .eq('type', 'early_adopter_badge')
      .gte('created_at', from);

    // 4. Average invites per inviter
    const { data: allInvites } = await supabase
      .from('invite_tracking')
      .select('inviter_id')
      .gte('created_at', from);

    let avg_invites = 0;
    if (allInvites && allInvites.length > 0) {
      const inviterCounts: Record<string, number> = {};
      for (const inv of allInvites) {
        const id = (inv as { inviter_id: string }).inviter_id;
        inviterCounts[id] = (inviterCounts[id] ?? 0) + 1;
      }
      const counts = Object.values(inviterCounts);
      avg_invites = counts.length > 0
        ? counts.reduce((a, b) => a + b, 0) / counts.length
        : 0;
      avg_invites = Math.round(avg_invites * 10) / 10;
    }

    // 5. Daily stats (group by date)
    const { data: dailyRaw } = await supabase
      .from('reservations')
      .select('created_at')
      .gte('created_at', from)
      .order('created_at', { ascending: true });

    const dailyMap: Record<string, number> = {};
    for (const row of (dailyRaw ?? [])) {
      const key = new Date((row as { created_at: string }).created_at)
        .toISOString()
        .slice(0, 10);
      dailyMap[key] = (dailyMap[key] ?? 0) + 1;
    }
    const daily_stats = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    // 6. Industry distribution
    const { data: industryRaw } = await supabase
      .from('reservations')
      .select('industry')
      .gte('created_at', from);

    const industryMap: Record<string, number> = {};
    for (const row of (industryRaw ?? [])) {
      const ind = (row as { industry: string }).industry ?? '기타';
      industryMap[ind] = (industryMap[ind] ?? 0) + 1;
    }
    const industry_distribution = Object.entries(industryMap)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);

    // 7. Experience distribution
    const { data: expRaw } = await supabase
      .from('reservations')
      .select('experience_years')
      .gte('created_at', from);

    const expMap: Record<string, number> = {};
    for (const row of (expRaw ?? [])) {
      const exp = (row as { experience_years: string }).experience_years ?? '기타';
      expMap[exp] = (expMap[exp] ?? 0) + 1;
    }
    const totalExp = Object.values(expMap).reduce((a, b) => a + b, 0);
    const experience_distribution = Object.entries(expMap).map(([range, count]) => ({
      range,
      count,
      percentage: totalExp > 0 ? Math.round((count / totalExp) * 100) : 0,
    }));

    // 8. Top 10 inviters
    const { data: topRaw } = await supabase
      .from('invite_tracking')
      .select('inviter_id')
      .eq('status', 'converted')
      .gte('created_at', from);

    const topMap: Record<string, number> = {};
    for (const row of (topRaw ?? [])) {
      const id = (row as { inviter_id: string }).inviter_id;
      topMap[id] = (topMap[id] ?? 0) + 1;
    }
    const top_inviters = Object.entries(topMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([inviter_id, successful_invites], i) => ({
        rank: i + 1,
        inviter_id,
        successful_invites,
      }));

    return NextResponse.json({
      data: {
        total_reservations: total_reservations ?? 0,
        invite_conversion_rate: Math.round(invite_conversion_rate * 1000) / 1000,
        badge_count: badge_count ?? 0,
        avg_invites,
        daily_stats,
        industry_distribution,
        experience_distribution,
        top_inviters,
      },
    });
  } catch (err) {
    console.error('[admin/prelaunch/stats]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
