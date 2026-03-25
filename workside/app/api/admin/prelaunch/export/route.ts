// @TASK P4-S5-T2 - 관리자 사전예약 CSV 내보내기 API (SCR-5)
// @SPEC specs/screens/prelaunch/scr-5-admin-prelaunch.md
// @TEST __tests__/api/admin/prelaunch.test.ts

import { createClient } from '@/lib/supabase/server';

type Period = 'today' | 'this_week' | 'this_month';

function getPeriodFrom(period: Period): string {
  const now = new Date();
  let from: Date;

  if (period === 'today') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === 'this_week') {
    const day = now.getDay();
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  } else {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return from.toISOString();
}

function toCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          // Escape double quotes and wrap in quotes if needed
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\n');
}

// GET /api/admin/prelaunch/export?period={period}
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const body = JSON.stringify({ error: '인증이 필요합니다' });
      return new Response(body, {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Admin role check
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      const body = JSON.stringify({ error: '관리자 권한이 필요합니다' });
      return new Response(body, {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') ?? 'this_week') as Period;
    const from = getPeriodFrom(period);

    // Fetch reservations
    const { data: reservations } = await supabase
      .from('reservations')
      .select('id, email, industry, experience_years, created_at, queue_position, invite_code')
      .gte('created_at', from)
      .order('created_at', { ascending: true });

    // Fetch invite tracking
    const { data: invites } = await supabase
      .from('invite_tracking')
      .select('inviter_id, status, created_at')
      .gte('created_at', from);

    // Build invite count map
    const inviteCountMap: Record<string, { total: number; converted: number }> = {};
    for (const inv of (invites ?? [])) {
      const row = inv as { inviter_id: string; status: string };
      if (!inviteCountMap[row.inviter_id]) {
        inviteCountMap[row.inviter_id] = { total: 0, converted: 0 };
      }
      inviteCountMap[row.inviter_id].total++;
      if (row.status === 'converted') {
        inviteCountMap[row.inviter_id].converted++;
      }
    }

    // Build CSV rows — reservations sheet
    const reservationHeaders = ['ID', '이메일', '업종', '경력', '예약일', '대기순번', '초대코드', '발송초대수', '전환초대수'];
    const reservationRows = (reservations ?? []).map((r) => {
      const row = r as {
        id: string;
        email: string;
        industry: string;
        experience_years: string;
        created_at: string;
        queue_position: number;
        invite_code: string;
      };
      const inviteStats = inviteCountMap[row.id] ?? { total: 0, converted: 0 };
      return [
        row.id,
        row.email,
        row.industry,
        row.experience_years,
        new Date(row.created_at).toLocaleDateString('ko-KR'),
        String(row.queue_position),
        row.invite_code ?? '',
        String(inviteStats.total),
        String(inviteStats.converted),
      ];
    });

    const csvContent = toCsv([reservationHeaders, ...reservationRows]);

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="prelaunch-report-${period}.csv"`,
      },
    });
  } catch (err) {
    console.error('[admin/prelaunch/export]', err);
    const body = JSON.stringify({ error: '서버 오류가 발생했습니다' });
    return new Response(body, {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
